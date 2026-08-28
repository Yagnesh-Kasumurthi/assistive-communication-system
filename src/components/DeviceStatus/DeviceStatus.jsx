import React from 'react'
import { useMessages } from '../../context/MessageContext'
import { WifiIcon, WifiOffIcon } from '../Icons'

export default function DeviceStatus() {
  const { deviceOnline } = useMessages()

  return (
    <div
      className={`device-status ${deviceOnline ? 'online' : 'offline'}`}
      role="status"
      aria-live="polite"
      id="device-status-indicator"
    >
      <div className={`status-indicator ${deviceOnline ? 'online' : 'offline'}`}>
        {deviceOnline ? <WifiIcon /> : <WifiOffIcon />}
        {deviceOnline && <div className="pulse-ring" />}
      </div>

      <div className="status-info">
        <div className="status-label">
          {deviceOnline ? '● DEVICE ONLINE' : '● DEVICE OFFLINE'}
        </div>
        <div className="status-description">
          {deviceOnline
            ? 'ESP32 Assistive Device Connected'
            : 'Waiting for Assistive Device...'}
        </div>
      </div>

      <div className="status-wifi">
        {deviceOnline ? <WifiIcon /> : <WifiOffIcon />}
        {deviceOnline ? 'CONNECTED' : 'NO SIGNAL'}
      </div>
    </div>
  )
}
