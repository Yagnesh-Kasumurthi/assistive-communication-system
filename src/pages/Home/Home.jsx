import React from 'react'
import DeviceStatus from '../../components/DeviceStatus/DeviceStatus'
import LatestMessage from '../../components/LatestMessage/LatestMessage'
import CategoryCard from '../../components/CategoryCard/CategoryCard'
import CommunicationFlow from '../../components/CommunicationFlow/CommunicationFlow'

export default function Home() {
  return (
    <div className="page-enter">
      {/* ── Communication Flow ── */}
      <div className="home-section">
        <CommunicationFlow />
      </div>

      {/* ── Device Status ── */}
      <div className="home-section">
        <div className="section-title">
          <h2>Device Status</h2>
          <div className="section-title-line" />
        </div>
        <DeviceStatus />
      </div>

      {/* ── Latest Message ── */}
      <div className="home-section">
        <div className="section-title">
          <h2>Latest Message</h2>
          <div className="section-title-line" />
        </div>
        <LatestMessage />
      </div>

      {/* ── Communication Categories ── */}
      <div className="home-section">
        <div className="section-title">
          <h2>Communication Categories</h2>
          <div className="section-title-line" />
        </div>
        <div className="category-grid">
          <CategoryCard categoryId="quick-needs" name="Quick Needs" />
          <CategoryCard categoryId="general" name="General" />
          <CategoryCard categoryId="health" name="Health" />
          <CategoryCard categoryId="emergency" name="Emergency" />
        </div>
      </div>
    </div>
  )
}
