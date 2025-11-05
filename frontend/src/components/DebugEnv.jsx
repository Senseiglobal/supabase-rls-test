import React from 'react'

export function DebugEnv() {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'not set',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 
      `${import.meta.env.VITE_SUPABASE_ANON_KEY.slice(0, 5)}...${import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-5)}` : 
      'not set',
    NODE_ENV: import.meta.env.MODE,
    BASE_URL: import.meta.env.BASE_URL,
  }

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      padding: '1rem',
      background: '#f0f0f0',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 0.5rem' }}>Environment Debug</h3>
      <pre style={{ 
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        fontSize: '12px'
      }}>
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  )
}