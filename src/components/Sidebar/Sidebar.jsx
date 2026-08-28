import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChipIcon, HomeIcon, LightningIcon, MessageIcon, HeartIcon, AlertIcon, ClockIcon } from '../Icons'

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/quick-needs', label: 'Quick Needs', icon: LightningIcon },
  { path: '/general', label: 'General', icon: MessageIcon },
  { path: '/health', label: 'Health', icon: HeartIcon },
  { path: '/emergency', label: 'Emergency', icon: AlertIcon, className: 'emergency-link' },
  { path: '/history', label: 'History', icon: ClockIcon },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar" role="navigation" aria-label="Main Navigation">
      {/* ── Brand ── */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <ChipIcon />
        </div>
        <h1>
          ASSISTIVE
          <span>COMMUNICATION</span>
        </h1>
        <p className="sidebar-brand-subtitle">Caregiver Dashboard</p>
      </div>

      {/* ── Nav Links ── */}
      <nav className="sidebar-nav">
        {navItems.map(({ path, label, icon: Icon, className }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `nav-link ${className || ''} ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-link-icon"><Icon /></span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="sidebar-device-badge">
          <ChipIcon className="chip-icon" />
          ESP32 DEVICE v1.0
        </div>
      </div>
    </aside>
  )
}
