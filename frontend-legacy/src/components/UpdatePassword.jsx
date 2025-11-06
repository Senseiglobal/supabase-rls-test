import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPassword, setShowPassword] = useState(false)

  async function handleUpdatePassword(e) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' })
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    } else {
      setMessage({ 
        type: 'success',
        text: '✅ Password updated successfully! Redirecting to sign in...'
      })
      setPassword('')
      setConfirmPassword('')
      
      // Sign out and redirect after showing success message
      setTimeout(async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
      }, 2000)
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 className="govuk-heading-l">Set New Password</h2>
      <p className="govuk-body">Please enter your new password below.</p>
      <form onSubmit={handleUpdatePassword}>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="new-password">New Password</label>
          <div className="govuk-password-input">
            <input 
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="govuk-input govuk-password-input__input"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="govuk-password-input__toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="confirm-password">Confirm New Password</label>
          <input 
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="govuk-input"
            placeholder="Confirm new password"
          />
        </div>
        <div>
          <button 
            type="submit" 
            disabled={loading}
            className="govuk-button"
            style={{ width: '100%' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
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
