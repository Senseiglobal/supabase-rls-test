import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Artists({ session }) {
  const [artists, setArtists] = useState([])
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [msg, setMsg] = useState(null)

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
    <div style={{ marginTop: 16 }}>
      <h2>Your artists</h2>
      <form onSubmit={createArtist} style={{ marginBottom: 12 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} style={{ marginLeft: 8 }} />
        <button type="submit" style={{ marginLeft: 8 }}>Create</button>
      </form>
      <button onClick={accessControlTest}>Run access control test (blocked UX)</button>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}

      <ul style={{ marginTop: 12 }}>
        {artists.map((a) => (
          <li key={a.id}>{a.name} — {a.country}</li>
        ))}
      </ul>
    </div>
  )
}
