import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Insights from './Insights'

export default function Songs({ session, artistId, artistName }) {
  const [songs, setSongs] = useState([])
  const [title, setTitle] = useState('')
  const [msg, setMsg] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [selectedSong, setSelectedSong] = useState(null)

  async function load() {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })
    if (error) setMsg(error.message)
    else setSongs(data || [])
  }

  useEffect(() => {
    if (artistId) load()
  }, [artistId])

  async function createSong(e) {
    e.preventDefault()
    setMsg(null)
    const { data, error } = await supabase
      .from('songs')
      .insert([{ artist_id: artistId, title }])
      .select()
      .single()
    if (error) setMsg(error.message)
    else {
      setSongs((s) => [data, ...s])
      setTitle('')
      setMsg('Song added successfully!')
    }
  }

  async function deleteSong(id) {
    if (!confirm('Are you sure you want to delete this song?')) return
    setMsg(null)
    const { error } = await supabase.from('songs').delete().eq('id', id)
    if (error) setMsg(error.message)
    else {
      setSongs((s) => s.filter(song => song.id !== id))
      setMsg('Song deleted successfully!')
    }
  }

  async function updateSong(id, updatedTitle) {
    setMsg(null)
    const { error } = await supabase
      .from('songs')
      .update({ title: updatedTitle })
      .eq('id', id)
    if (error) setMsg(error.message)
    else {
      setSongs((s) => s.map(song => song.id === id ? { ...song, title: updatedTitle } : song))
      setMsg('Song updated successfully!')
    }
  }

  return (
    <div style={{ marginTop: 30, borderTop: '2px solid #b1b4b6', paddingTop: 20 }}>
      <h3 className="govuk-heading-m">Songs for {artistName}</h3>
      
      <form onSubmit={createSong} style={{ marginBottom: 20 }}>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="song-title">Song Title</label>
          <input 
            id="song-title"
            placeholder="Enter song title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            required
            className="govuk-input"
          />
        </div>
        <button type="submit" className="govuk-button" style={{ marginBottom: 0 }}>
          Add Song
        </button>
      </form>

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

      {songs.length > 0 ? (
        <div>
          {songs.map((song) => (
            <div 
              key={song.id}
              style={{ 
                border: '1px solid #b1b4b6',
                padding: '10px 15px',
                marginBottom: '10px',
                backgroundColor: '#f8f8f8'
              }}
            >
              {editingId === song.id ? (
                <form onSubmit={(e) => {
                  e.preventDefault()
                  updateSong(song.id, editTitle)
                  setEditingId(null)
                }}>
                  <div className="govuk-form-group" style={{ marginBottom: 10 }}>
                    <input 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                      className="govuk-input"
                    />
                  </div>
                  <button type="submit" className="govuk-button" style={{ marginRight: 10, marginBottom: 0, padding: '5px 10px', fontSize: '16px' }}>
                    Save
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingId(null)}
                    className="govuk-button govuk-button--secondary"
                    style={{ marginBottom: 0, padding: '5px 10px', fontSize: '16px' }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px' }}>{song.title}</span>
                    <div>
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingId(song.id)
                          setEditTitle(song.title)
                        }}
                        className="govuk-button govuk-button--secondary"
                        style={{ marginRight: 10, marginBottom: 0, padding: '3px 8px', fontSize: '14px' }}
                      >
                        Edit
                      </button>
                      <button 
                        type="button"
                        onClick={() => deleteSong(song.id)}
                        className="govuk-button govuk-button--warning"
                        style={{ marginRight: 10, marginBottom: 0, padding: '3px 8px', fontSize: '14px' }}
                      >
                        Delete
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSelectedSong(selectedSong === song.id ? null : song.id)}
                        className="govuk-button"
                        style={{ marginBottom: 0, padding: '3px 8px', fontSize: '14px' }}
                      >
                        {selectedSong === song.id ? 'Hide Insights' : 'Manage Insights'}
                      </button>
                    </div>
                  </div>
                  {selectedSong === song.id && (
                    <Insights session={session} songId={song.id} songTitle={song.title} />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="govuk-body" style={{ color: '#505a5f', fontSize: '16px' }}>
          No songs yet. Add your first song above.
        </p>
      )}
    </div>
  )
}
