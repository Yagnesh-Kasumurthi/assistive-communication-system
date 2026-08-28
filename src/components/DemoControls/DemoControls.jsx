import React, { useState } from 'react'
import { demoMessages } from '../../data/mockData'
import { postMessage } from '../../services/esp32Service'
import { BeakerIcon } from '../Icons'

export default function DemoControls() {
  const [open, setOpen] = useState(false)

  const handleSend = async (msg) => {
    // POST to the backend — the polling will pick it up automatically
    await postMessage({
      message: msg.message,
      category: msg.category,
      button: msg.button || '',
    })
  }

  const dotColor = (cat) => {
    switch (cat) {
      case 'Quick Needs': return 'cyan'
      case 'General': return 'purple'
      case 'Health': return 'green'
      case 'Emergency': return 'red'
      default: return 'cyan'
    }
  }

  return (
    <div className="demo-controls" id="demo-controls">
      <button
        className="demo-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle Demo Mode"
        title="Demo Mode — Simulate incoming messages"
      >
        <BeakerIcon />
      </button>

      {open && (
        <div className="demo-panel">
          <h4>Demo Mode</h4>
          <p className="demo-panel-subtitle">
            Simulate messages from the ESP32 device
          </p>

          {demoMessages.map((msg, i) => (
            <button
              key={i}
              className={`demo-btn ${msg.category === 'Emergency' ? 'emergency-demo' : ''}`}
              onClick={() => handleSend(msg)}
            >
              <span className={`demo-btn-dot ${dotColor(msg.category)}`} />
              {msg.message}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
