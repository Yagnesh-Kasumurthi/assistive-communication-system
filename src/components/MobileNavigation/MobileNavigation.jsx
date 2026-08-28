import React from 'react'
import { NavLink } from 'react-router-dom'
import { HomeIcon, LightningIcon, MessageIcon, HeartIcon, AlertIcon, ClockIcon } from '../Icons'

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/quick-needs', label: 'Quick', icon: LightningIcon },
  { path: '/general', label: 'General', icon: MessageIcon },
  { path: '/health', label: 'Health', icon: HeartIcon },
  { path: '/emergency', label: 'SOS', icon: AlertIcon, className: 'emergency-link' },
  { path: '/history', label: 'History', icon: ClockIcon },
]

export default function MobileNavigation() {
  return (
    <nav className="mobile-nav" role="navigation" aria-label="Mobile Navigation">
      {navItems.map(({ path, label, icon: Icon, className }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `mobile-nav-item ${className || ''} ${isActive ? 'active' : ''}`
          }
        >
          <Icon />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
