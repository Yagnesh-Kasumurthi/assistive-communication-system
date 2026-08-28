import React, { useState, useEffect } from 'react'
import { useMessages } from '../../context/MessageContext'
import { SignalIcon } from '../Icons'

export default function LatestMessage() {
  const { latestMessage } = useMessages()
  const [animKey, setAnimKey] = useState(0)

  // Re-trigger animation on new message
  useEffect(() => {
    if (latestMessage) {
      setAnimKey((k) => k + 1)
    }
  }, [latestMessage])

  const categoryClass = latestMessage
    ? latestMessage.category.toLowerCase().replace(/\s+/g, '-')
    : ''

  return (
    <div
      className={`latest-message ${latestMessage ? 'has-message' : ''}`}
      id="latest-message-panel"
      role="region"
      aria-label="Latest Message"
      aria-live="assertive"
    >
      {/* Corner decorations */}
      <div className="latest-message-corner tl" />
      <div className="latest-message-corner tr" />
      <div className="latest-message-corner bl" />
      <div className="latest-message-corner br" />

      {!latestMessage ? (
        <div className="latest-message-empty">
          <div className="latest-message-empty-icon">
            <SignalIcon />
          </div>
          <h3>No Message Received</h3>
          <p>Waiting for communication from the assistive device...</p>
        </div>
      ) : (
        <div className="latest-message-content" key={animKey}>
          <div className="latest-message-header">
            <div className="latest-message-signal">
              <span /><span /><span /><span />
            </div>
            <span className="latest-message-badge">MESSAGE RECEIVED</span>
          </div>

          <div className="latest-message-text">
            {latestMessage.message}
          </div>

          <div className="latest-message-meta">
            <span className={`latest-message-category ${categoryClass}`}>
              {latestMessage.category}
            </span>
            <span className="latest-message-time">{latestMessage.time}</span>
          </div>
        </div>
      )}
    </div>
  )
}
