import React from 'react'
import { categories } from '../../data/mockData'
import { LightningIcon } from '../../components/Icons'

export default function QuickNeeds() {
  const cat = categories['Quick Needs']

  return (
    <div className="category-page page-enter">
      <div className="category-page-header">
        <div className="category-page-icon" style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)' }}>
          <LightningIcon />
        </div>
        <div>
          <h1 style={{ color: 'var(--cyan)' }}>Quick Needs</h1>
          <p>{cat.description}</p>
        </div>
      </div>

      <div className="section-title">
        <h2>Available Messages • {cat.buttonRange}</h2>
        <div className="section-title-line" />
      </div>

      <div className="message-grid">
        {cat.messages.map((msg, i) => (
          <div key={msg.id} className="message-option quick-needs">
            <div className="message-option-number">{i + 1}</div>
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
