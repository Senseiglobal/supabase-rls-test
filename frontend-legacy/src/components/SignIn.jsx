import React, { useState } from 'react'
import { Visibility, VisibilityOff } from '@mui/icons-material'
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
      <div style={{ maxWidth: 600 }}>
        <h2 className="govuk-heading-l">Reset Password</h2>
        <p className="govuk-body">Enter your email address and we'll send you a link to reset your password.</p>
        <form onSubmit={handleForgotPassword}>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="reset-email">Email address</label>
            <input 
              id="reset-email"
              type="email"
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="govuk-input"
              placeholder="Enter your email address"
            />
          </div>
          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="govuk-button"
              style={{ marginRight: 10 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button 
              type="button"
              onClick={() => {
                setShowForgotPassword(false)
                setMessage({ type: '', text: '' })
              }}
              className="govuk-button govuk-button--secondary"
            >
              Back to Sign In
            </button>
          </div>
          {message.text && (
            <div 
              className={`govuk-notification-banner ${
                message.type === 'error' ? 'govuk-notification-banner--error' : 
                'govuk-notification-banner--success'
              }`}
              style={{ marginTop: 20 }}
            >
              {message.text}
            </div>
          )}
        </form>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 className="govuk-heading-l">{showSignUp ? 'Create Account' : 'Sign In'}</h2>
      
      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="govuk-button govuk-button--secondary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" 
          style={{ marginTop: 30, marginBottom: 30 }} />

      <form onSubmit={showSignUp ? handleSignUp : handleSignIn}>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="email">Email</label>
          <input 
            id="email"
            type="email"
            required
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="govuk-input"
            autoComplete="email"
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="password">Password</label>
          <div className="govuk-password-input">
            <input 
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="govuk-input govuk-password-input__input"
              autoComplete={showSignUp ? "new-password" : "current-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="govuk-password-input__toggle icon-button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ 
                background: 'none',
                border: 'none',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showPassword ? (
                <VisibilityOff style={{ fontSize: 20, color: '#505a5f' }} />
              ) : (
                <Visibility style={{ fontSize: 20, color: '#505a5f' }} />
              )}
            </button>
          </div>
        </div>
        <div>
          <button 
            type="submit" 
            disabled={loading}
            className="govuk-button"
            style={{ marginRight: 10 }}
          >
            {loading ? 'Loading...' : (showSignUp ? 'Sign Up' : 'Sign In')}
          </button>
          <button 
            type="button"
            onClick={() => {
              setShowSignUp(!showSignUp)
              setMessage({ type: '', text: '' })
            }}
            className="govuk-button govuk-button--secondary"
          >
            {showSignUp ? 'Already have an account?' : 'Need an account?'}
          </button>
        </div>
        {!showSignUp && (
          <div style={{ marginTop: 15 }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setShowForgotPassword(true)
                setMessage({ type: '', text: '' })
              }}
              className="govuk-link"
            >
              Forgot password?
            </a>
          </div>
        )}
        {message.text && (
          <div 
            className={`govuk-notification-banner ${
              message.type === 'error' ? 'govuk-notification-banner--error' : 
              message.type === 'success' ? 'govuk-notification-banner--success' : 
              'govuk-notification-banner--warning'
            }`}
            style={{ marginTop: 20 }}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  )
}
