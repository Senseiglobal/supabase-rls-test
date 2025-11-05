import { createClient } from 'npm:@supabase/supabase-js@2.35.0';
import dotenv from 'npm:dotenv@16.1.4';

dotenv.config();

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY in env');
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function signup(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

async function signin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

async function main() {
  try {
    const password = 'Password123!';

    // Create User A
    const emailA = `userA.${Date.now()}@test.com`;
    console.log('Signing up user A:', emailA);
    const userA = await signup(emailA, password);
    console.log('User A id:', userA?.id);

    await wait(800);

    // Insert an artist as User A
    console.log('\nInserting artist as User A');
    const { data: artistData, error: insertErr } = await supabase
      .from('artists')
      .insert([{ auth_uid: userA!.id, name: 'User A Artist', country: 'US' }])
      .select()
      .single();

    if (insertErr) {
      console.error('Insert error (User A):', insertErr);
      return;
    }

    const artistId = artistData?.id;
    console.log('Artist created id:', artistId);

    // Create User B
    const emailB = `userB.${Date.now()}@test.com`;
    console.log('\nSigning up user B:', emailB);
    // To ensure separate session, create a new client instance for B
    const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

    const { data: signBData, error: signBErr } = await clientB.auth.signUp({ email: emailB, password });
    if (signBErr) {
      console.error('Sign up error (User B):', signBErr);
      return;
    }
    console.log('User B id:', signBData.user?.id);

    await wait(800);

    // Now, using clientB (authenticated as B), attempt to read the artist by id
    console.log('\nAttempting to read User A artist as User B (should be empty or blocked)');
    // sign in user B to ensure session
    const { data: signInBData, error: signInBErr } = await clientB.auth.signInWithPassword({ email: emailB, password });
    if (signInBErr) {
      console.error('Sign in error (User B):', signInBErr);
      return;
    }

    const { data: otherArtist, error: otherErr } = await clientB
      .from('artists')
      .select('*')
      .eq('id', artistId);

    console.log('Read result (User B):', otherArtist);
    if (otherErr) console.log('Read error (User B):', otherErr.message || otherErr);

    // Attempt to update the artist as User B
    console.log('\nAttempting to update User A artist as User B (should be blocked)');
    const { data: updData, error: updErr } = await clientB
      .from('artists')
      .update({ name: 'Hacked by B' })
      .eq('id', artistId)
      .select();

    console.log('Update result (User B):', updData);
    if (updErr) console.log('Update error (User B):', updErr.message || updErr);

    // Attempt to delete the artist as User B
    console.log('\nAttempting to delete User A artist as User B (should be blocked)');
    const { data: delData, error: delErr } = await clientB
      .from('artists')
      .delete()
      .eq('id', artistId)
      .select();

    console.log('Delete result (User B):', delData);
    if (delErr) console.log('Delete error (User B):', delErr.message || delErr);

    // Cleanup: sign in as User A and delete created artist
    console.log('\nCleaning up: deleting artist as User A');
    const { data: signInAData, error: signInAErr } = await supabase.auth.signInWithPassword({ email: emailA, password });
    if (signInAErr) {
      console.error('Sign in error (User A) for cleanup:', signInAErr);
    } else {
      const { error: cleanupErr } = await supabase.from('artists').delete().eq('id', artistId);
      if (cleanupErr) console.error('Cleanup delete error:', cleanupErr);
      else console.log('Cleanup deleted artist id', artistId);
    }

    console.log('\nOther-user RLS test complete.');
  } catch (err) {
    console.error('Unhandled error in test:', err);
  }
}

main().catch((e) => console.error(e));