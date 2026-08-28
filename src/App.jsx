import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import QuickNeeds from './pages/QuickNeeds/QuickNeeds'
import General from './pages/General/General'
import Health from './pages/Health/Health'
import Emergency from './pages/Emergency/Emergency'
import MessageHistory from './pages/MessageHistory/MessageHistory'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quick-needs" element={<QuickNeeds />} />
        <Route path="/general" element={<General />} />
        <Route path="/health" element={<Health />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/history" element={<MessageHistory />} />
      </Routes>
    </Layout>
  )
}

export default App
