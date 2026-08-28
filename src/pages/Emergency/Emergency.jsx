import React from 'react'
import { categories } from '../../data/mockData'
import { AlertIcon } from '../../components/Icons'

export default function Emergency() {
  const cat = categories['Emergency']

  return (
    <div className="category-page page-enter">
      <div className="category-page-header">
        <div className="category-page-icon" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
          <AlertIcon />
        </div>
        <div>
          <h1 style={{ color: 'var(--red)' }}>Emergency</h1>
          <p>{cat.description}</p>
        </div>
      </div>

      <div className="emergency-banner">
        <AlertIcon style={{ width: 40, height: 40, color: 'var(--red)', marginBottom: 12 }} />
        <h2>Emergency Alert Channel</h2>
        <p>
          This category is reserved for critical emergencies. When the patient
          presses the emergency button on the ESP32 device, an immediate alert
          is transmitted to this dashboard along with an audible buzzer on the device.
        </p>
      </div>

      <div className="section-title">
        <h2>Emergency Message • {cat.buttonRange}</h2>
        <div className="section-title-line" />
      </div>

      <div className="message-grid">
        {cat.messages.map((msg, i) => (
          <div key={msg.id} className="message-option emergency">
            <div className="message-option-number">!</div>
            <div>
              <div className="message-option-text">{msg.text}</div>
              <div className="message-option-subtext">{msg.buttonLabel}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
