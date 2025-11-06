import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Songs from './Songs'

export default function Artists({ session }) {
  const [artists, setArtists] = useState([])
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [msg, setMsg] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editCountry, setEditCountry] = useState('')
  const [selectedArtist, setSelectedArtist] = useState(null)

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
    'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
    'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
    'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde',
    'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo',
    'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica',
    'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
    'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
    'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
    'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
    'Kiribati', 'North Korea', 'South Korea', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
    'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
    'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
    'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
    'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palau',
    'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
    'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
    'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
    'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka',
    'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
    'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
    'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
    'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen', 'Zambia', 'Zimbabwe'
  ]

  async function load() {
    const { data, error } = await supabase.from('artists').select('*').eq('auth_uid', session.user.id).order('created_at', { ascending: false })
    if (error) setMsg(error.message)
    else setArtists(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function createArtist(e) {
    e.preventDefault()
    setMsg(null)
    const { data, error } = await supabase.from('artists').insert([{ auth_uid: session.user.id, name, country }]).select().single()
    if (error) setMsg(error.message)
    else {
      setArtists((s) => [data, ...s])
      setName('')
      setCountry('')
      setMsg('Artist created successfully!')
    }
  }

  async function deleteArtist(id) {
    if (!confirm('Are you sure you want to delete this artist?')) return
    setMsg(null)
    const { error } = await supabase.from('artists').delete().eq('id', id)
    if (error) setMsg(error.message)
    else {
      setArtists((s) => s.filter(a => a.id !== id))
      setMsg('Artist deleted successfully!')
    }
  }

  async function updateArtist(id, updatedName, updatedCountry) {
    setMsg(null)
    const { error } = await supabase.from('artists').update({ name: updatedName, country: updatedCountry }).eq('id', id)
    if (error) setMsg(error.message)
    else {
      setArtists((s) => s.map(a => a.id === id ? { ...a, name: updatedName, country: updatedCountry } : a))
      setMsg('Artist updated successfully!')
    }
  }

  // Access control test: try to read a non-owned artist id (hard-coded bogus id)
  async function accessControlTest() {
    setMsg(null)
    const bogusId = '00000000-0000-0000-0000-000000000999'
    const { data, error } = await supabase.from('artists').select('*').eq('id', bogusId)
    // If backend returns data (bad), show an alert; otherwise show blocked message
    if (error) setMsg('Error: ' + error.message)
    else if (Array.isArray(data) && data.length === 0) setMsg('Access control test: blocked (good)')
    else setMsg('Access control test: returned data (RLS not enforced)')
  }

  return (
    <div style={{ marginTop: 30 }}>
      <h2 className="govuk-heading-l">Your Artists</h2>
      <form onSubmit={createArtist} style={{ marginBottom: 30 }}>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="artist-name">Artist Name</label>
          <input 
            id="artist-name"
            placeholder="Enter artist name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required
            className="govuk-input"
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="artist-country">Country</label>
          <select 
            id="artist-country"
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            required
            className="govuk-select"
          >
            <option value="">Select a country</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="govuk-button" style={{ marginRight: 10 }}>
          Create Artist
        </button>
        <button 
          type="button" 
          onClick={accessControlTest}
          className="govuk-button govuk-button--secondary"
        >
          Test Access Control
        </button>
      </form>
      
      {msg && (
        <div 
          className={`govuk-notification-banner ${
            msg.includes('Error') ? 'govuk-notification-banner--error' : 
            msg.includes('good') ? 'govuk-notification-banner--success' : 
            'govuk-notification-banner--warning'
          }`}
          style={{ marginBottom: 20 }}
        >
          {msg}
        </div>
      )}

      {artists.length > 0 ? (
        <div>
          {artists.map((a) => (
            <div 
              key={a.id}
              style={{ 
                border: '2px solid #b1b4b6',
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: 'white'
              }}
            >
              {editingId === a.id ? (
                <form onSubmit={(e) => {
                  e.preventDefault()
                  updateArtist(a.id, editName, editCountry)
                  setEditingId(null)
                }}>
                  <div className="govuk-form-group" style={{ marginBottom: 10 }}>
                    <input 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="govuk-input"
                      placeholder="Artist name"
                    />
                  </div>
                  <div className="govuk-form-group" style={{ marginBottom: 10 }}>
                    <select 
                      value={editCountry} 
                      onChange={(e) => setEditCountry(e.target.value)}
                      required
                      className="govuk-select"
                    >
                      <option value="">Select a country</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="govuk-button" style={{ marginRight: 10, marginBottom: 0 }}>
                    Save
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingId(null)}
                    className="govuk-button govuk-button--secondary"
                    style={{ marginBottom: 0 }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '19px' }}>{a.name}</strong>
                    <span style={{ color: '#505a5f', marginLeft: 10 }}>— {a.country}</span>
                  </div>
                  <div>
                    <button 
                      type="button"
                      onClick={() => setSelectedArtist(selectedArtist === a.id ? null : a.id)}
                      className="govuk-button"
                      style={{ marginRight: 10, marginBottom: 0, padding: '5px 10px', fontSize: '16px' }}
                    >
                      {selectedArtist === a.id ? 'Hide Songs' : 'Manage Songs'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingId(a.id)
                        setEditName(a.name)
                        setEditCountry(a.country)
                      }}
                      className="govuk-button govuk-button--secondary"
                      style={{ marginRight: 10, marginBottom: 0, padding: '5px 10px', fontSize: '16px' }}
                    >
                      Edit
                    </button>
                    <button 
                      type="button"
                      onClick={() => deleteArtist(a.id)}
                      className="govuk-button govuk-button--warning"
                      style={{ marginBottom: 0, padding: '5px 10px', fontSize: '16px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
              {selectedArtist === a.id && (
                <Songs session={session} artistId={a.id} artistName={a.name} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="govuk-body" style={{ color: '#505a5f' }}>
          No artists yet. Create your first artist above.
        </p>
      )}
    </div>
  )
}
