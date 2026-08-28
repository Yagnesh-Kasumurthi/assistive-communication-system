/**
 * ═══════════════════════════════════════════════════════════════
 *  ASSISTIVE COMMUNICATION SYSTEM — Express Backend Server
 * ═══════════════════════════════════════════════════════════════
 *
 *  Production-ready Express server that receives messages from
 *  the ESP32 assistive communication device and serves them to
 *  the caregiver monitoring dashboard.
 *
 *  Features:
 *   - Configurable port via PORT environment variable
 *   - Permissive CORS for cross-origin Web & ESP32 HTTP clients
 *   - Persistent message storage with in-memory caching
 *   - Health check endpoints for cloud deployment (Render, Railway, etc.)
 *   - Graceful local port fallback (5000 -> 5001) for macOS development
 *
 *  Endpoints:
 *    GET    /                 — Root service info / ping
 *    GET    /api/health       — Health check for monitoring
 *    GET    /api/device-status— Device connection status
 *    POST   /api/message      — Receive message from ESP32
 *    GET    /api/latest-message— Most recent communication
 *    GET    /api/messages     — Message history timeline
 *    DELETE /api/messages     — Clear message history
 * ═══════════════════════════════════════════════════════════════
 */

const express = require('express')
const cors = require('cors')
const {
  addMessage,
  getLatestMessage,
  getAllMessages,
  clearMessages,
  isDeviceConnected,
} = require('./messages')

// ── Create Express App ───────────────────────────────────────
const app = express()
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000

// ── Middleware ────────────────────────────────────────────────

// CORS Configuration — allows frontend hosted on Vercel/Netlify/localhost
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsOptions))

// Parse JSON request bodies
app.use(express.json())

// Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString()
  console.log(`[${timestamp}] ${req.method} ${req.url}`)
  next()
})

// ── Health & Info Routes ─────────────────────────────────────

/**
 * GET /
 * Root service status check.
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Assistive Communication System API',
    status: 'online',
    version: '1.0.0',
    deviceConnected: isDeviceConnected(),
    endpoints: [
      'GET /api/device-status',
      'POST /api/message',
      'GET /api/latest-message',
      'GET /api/messages',
      'DELETE /api/messages',
      'GET /api/health',
    ],
  })
})

/**
 * GET /api/health
 * Simple health check for platform monitors and uptime services.
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API Routes ───────────────────────────────────────────────

/**
 * GET /api/device-status
 *
 * Returns the current connection status of the ESP32 device.
 */
app.get('/api/device-status', (req, res) => {
  const connected = isDeviceConnected()
  res.json({
    connected,
    deviceName: 'ESP32 Assistive Device',
    wifi: connected,
  })
})

/**
 * POST /api/message
 *
 * Receives a communication message from the ESP32 device.
 * Body: { message: string, category: string, button?: string }
 */
app.post('/api/message', (req, res) => {
  const { message, category, button } = req.body

  if (!message || !category) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: "message" and "category"',
    })
  }

  const stored = addMessage({ message, category, button })

  console.log(`\n  ┌─────────────────────────────────────────┐`)
  console.log(`  │  📨 NEW MESSAGE RECEIVED                │`)
  console.log(`  │  Message:  ${message}`)
  console.log(`  │  Category: ${category}`)
  console.log(`  │  Button:   ${button || 'N/A'}`)
  console.log(`  │  Time:     ${stored.time}`)
  console.log(`  └─────────────────────────────────────────┘\n`)

  res.json({
    success: true,
    message: 'Message received successfully',
    data: stored,
  })
})

/**
 * GET /api/latest-message
 *
 * Returns the most recently received message.
 */
app.get('/api/latest-message', (req, res) => {
  const latest = getLatestMessage()
  if (!latest) {
    return res.json({ exists: false })
  }
  res.json({ exists: true, ...latest })
})

/**
 * GET /api/messages
 *
 * Returns all messages in the history (newest first).
 */
app.get('/api/messages', (req, res) => {
  res.json(getAllMessages())
})

/**
 * DELETE /api/messages
 *
 * Clears all message history.
 */
app.delete('/api/messages', (req, res) => {
  clearMessages()
  console.log('  🗑  Message history cleared')
  res.json({ success: true, message: 'Message history cleared' })
})

// ── Server Startup ───────────────────────────────────────────

function startServer(port) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log('')
    console.log('  ═══════════════════════════════════════════════')
    console.log('   ASSISTIVE COMMUNICATION SYSTEM — Backend')
    console.log('  ═══════════════════════════════════════════════')
    console.log(`   Status:             Running`)
    console.log(`   Host:               0.0.0.0`)
    console.log(`   Port:               ${port}`)
    console.log(`   Environment:        ${process.env.NODE_ENV || 'development'}`)
    console.log('')
    console.log('   API Endpoints:')
    console.log(`     GET    /                  — Root info`)
    console.log(`     GET    /api/health        — Health check`)
    console.log(`     GET    /api/device-status — Connection status`)
    console.log(`     POST   /api/message       — Message receiver`)
    console.log(`     GET    /api/latest-message— Latest message`)
    console.log(`     GET    /api/messages      — Message history`)
    console.log(`     DELETE /api/messages      — Clear history`)
    console.log('')
    console.log('   Waiting for ESP32 / Caregiver requests...')
    console.log('  ═══════════════════════════════════════════════')
    console.log('')
  })

  server.on('error', (err) => {
    // If port 5000 is taken on macOS during local dev without an explicit env port, try 5001
    if (err.code === 'EADDRINUSE' && !process.env.PORT && port === 5000) {
      console.warn(`[WARN] Port 5000 is busy. Auto-switching to port 5001 for local development...`)
      startServer(5001)
    } else {
      console.error('[ERROR] Server failed to start:', err.message)
    }
  })
}

startServer(DEFAULT_PORT)
