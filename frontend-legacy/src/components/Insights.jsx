import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../supabaseClient'

export default function Insights({ session, songId, songTitle }) {
  const [insights, setInsights] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  async function load() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('song_id', songId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setInsights(data || [])
    } catch (error) {
      toast.error(error.message || 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (songId) load()
  }, [songId])

  async function createInsight(e) {
    e.preventDefault()
    try {
      setSubmitting(true)
      const { data, error } = await supabase
        .from('insights')
        .insert([{ song_id: songId, user_id: session?.user?.id, advice: content }])
        .select()
        .single()
      if (error) throw error
      setInsights((s) => [data, ...s])
      setContent('')
      toast.success('Insight added successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to add insight')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteInsight(id) {
    if (!confirm('Are you sure you want to delete this insight?')) return
    try {
      const { error } = await supabase.from('insights').delete().eq('id', id)
      if (error) throw error
      setInsights((s) => s.filter(insight => insight.id !== id))
      toast.success('Insight deleted successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to delete insight')
    }
  }

  async function updateInsight(id, updatedContent) {
    try {
      const { error } = await supabase
        .from('insights')
        .update({ advice: updatedContent })
        .eq('id', id)
      if (error) throw error
      setInsights((s) => s.map(insight => insight.id === id ? { ...insight, advice: updatedContent } : insight))
      toast.success('Insight updated successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to update insight')
    }
  }

  // Minimal AI Generate stub: inserts a placeholder insight row
  async function generateInsightStub() {
    try {
      setGenerating(true)
      const advice = `AI stub suggestion for "${songTitle}" — replace with Gemini-generated content.`
      const payload = {
        song_id: songId,
        user_id: session?.user?.id,
        advice,
        advice_type: 'creative_direction',
        priority: 'medium',
        category: 'advice',
        title: 'AI suggestion',
        data_source: 'ai_stub',
        ai_confidence: 0.5,
        action_items: ['Replace with real AI output']
      }
      const { data, error } = await supabase
        .from('insights')
        .insert([payload])
        .select()
        .single()
      if (error) throw error
      setInsights((s) => [data, ...s])
      toast.success('Generated insight (stub)')
    } catch (error) {
      toast.error(error.message || 'Failed to generate insight')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ marginTop: 20, paddingLeft: 20, borderLeft: '3px solid #1d70b8' }}>
      <h4 className="govuk-heading-s">Insights for "{songTitle}"</h4>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={generateInsightStub}
          disabled={generating}
          style={{ marginBottom: 0, padding: '5px 10px', fontSize: '14px' }}
        >
          {generating ? 'Generating…' : 'Generate Insight'}
        </button>
      </div>

      <form onSubmit={createInsight} style={{ marginBottom: 15 }}>
        <div className="govuk-form-group">
          <textarea 
            placeholder="Enter insight..." 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={submitting}
            className="govuk-input"
            rows="3"
            style={{ resize: 'vertical' }}
          />
        </div>
        <button 
          type="submit" 
          className="govuk-button" 
          style={{ marginBottom: 0, padding: '5px 10px', fontSize: '14px' }}
          disabled={submitting}
        >
          {submitting ? 'Adding...' : 'Add Insight'}
        </button>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '15px' }}>
          <div className="govuk-spinner" style={{ width: '30px', height: '30px' }}></div>
          <p className="govuk-body" style={{ marginTop: 10, fontSize: '12px' }}>Loading insights...</p>
        </div>
      ) : insights.length > 0 ? (
        <div>
          {insights.map((insight) => (
            <div 
              key={insight.id}
              className="insight-card"
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
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4' }}>{insight.advice}</p>
                  <div>
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingId(insight.id)
                        setEditContent(insight.advice)
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
