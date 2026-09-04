import React from 'react'
import { useMessages } from '../../context/MessageContext'
import {
  LightningIcon,
  MessageIcon,
  HeartIcon,
  AlertIcon,
  ClockIcon,
} from '../Icons'

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


// ================================================================
// FORMAT INDIA DATE-TIME
// Converts any date-like value into DD-MM-YYYY HH:mm:ss (IST).
// Uses 'en-GB' locale + formatToParts to guarantee a 4-digit year
// and consistent DD/MM ordering on every browser.
// ================================================================

function formatIndiaDateTime(value) {
  const date = value ? new Date(value) : new Date()

  // If the value is not a valid Date (e.g. an already-formatted
  // string like "04-09-2026 15:10:15"), return it as-is.
  if (isNaN(date.getTime())) {
    return String(value)
  }

  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = fmt.formatToParts(date)

  const get = (type) => {
    const p = parts.find(part => part.type === type)
    return p ? p.value : '00'
  }

  // Assemble manually: DD-MM-YYYY HH:mm:ss
  return `${get('day')}-${get('month')}-${get('year')} ${get('hour')}:${get('minute')}:${get('second')}`
}


// ================================================================
// EXPECTED PATTERN
// Matches DD-MM-YYYY HH:mm:ss exactly.
// ================================================================

const FULL_DATETIME_RE = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/


// ================================================================
// GET DISPLAY TIME
// Returns the full DD-MM-YYYY HH:mm:ss string for a message.
//
// Priority:
//   1. msg.indianDateTime  — server-stamped IST string (preferred)
//   2. msg.timestamp       — ISO string from the server
//   3. Generate a fresh IST timestamp (absolute last resort)
//
// If indianDateTime is already in the expected format it passes
// through unchanged.  If it's an ISO string or Date-parseable
// value it gets formatted via formatIndiaDateTime.
// ================================================================

function getDisplayTime(msg) {
  // 1. Try the canonical indianDateTime field
  if (msg.indianDateTime) {
    // Already in DD-MM-YYYY HH:mm:ss format → use directly
    if (FULL_DATETIME_RE.test(msg.indianDateTime)) {
      return msg.indianDateTime
    }
    // Parseable date string (e.g. ISO) → format it
    return formatIndiaDateTime(msg.indianDateTime)
  }

  // 2. Fall back to the ISO timestamp field
  if (msg.timestamp) {
    return formatIndiaDateTime(msg.timestamp)
  }

  // 3. Absolute fallback — should never happen
  return formatIndiaDateTime(new Date())
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

        <p>
          Messages received from the assistive device will appear here.
        </p>
      </div>
    )
  }

  return (
    <div
      className="message-timeline"
      role="log"
      aria-label="Message History Timeline"
    >
      {messageHistory.map((msg, i) => {
        const Icon =
          iconMap[msg.category] || LightningIcon

        const catClass =
          categoryClassMap[msg.category] || 'quick-needs'

        const formattedTime =
          getDisplayTime(msg)

        return (
          <div
            className="timeline-item"
            key={msg.id}
            style={{
              animationDelay: `${i * 0.08}s`,
            }}
          >
            <div
              className={`timeline-dot ${catClass}`}
            >
              <Icon />
            </div>

            <div className="timeline-card">
              <div
                className={`timeline-category ${catClass}`}
              >
                {msg.category}
              </div>

              <div className="timeline-message">
                {msg.message}
              </div>

              <div className="timeline-time">
                Received: {formattedTime}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}