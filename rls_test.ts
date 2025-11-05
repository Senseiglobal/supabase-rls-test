// rls_test.ts
import { createClient } from 'npm:@supabase/supabase-js@2.35.0';
import dotenv from 'npm:dotenv@16.1.4';

dotenv.config();

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY in env');
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// Helper to pause
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  // 1) Sign up a test user (or sign in if already exists)
  const testPassword = 'Password123!';

  const randomId = Math.random().toString(36).substring(7);
  const testEmail = `test.${randomId}@gmail.com`;
  console.log('Signing up test user:', testEmail);
  
  const { data: signData, error: signError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signError) {
    console.error('Sign up error:', signError);
    return;
  }

  // Give some time for the signup process
  console.log('Waiting for signup to process...');
  await wait(2000);

  let user = signData?.user ?? null;

  if (!user) {
    console.log('Signing in existing user');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    if (signInError) {
      console.error('Sign-in error:', signInError);
      return;
    }
    user = signInData.user;
  }

  if (!user) {
    console.error('Could not obtain user session');
    return;
  }

  console.log('User signed in with id:', user.id);

  // Give auth system a moment to finalize (sometimes immediate DB checks can fail)
  await wait(1000);

  // 2) Run SELECT on artists owned by this user
  console.log('\n1) SELECT artists owned by user');
  const { data: artists, error: artistsErr } = await supabase
    .from('artists')
    .select('*')
    .eq('auth_uid', user.id);

  if (artistsErr) {
    console.error('Error selecting artists:', artistsErr);
  } else {
    console.log('Artists:', artists);
  }

  // 3) INSERT an artist for this user
  console.log('\n2) INSERT artist for user');
  const { data: insertArtist, error: insertErr } = await supabase
    .from('artists')
    .insert([{ auth_uid: user.id, name: 'Scripted Test Artist', country: 'US' }])
    .select()
    .single();

  if (insertErr) {
    console.error('Insert artist error:', insertErr);
  } else {
    console.log('Inserted artist:', insertArtist);
  }

  const artistId = insertArtist?.id;
  if (!artistId) {
    console.error('No artist id returned; aborting further tests.');
    return;
  }

  // 4) INSERT insight and song linked to the artist
  console.log('\n3) INSERT insight and song for that artist');
  const { data: insightData, error: insightErr } = await supabase
    .from('insights')
    .insert([{ artist_id: artistId, content: { note: 'Created by test script' } }])
    .select()
    .single();

  if (insightErr) console.error('Insert insight error:', insightErr);
  else console.log('Inserted insight:', insightData);

  const { data: songData, error: songErr } = await supabase
    .from('songs')
    .insert([{ artist_id: artistId, title: 'Script Test Song', writer: 'Script' }])
    .select()
    .single();

  if (songErr) console.error('Insert song error:', songErr);
  else console.log('Inserted song:', songData);

  // 5) Attempt to UPDATE the artist (should succeed)
  console.log('\n4) UPDATE artist name (should succeed)');
  const { data: updData, error: updErr } = await supabase
    .from('artists')
    .update({ name: 'Script Updated Artist' })
    .eq('id', artistId)
    .select()
    .single();

  if (updErr) console.error('Update error:', updErr);
  else console.log('Updated artist:', updData);

  // 6) Attempt to SELECT someone else's artist by id (expect 0 rows)
  console.log('\n5) Attempt to read another user\'s artist by id (should return none)');
  // Replace this with a known non-owned artist id if you have one; leave intentionally bogus
  const otherArtistId = '00000000-0000-0000-0000-000000000002';
  const { data: otherArtist, error: otherErr } = await supabase
    .from('artists')
    .select('*')
    .eq('id', otherArtistId);

  if (otherErr) console.error('Select other artist error:', otherErr);
  else console.log('Other artist result (should be empty):', otherArtist);

  // 7) Attempt DELETE of the insight we created (should succeed)
  console.log('\n6) DELETE insight created by script (should succeed)');
  const createdInsightId = insightData?.id;
  if (createdInsightId) {
    const { data: delInsight, error: delInsightErr } = await supabase
      .from('insights')
      .delete()
      .eq('id', createdInsightId)
      .select();

    if (delInsightErr) console.error('Delete insight error:', delInsightErr);
    else console.log('Deleted insight:', delInsight);
  } else {
    console.log('No insight id to delete.');
  }

  // 8) Cleanup: delete song and artist created by script
  console.log('\n7) Cleanup: delete song and artist created');
  if (songData?.id) {
    await supabase.from('songs').delete().eq('id', songData.id);
    console.log('Deleted song id', songData.id);
  }
  await supabase.from('artists').delete().eq('id', artistId);
  console.log('Deleted artist id', artistId);

  console.log('\nRLS authenticated tests complete.');
}

main().catch((err) => {
  console.error('Unhandled error', err);
});