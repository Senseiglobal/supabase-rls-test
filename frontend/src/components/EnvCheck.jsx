import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function EnvCheck() {
  const [status, setStatus] = useState('Checking...')

  useEffect(() => {
    async function checkConnection() {
      try {
        // Try to get the Supabase session to verify the connection
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus(`❌ Error: ${error.message}`)
          console.error('Supabase connection error:', error)
          return
        }

        // Try to query the public schema version to verify URL and anon key
        const { data, error: queryError } = await supabase
          .from('artists')
          .select('id')
          .limit(1)

        if (queryError) {
          setStatus(`⚠️ Environment configured but query failed: ${queryError.message}`)
          console.error('Query error:', queryError)
          return
        }

        setStatus('✅ Environment properly configured!')
      } catch (err) {
        setStatus(`❌ Unexpected error: ${err.message}`)
        console.error('Unexpected error:', err)
      }
    }

    checkConnection()
  }, [])

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '1rem', 
      right: '1rem',
      padding: '0.5rem 1rem',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      borderRadius: '4px',
      fontSize: '14px'
    }}>
      {status}
    </div>
  )
}