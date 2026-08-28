import React from 'react'
import { HandIcon, ChipIcon, WifiIcon, MessageIcon, UserIcon, SendIcon } from '../Icons'

export default function CommunicationFlow() {
  return (
    <div className="comm-flow" role="img" aria-label="Communication flow: Patient movement to button to ESP32 to Wi-Fi to message to caregiver">
      <div className="comm-flow-step">
        <HandIcon />
        Movement
      </div>
      <span className="comm-flow-arrow">→</span>
      <div className="comm-flow-step">
        <SendIcon />
        Button
      </div>
      <span className="comm-flow-arrow">→</span>
      <div className="comm-flow-step active">
        <ChipIcon />
        ESP32
      </div>
      <span className="comm-flow-arrow">→</span>
      <div className="comm-flow-step">
        <WifiIcon />
        Wi-Fi
      </div>
      <span className="comm-flow-arrow">→</span>
      <div className="comm-flow-step">
        <MessageIcon />
        Message
      </div>
      <span className="comm-flow-arrow">→</span>
      <div className="comm-flow-step active">
        <UserIcon />
        Caregiver
      </div>
    </div>
  )
}
