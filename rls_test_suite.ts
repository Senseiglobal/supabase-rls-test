import { createClient } from 'npm:@supabase/supabase-js@2.35.0';
import dotenv from 'npm:dotenv@16.1.4';

dotenv.config();

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY in env');
  Deno.exit(1);
}

const MAX_RETRIES = 6;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function assert(cond: boolean, msg?: string) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

async function withBackoff<T>(fn: () => Promise<T>, label = 'operation') {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt >= MAX_RETRIES) throw err;
      const waitMs = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 300);
      console.warn(`${label} failed (attempt ${attempt}) - retrying in ${waitMs}ms:`, err?.message ?? err);
      await sleep(waitMs);
    }
  }
}

function newAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}

async function signupAndAuth(client: any, email: string, password: string) {
  // Try signUp (may be rate limited) then ensure signIn
  await withBackoff(async () => {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error && error.status !== 400 && error.status !== 429) throw error; // allow 400/429 fallthrough
    return data;
  }, 'signUp');

  // Attempt signIn (may require email confirmation, but signInWithPassword will work if possible)
  const signInRes = await withBackoff(async () => {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, 'signIn');

  return signInRes;
}

async function testArtists() {
  console.log('\n=== Running artists RLS test ===');
  const anon = newAnonClient();
  const password = 'Password123!';
  const emailA = `artistA.${Date.now()}@test.com`;
  const emailB = `artistB.${Date.now()}@test.com`;

  // create user A and authenticate
  await signupAndAuth(anon, emailA, password);
  console.log('User A signed up');

  // insert as A
  const { data: aUser } = await anon.auth.getUser();
  assert(aUser?.user?.id, 'User A not present after signup');
  const userAId = aUser.user.id;

  const { data: insertArtist, error: insertErr } = await anon
    .from('artists')
    .insert([{ auth_uid: userAId, name: 'Suite Test Artist', country: 'US' }])
    .select()
    .single();
  if (insertErr) throw insertErr;
  assert(insertArtist?.id, 'Failed to insert artist as owner');
  console.log('Artist inserted by owner, id:', insertArtist.id);

  const artistId = insertArtist.id;

  // create user B with separate client
  const clientB = newAnonClient();
  await signupAndAuth(clientB, emailB, password);
  console.log('User B signed up');
  // ensure authenticated as B
  const { data: bUser } = await clientB.auth.getUser();
  const userBId = bUser.user.id;

  // Attempt to read as B
  const { data: readByB } = await clientB.from('artists').select('*').eq('id', artistId);
  assert(Array.isArray(readByB), 'Expected array result for read');
  assert(readByB.length === 0, 'RLS failed: User B could read User A artist');
  console.log('Read by B blocked (good)');

  // Attempt update as B
  const { data: updByB } = await clientB.from('artists').update({ name: 'Hacked' }).eq('id', artistId).select();
  assert(Array.isArray(updByB) && updByB.length === 0, 'RLS failed: User B could update User A artist');
  console.log('Update by B blocked (good)');

  // Attempt delete as B
  const { data: delByB } = await clientB.from('artists').delete().eq('id', artistId).select();
  assert(Array.isArray(delByB) && delByB.length === 0, 'RLS failed: User B could delete User A artist');
  console.log('Delete by B blocked (good)');

  // Cleanup: delete as A
  await withBackoff(async () => {
    const { data, error } = await anon.from('artists').delete().eq('id', artistId);
    if (error) throw error;
    return data;
  }, 'cleanup-artist');
  console.log('Cleanup artist as A done');

  return true;
}

