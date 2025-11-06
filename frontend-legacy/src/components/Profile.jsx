import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Profile({ session }) {
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      const { data, error, status } = await supabase
        .from('profiles')
        .select('full_name, username, website, avatar_url')
        .eq('id', session.user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFullName(data.full_name || '')
        setUsername(data.username || '')
        setWebsite(data.website || '')
        setAvatarUrl(data.avatar_url || '')
      }
    } catch (error) {
      setMsg('Error loading profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(e) {
    e.preventDefault()
    try {
      setLoading(true)
      setMsg(null)

      const updates = {
        id: session.user.id,
        full_name: fullName,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error
      setMsg('Profile updated successfully!')
    } catch (error) {
      setMsg('Error updating profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function uploadAvatar(event) {
    try {
      setUploading(true)
      setMsg(null)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      setAvatarUrl(data.publicUrl)
      setMsg('Avatar uploaded successfully! Click "Update Profile" to save.')
    } catch (error) {
      setMsg('Error uploading avatar: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 className="govuk-heading-l">Your Profile</h2>

      {msg && (
        <div 
          className={`govuk-notification-banner ${
            msg.includes('Error') ? 'govuk-notification-banner--error' : 
            'govuk-notification-banner--success'
          }`}
          style={{ marginBottom: 20 }}
        >
          {msg}
        </div>
      )}

      <div style={{ marginBottom: 30, textAlign: 'center' }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            style={{
              borderRadius: '50%',
              width: 150,
              height: 150,
              objectFit: 'cover',
              border: '3px solid #1d70b8'
            }}
          />
        ) : (
          <div
            style={{
              borderRadius: '50%',
              width: 150,
              height: 150,
              backgroundColor: '#f3f2f1',
              border: '3px solid #b1b4b6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              fontSize: 48,
              color: '#505a5f'
            }}
          >
            {session.user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div style={{ marginTop: 15 }}>
          <label className="govuk-button govuk-button--secondary" style={{ cursor: 'pointer', marginBottom: 0 }}>
            {uploading ? 'Uploading...' : 'Upload Avatar'}
            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <form onSubmit={updateProfile}>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="text"
            value={session.user.email}
            disabled
            className="govuk-input"
            style={{ backgroundColor: '#f3f2f1', cursor: 'not-allowed' }}
          />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="govuk-input"
          />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="govuk-input"
          />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="website">
            Website
          </label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="govuk-input"
            placeholder="https://example.com"
          />
        </div>

        <div style={{ marginTop: 30 }}>
          <button 
            type="submit" 
            className="govuk-button" 
            disabled={loading}
            style={{ marginRight: 10 }}
          >
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
          
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/'
            }}
            className="govuk-button govuk-button--secondary"
          >
            Sign Out
          </button>
        </div>
      </form>
    </div>
  )
}
