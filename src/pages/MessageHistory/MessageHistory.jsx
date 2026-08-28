import React from 'react'
import MessageTimeline from '../../components/MessageTimeline/MessageTimeline'
import { ClockIcon } from '../../components/Icons'
import { useMessages } from '../../context/MessageContext'

export default function MessageHistory() {
  const { messageHistory, clearHistory } = useMessages()

  return (
    <div className="category-page page-enter">
      <div className="category-page-header">
        <div className="category-page-icon" style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)' }}>
          <ClockIcon />
        </div>
        <div style={{ flex: 1 }}>
          <h1>Message History</h1>
          <p>Communication log from the assistive device</p>
        </div>
        {messageHistory.length > 0 && (
          <button
            onClick={clearHistory}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-dim)',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            aria-label="Clear message history"
          >
            Clear
          </button>
        )}
      </div>

      <div className="section-title">
        <h2>{messageHistory.length} Message{messageHistory.length !== 1 ? 's' : ''} Received</h2>
        <div className="section-title-line" />
      </div>

      <MessageTimeline />
    </div>
  )
}
