import { createClient } from 'npm:@supabase/supabase-js@2.35.0'
import * as dotenv from 'npm:dotenv@16.1.4'

dotenv.config()

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file')
  Deno.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper to pause execution
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
  try {
    // 1. Sign up a new test user
    const email = `test.${Date.now()}@test.com`
    const password = 'Password123!'
    
    console.log('1. Signing up test user:', email)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    })

    if (signUpError) {
      console.error('Sign up error:', signUpError)
      return
    }

    const user = signUpData.user
    if (!user) {
      console.error('No user data returned from sign up')
      return
    }

    console.log('User created:', {
      id: user.id,
      email: user.email
    })

    // Wait a moment before proceeding
    await wait(1000)

    // 2. Try to insert an artist
    console.log('\n2. Inserting test artist')
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .insert({
        auth_uid: user.id,
        name: 'Test Artist',
        country: 'US'
      })
      .select()
      .single()

    if (artistError) {
      console.error('Error inserting artist:', artistError)
    } else {
      console.log('Artist inserted:', artist)
    }

    // 3. Try to read the artist back
    console.log('\n3. Reading inserted artist')
    const { data: artists, error: readError } = await supabase
      .from('artists')
      .select('*')
      .eq('auth_uid', user.id)

    if (readError) {
      console.error('Error reading artists:', readError)
    } else {
      console.log('Artists found:', artists)
    }

    console.log('\nTest completed')

  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

main()