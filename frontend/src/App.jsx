import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import SignIn from './components/SignIn'
import Artists from './components/Artists'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener?.subscription?.unsubscribe()
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Supabase RLS demo (frontend)</h1>
      {!session ? (
        <SignIn />
      ) : (
        <div>
          <button onClick={() => supabase.auth.signOut()}>Sign out</button>
          <Artists session={session} />
        </div>
      )}
    </div>
  )
}
