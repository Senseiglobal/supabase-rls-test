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

async function main() {
  try {
    // Try to sign up
    const email = `test.${Date.now()}@test.com`
    const password = 'Password123!'
    
    console.log('Attempting to sign up with:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'Test User'
        }
      }
    })

    if (error) {
      console.error('Sign up error:', error)
      return
    }

    console.log('Sign up successful:', {
      id: data.user?.id,
      email: data.user?.email,
      created_at: data.user?.created_at
    })

  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

main()