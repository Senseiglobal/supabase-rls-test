import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../supabaseClient'
import Insights from './Insights'

export default function Songs({ session, artistId, artistName }) {
  const [songs, setSongs] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [selectedSong, setSelectedSong] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setSongs(data || [])
    } catch (error) {
      toast.error(error.message || 'Failed to load songs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (artistId) load()
  }, [artistId])

  async function createSong(e) {
    e.preventDefault()
    try {
      setSubmitting(true)
      const { data, error } = await supabase
        .from('songs')
        .insert([{ artist_id: artistId, title }])
        .select()
        .single()
      if (error) throw error
      setSongs((s) => [data, ...s])
      setTitle('')
      toast.success('Song added successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to add song')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteSong(id) {
    if (!confirm('Are you sure you want to delete this song?')) return
    try {
      const { error } = await supabase.from('songs').delete().eq('id', id)
      if (error) throw error
      setSongs((s) => s.filter(song => song.id !== id))
      toast.success('Song deleted successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to delete song')
    }
  }

  async function updateSong(id, updatedTitle) {
    try {
      const { error } = await supabase
        .from('songs')
        .update({ title: updatedTitle })
        .eq('id', id)
      if (error) throw error
      setSongs((s) => s.map(song => song.id === id ? { ...song, title: updatedTitle } : song))
      toast.success('Song updated successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to update song')
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
            disabled={submitting}
            className="govuk-input"
          />
        </div>
        <button 
          type="submit" 
          className="govuk-button" 
          style={{ marginBottom: 0 }}
          disabled={submitting}
        >
          {submitting ? 'Adding...' : 'Add Song'}
        </button>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="govuk-spinner"></div>
          <p className="govuk-body" style={{ marginTop: 10, fontSize: '14px' }}>Loading songs...</p>
        </div>
      ) : songs.length > 0 ? (
        <div>
          {songs.map((song) => (
            <div 
              key={song.id}
              className="song-card"
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
