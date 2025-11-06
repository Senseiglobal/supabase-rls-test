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
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 24 }}>
      <h2>Set New Password</h2>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>
        Please enter your new password below.
      </p>
      <form onSubmit={handleUpdatePassword}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>New Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', paddingRight: '40px' }}
              placeholder="Enter new password"
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
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Confirm New Password</label>
          <input 
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            placeholder="Confirm new password"
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
              cursor: loading ? 'wait' : 'pointer',
              width: '100%'
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
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
