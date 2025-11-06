import React, { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { supabase } from './supabaseClient'
import SignIn from './components/SignIn'
import Artists from './components/Artists'
import UpdatePassword from './components/UpdatePassword'
import Profile from './components/Profile'
import { EnvCheck } from './components/EnvCheck'

export default function App() {
  const [session, setSession] = useState(null)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)
  const [currentView, setCurrentView] = useState('artists') // 'artists' or 'profile'

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
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#00703c',
            color: '#fff',
            padding: '16px',
            fontSize: '16px',
          },
          success: {
            iconTheme: {
              primary: '#00703c',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              background: '#d4351c',
            },
            iconTheme: {
              primary: '#d4351c',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="govuk-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <h1 className="govuk-heading-xl">Supabase RLS Demo</h1>
        <EnvCheck />
        {!session ? (
          <SignIn />
        ) : isPasswordRecovery ? (
          <UpdatePassword />
        ) : (
          <div>
            <nav style={{ 
              marginBottom: 30, 
              paddingBottom: 15, 
              borderBottom: '2px solid #1d70b8' 
            }}>
              <button 
                type="button" 
                onClick={() => setCurrentView('artists')}
                className={currentView === 'artists' ? 'govuk-button' : 'govuk-button govuk-button--secondary'}
                style={{ marginRight: 10, marginBottom: 0 }}
              >
                Artists
              </button>
              <button 
                type="button" 
                onClick={() => setCurrentView('profile')}
                className={currentView === 'profile' ? 'govuk-button' : 'govuk-button govuk-button--secondary'}
                style={{ marginRight: 10, marginBottom: 0 }}
              >
                Profile
              </button>
              <button 
                type="button" 
                onClick={() => supabase.auth.signOut()}
                className="govuk-button govuk-button--warning"
                style={{ marginBottom: 0 }}
              >
                Sign Out
              </button>
            </nav>
            
            {currentView === 'artists' ? (
              <Artists session={session} />
            ) : (
              <Profile session={session} />
            )}
          </div>
        )}
      </div>
    </>
  )
}
