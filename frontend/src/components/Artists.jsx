import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Artists({ session }) {
  const [artists, setArtists] = useState([])
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [msg, setMsg] = useState(null)

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
    const { data, error } = await supabase.from('artists').select('*').eq('auth_uid', session.user.id)
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
        <ul className="govuk-list">
          {artists.map((a) => (
            <li key={a.id}>
              <strong>{a.name}</strong> — {a.country}
            </li>
          ))}
        </ul>
      ) : (
        <p className="govuk-body" style={{ color: '#505a5f' }}>
          No artists yet. Create your first artist above.
        </p>
      )}
    </div>
  )
}
