import React from 'react'
import { useMessages } from '../../context/MessageContext'
import { LightningIcon, MessageIcon, HeartIcon, AlertIcon, ClockIcon } from '../Icons'

const iconMap = {
  'Quick Needs': LightningIcon,
  General: MessageIcon,
  Health: HeartIcon,
  Emergency: AlertIcon,
}

const categoryClassMap = {
  'Quick Needs': 'quick-needs',
  General: 'general',
  Health: 'health',
  Emergency: 'emergency',
}

export default function MessageTimeline() {
  const { messageHistory } = useMessages()

  if (messageHistory.length === 0) {
    return (
      <div className="timeline-empty">
        <div className="timeline-empty-icon">
          <ClockIcon />
        </div>
        <h3>No Messages Yet</h3>
        <p>Messages received from the assistive device will appear here.</p>
      </div>
    )
  }

  return (
    <div className="message-timeline" role="log" aria-label="Message History Timeline">
      {messageHistory.map((msg, i) => {
        const Icon = iconMap[msg.category] || LightningIcon
        const catClass = categoryClassMap[msg.category] || 'quick-needs'

        return (
          <div
            className="timeline-item"
            key={msg.id}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`timeline-dot ${catClass}`}>
              <Icon />
            </div>
            <div className="timeline-card">
              <div className={`timeline-category ${catClass}`}>
                {msg.category}
              </div>
              <div className="timeline-message">{msg.message}</div>
              <div className="timeline-time">Received at {msg.time}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