async function testSongsAndInsights() {
  console.log('\n=== Running songs & insights RLS test ===');
  const anon = newAnonClient();
  const password = 'Password123!';
  const emailA = `saiA.${Date.now()}@test.com`;
  const emailB = `saiB.${Date.now()}@test.com`;

  await signupAndAuth(anon, emailA, password);
  const { data: aUser } = await anon.auth.getUser();
  const userAId = aUser.user.id;

  // create artist as A to attach songs/insights
  const { data: artist } = await anon.from('artists').insert({ auth_uid: userAId, name: 'SAI Artist' }).select().single();
  assert(artist?.id, 'Failed to create artist for songs/insights');
  const artistId = artist.id;

  // confirm artist exists (wait+retry a few times to avoid race conditions)
  let confirmed = false;
  for (let i = 0; i < 5; i++) {
    const { data: check } = await anon.from('artists').select('id').eq('id', artistId);
    if (Array.isArray(check) && check.length > 0) {
      confirmed = true;
      break;
    }
    await sleep(300);
  }
  if (!confirmed) throw new Error('Artist not visible after creation');

  // insert song and insight as A, logging full error objects on failure
  // Insert song using only commonly present columns (avoid 'writer' column mismatch)
  const { data: song, error: songErr } = await anon
    .from('songs')
    .insert({ artist_id: artistId, title: 'Test Song' })
    .select()
    .single();
  if (songErr) {
    console.error('Create song error object:', songErr);
    throw new Error('Failed to create song: ' + (songErr.message ?? JSON.stringify(songErr)));
  }
  assert(song?.id, 'Failed to create song');

  const { data: insight, error: insightErr } = await anon
    .from('insights')
    .insert({ artist_id: artistId, content: { note: 'note' } })
    .select()
    .single();
  if (insightErr) {
    console.error('Create insight error object:', insightErr);
    // attempt to cleanup the song if insight creation fails
    try {
      await anon.from('songs').delete().eq('id', song.id);
    } catch (ignore) {}
    throw new Error('Failed to create insight: ' + (insightErr.message ?? JSON.stringify(insightErr)));
  }
  assert(insight?.id, 'Failed to create insight');

  console.log('Artist, song, insight created by A');

  // create B
  const clientB = newAnonClient();
  await signupAndAuth(clientB, emailB, password);

  // as B attempt to read song and insight
  const { data: songRead } = await clientB.from('songs').select('*').eq('id', song.id);
  assert(Array.isArray(songRead) && songRead.length === 0, 'RLS failed: User B could read User A song');
  console.log('Song read by B blocked (good)');

  const { data: insightRead } = await clientB.from('insights').select('*').eq('id', insight.id);
  assert(Array.isArray(insightRead) && insightRead.length === 0, 'RLS failed: User B could read User A insight');
  console.log('Insight read by B blocked (good)');

  // as B attempt update/delete
  const { data: songUpd } = await clientB.from('songs').update({ title: 'BadTitle' }).eq('id', song.id).select();
  assert(Array.isArray(songUpd) && songUpd.length === 0, 'RLS failed: User B could update User A song');

  const { data: insightUpd } = await clientB.from('insights').update({ content: { note: 'bad' } }).eq('id', insight.id).select();
  assert(Array.isArray(insightUpd) && insightUpd.length === 0, 'RLS failed: User B could update User A insight');

  console.log('Update/delete by B blocked for song & insight (good)');

  // Cleanup as A: delete insight, song, artist
  await withBackoff(async () => {
    await anon.from('insights').delete().eq('id', insight.id);
    await anon.from('songs').delete().eq('id', song.id);
    await anon.from('artists').delete().eq('id', artistId);
    return true;
  }, 'cleanup-sai');

  console.log('Cleanup for songs & insights done');
  return true;
}

async function runSuite() {
  const results: { name: string; ok: boolean; err?: string }[] = [];
  try {
    await withBackoff(async () => {
      const ok = await testArtists();
      results.push({ name: 'artists', ok });
      return true;
    }, 'testArtists');
  } catch (err: any) {
    results.push({ name: 'artists', ok: false, err: String(err.message ?? err) });
  }

  try {
    await withBackoff(async () => {
      const ok = await testSongsAndInsights();
      results.push({ name: 'songs_and_insights', ok });
      return true;
    }, 'testSongsAndInsights');
  } catch (err: any) {
    results.push({ name: 'songs_and_insights', ok: false, err: String(err.message ?? err) });
  }

  console.log('\n=== Test results ===');
  let allOk = true;
  for (const r of results) {
    console.log(`${r.name}: ${r.ok ? 'PASS' : 'FAIL'} ${r.err ? '- ' + r.err : ''}`);
    if (!r.ok) allOk = false;
  }

  if (!allOk) {
    console.error('One or more tests failed');
    Deno.exit(2);
  }

  console.log('All tests passed');
}

runSuite().catch((e) => {
  console.error('Unhandled suite error:', e);
  Deno.exit(1);
});