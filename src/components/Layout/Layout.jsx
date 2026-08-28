import React from 'react'
import Sidebar from '../Sidebar/Sidebar'
import MobileNavigation from '../MobileNavigation/MobileNavigation'
import TechBackground from '../TechBackground/TechBackground'
import DemoControls from '../DemoControls/DemoControls'

export default function Layout({ children }) {
  return (
    <>
      <TechBackground />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
        <MobileNavigation />
      </div>
      <DemoControls />
    </>
  )
}
