import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import SignIn from './components/SignIn'
import Artists from './components/Artists'
import UpdatePassword from './components/UpdatePassword'
import { EnvCheck } from './components/EnvCheck'

export default function App() {
  const [session, setSession] = useState(null)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    // Check if this is a password recovery link
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const type = hashParams.get('type')
    
    if (type === 'recovery') {
      setIsPasswordRecovery(true)
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      
      // Reset password recovery flag when user signs out
      if (_event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false)
      }
    })
    return () => listener?.subscription?.unsubscribe()
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Supabase RLS demo (frontend)</h1>
      <EnvCheck />
      {!session ? (
        <SignIn />
      ) : isPasswordRecovery ? (
        <UpdatePassword />
      ) : (
        <div>
          <button type="button" onClick={() => supabase.auth.signOut()}>Sign out</button>
          <Artists session={session} />
        </div>
      )}
    </div>
  )
}
