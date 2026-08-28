import React from 'react'
import { Link } from 'react-router-dom'
import { LightningIcon, MessageIcon, HeartIcon, AlertIcon } from '../Icons'

const iconMap = {
  'quick-needs': LightningIcon,
  general: MessageIcon,
  health: HeartIcon,
  emergency: AlertIcon,
}

const descriptions = {
  'quick-needs': 'Essential daily needs and requests',
  general: 'General communication messages',
  health: 'Health and medical status updates',
  emergency: 'Urgent emergency alerts',
}

const messageCounts = {
  'quick-needs': '4 messages',
  general: '4 messages',
  health: '3 messages',
  emergency: '1 message',
}

const paths = {
  'quick-needs': '/quick-needs',
  general: '/general',
  health: '/health',
  emergency: '/emergency',
}

export default function CategoryCard({ categoryId, name }) {
  const Icon = iconMap[categoryId] || LightningIcon

  return (
    <Link
      to={paths[categoryId]}
      className={`category-card ${categoryId}`}
      id={`category-card-${categoryId}`}
    >
      <div className="category-card-icon">
        <Icon />
      </div>
      <h3>{name}</h3>
      <p>{descriptions[categoryId]}</p>
      <div className="category-card-count">{messageCounts[categoryId]}</div>
    </Link>
  )
}
