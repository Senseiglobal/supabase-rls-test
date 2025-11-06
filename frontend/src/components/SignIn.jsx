import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showSignUp, setShowSignUp] = useState(false)

  async function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setMessage({ 
          type: 'warning',
          text: 'Please check your email and click the confirmation link before signing in.'
        })
      } else {
        setMessage({ type: 'error', text: error.message })
      }
    }
    
    setLoading(false)
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setMessage({ 
        type: 'warning',
        text: 'This email is already registered. Please sign in instead.'
      })
      setShowSignUp(false)
    } else {
      setMessage({ 
        type: 'success',
        text: 'Success! Please check your email for the confirmation link.'
      })
      setEmail('')
      setPassword('')
    }
    
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>{showSignUp ? 'Create Account' : 'Sign In'}</h2>
      <form onSubmit={showSignUp ? handleSignUp : handleSignIn}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Email</label>
          <input 
            type="email"
            required
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Password</label>
          <input 
            type="password"
            required
            minLength={6}
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : (showSignUp ? 'Sign Up' : 'Sign In')}
          </button>
          <button 
            type="button"
            onClick={() => {
              setShowSignUp(!showSignUp)
              setMessage({ type: '', text: '' })
            }}
            style={{ 
              marginLeft: 8,
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #3b82f6',
              color: '#3b82f6',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
        {message.text && (
          <div 
            style={{ 
              marginTop: 16,
              padding: 12,
              borderRadius: 4,
              backgroundColor: message.type === 'error' ? '#fee2e2' : 
                            message.type === 'success' ? '#dcfce7' : 
                            message.type === 'warning' ? '#fff7ed' : 'transparent',
              color: message.type === 'error' ? '#dc2626' :
                     message.type === 'success' ? '#16a34a' :
                     message.type === 'warning' ? '#ea580c' : 'inherit'
            }}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  )
}
