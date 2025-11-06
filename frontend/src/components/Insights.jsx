import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Insights({ session, songId, songTitle }) {
  const [insights, setInsights] = useState([])
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  async function load() {
    const { data, error} = await supabase
      .from('insights')
      .select('*')
      .eq('song_id', songId)
      .order('created_at', { ascending: false })
    if (error) setMsg(error.message)
    else setInsights(data || [])
  }

  useEffect(() => {
    if (songId) load()
  }, [songId])

  async function createInsight(e) {
    e.preventDefault()
    setMsg(null)
    const { data, error } = await supabase
      .from('insights')
      .insert([{ song_id: songId, content }])
      .select()
      .single()
    if (error) setMsg(error.message)
    else {
      setInsights((s) => [data, ...s])
      setContent('')
      setMsg('Insight added successfully!')
    }
  }

  async function deleteInsight(id) {
    if (!confirm('Are you sure you want to delete this insight?')) return
    setMsg(null)
    const { error } = await supabase.from('insights').delete().eq('id', id)
    if (error) setMsg(error.message)
    else {
      setInsights((s) => s.filter(insight => insight.id !== id))
      setMsg('Insight deleted successfully!')
    }
  }

  async function updateInsight(id, updatedContent) {
    setMsg(null)
    const { error } = await supabase
      .from('insights')
      .update({ content: updatedContent })
      .eq('id', id)
    if (error) setMsg(error.message)
    else {
      setInsights((s) => s.map(insight => insight.id === id ? { ...insight, content: updatedContent } : insight))
      setMsg('Insight updated successfully!')
    }
  }

  return (
    <div style={{ marginTop: 20, paddingLeft: 20, borderLeft: '3px solid #1d70b8' }}>
      <h4 className="govuk-heading-s">Insights for "{songTitle}"</h4>
      
      <form onSubmit={createInsight} style={{ marginBottom: 15 }}>
        <div className="govuk-form-group">
          <textarea 
            placeholder="Enter insight..." 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            required
            className="govuk-input"
            rows="3"
            style={{ resize: 'vertical' }}
          />
        </div>
        <button type="submit" className="govuk-button" style={{ marginBottom: 0, padding: '5px 10px', fontSize: '14px' }}>
          Add Insight
        </button>
      </form>

      {msg && (
        <div 
          className={`govuk-notification-banner ${
            msg.includes('Error') ? 'govuk-notification-banner--error' : 
            'govuk-notification-banner--success'
          }`}
          style={{ marginBottom: 15, padding: '10px' }}
        >
          <p style={{ margin: 0, fontSize: '14px' }}>{msg}</p>
        </div>
      )}

      {insights.length > 0 ? (
        <div>
          {insights.map((insight) => (
            <div 
              key={insight.id}
              style={{ 
                border: '1px solid #d4d4d4',
                padding: '8px 12px',
                marginBottom: '8px',
                backgroundColor: '#fafafa'
              }}
            >
              {editingId === insight.id ? (
                <form onSubmit={(e) => {
                  e.preventDefault()
                  updateInsight(insight.id, editContent)
                  setEditingId(null)
                }}>
                  <div className="govuk-form-group" style={{ marginBottom: 8 }}>
                    <textarea 
                      value={editContent} 
                      onChange={(e) => setEditContent(e.target.value)}
                      required
                      className="govuk-input"
                      rows="2"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                  <button type="submit" className="govuk-button" style={{ marginRight: 8, marginBottom: 0, padding: '3px 8px', fontSize: '14px' }}>
                    Save
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingId(null)}
                    className="govuk-button govuk-button--secondary"
                    style={{ marginBottom: 0, padding: '3px 8px', fontSize: '14px' }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4' }}>{insight.content}</p>
                  <div>
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingId(insight.id)
                        setEditContent(insight.content)
                      }}
                      className="govuk-button govuk-button--secondary"
                      style={{ marginRight: 8, marginBottom: 0, padding: '2px 6px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button 
                      type="button"
                      onClick={() => deleteInsight(insight.id)}
                      className="govuk-button govuk-button--warning"
                      style={{ marginBottom: 0, padding: '2px 6px', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="govuk-body" style={{ color: '#505a5f', fontSize: '14px' }}>
          No insights yet. Add your first insight above.
        </p>
      )}
    </div>
  )
}
