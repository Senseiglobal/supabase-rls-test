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
      background: '#000000',
      color: '#00ff00',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      maxWidth: '400px',
      zIndex: 1000,
      border: '2px solid #00ff00'
    }}>
      <h3 style={{ 
        margin: '0 0 0.5rem',
        color: '#ffffff',
        borderBottom: '1px solid #00ff00',
        paddingBottom: '0.5rem'
      }}>🔍 Environment Debug Panel</h3>
      <pre style={{ 
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        fontSize: '14px',
        lineHeight: '1.4'
      }}>
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  )
}