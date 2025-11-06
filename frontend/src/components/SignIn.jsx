import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showSignUp, setShowSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

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

    console.log('Starting sign up process...')

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: 'https://supabasetest-six.vercel.app'
      }
    })

    console.log('Sign up response:', { data, error })

    if (error) {
      console.error('Sign up error:', error)
      setMessage({ type: 'error', text: error.message })
    } else if (data?.user?.identities?.length === 0) {
      console.log('Email already registered')
      setMessage({ 
        type: 'warning',
        text: 'This email is already registered. Please sign in instead.'
      })
      setShowSignUp(false)
    } else if (data?.user) {
      console.log('Sign up successful, email confirmation required')
      setMessage({ 
        type: 'success',
        text: '✅ Sign up successful! Please check your email for the confirmation link. Check your spam folder if you don\'t see it.'
      })
      setShowSignUp(false)
      setEmail('')
      setPassword('')
    } else {
      console.error('Unexpected response:', data)
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      })
    }
    
    setLoading(false)
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    console.log('Requesting password reset for:', email)

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://supabasetest-six.vercel.app'
    })

    console.log('Password reset response:', { data, error })

    if (error) {
      console.error('Password reset error:', error)
      setMessage({ type: 'error', text: error.message })
    } else {
      console.log('Password reset email sent successfully')
      setMessage({ 
        type: 'success',
        text: '✅ Password reset email sent! Please check your email (including spam folder) for the reset link.'
      })
      setEmail('')
    }

    setLoading(false)
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setMessage({ type: '', text: '' })

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://supabasetest-six.vercel.app'
      }
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    }
  }

  if (showForgotPassword) {
    return (
      <div style={{ maxWidth: 420 }}>
        <h2>Reset Password</h2>
        <form onSubmit={handleForgotPassword}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Email</label>
            <input 
              type="email"
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              placeholder="Enter your email address"
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button 
              type="button"
              onClick={() => {
                setShowForgotPassword(false)
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
              Back to Sign In
            </button>
          </div>
          {message.text && (
            <div 
              style={{ 
                marginTop: 16,
                padding: 12,
                borderRadius: 4,
                backgroundColor: message.type === 'error' ? '#fee2e2' : 
                              message.type === 'success' ? '#dcfce7' : 'transparent',
                color: message.type === 'error' ? '#dc2626' :
                       message.type === 'success' ? '#16a34a' : 'inherit'
              }}
            >
              {message.text}
            </div>
          )}
        </form>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>{showSignUp ? 'Create Account' : 'Sign In'}</h2>
      
      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: 'white',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        Continue with Google
      </button>

      <div style={{ 
        textAlign: 'center', 
        margin: '20px 0',
        color: '#6b7280',
        fontSize: '14px',
        position: 'relative'
      }}>
        <span style={{ 
          backgroundColor: 'white', 
          padding: '0 10px',
          position: 'relative',
          zIndex: 1
        }}>
          OR
        </span>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          backgroundColor: '#e5e7eb',
          zIndex: 0
        }}></div>
      </div>

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
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6b7280'
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
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
        {!showSignUp && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true)
                setMessage({ type: '', text: '' })
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Forgot password?
            </button>
          </div>
        )}
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
