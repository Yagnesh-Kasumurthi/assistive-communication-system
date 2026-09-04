const express = require('express')
const cors = require('cors')

const {
  addMessage,
  getLatestMessage,
  getAllMessages,
  clearMessages,
  isDeviceConnected,
  updateDeviceHeartbeat,
} = require('./messages.js')

const app = express()

const PORT = process.env.PORT || 5000

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url}`
  )

  next()
})

// ============================================================
// ROOT
// ============================================================

app.get('/', (req, res) => {
  res.json({
    service: 'Assistive Communication System API',
    status: 'online',
    version: '2.0.0',
    deviceConnected: isDeviceConnected(),

    endpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/device-status',
      'POST /api/device-heartbeat',
      'POST /api/message',
      'GET /api/latest-message',
      'GET /api/messages',
      'DELETE /api/messages',
    ],
  })
})

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// ============================================================
// DEVICE HEARTBEAT
//
// ESP32 calls this endpoint regularly.
//
// This is what tells the backend:
// "I am alive and connected."
// ============================================================

app.post('/api/device-heartbeat', (req, res) => {
  updateDeviceHeartbeat()

  console.log('ESP32 heartbeat received')

  res.status(200).json({
    success: true,
    connected: true,
    message: 'Heartbeat received',
    timestamp: new Date().toISOString(),
  })
})

// Optional GET route for easy browser testing
app.get('/api/device-heartbeat', (req, res) => {
  res.json({
    success: true,
    message: 'Heartbeat endpoint is active',
    connected: isDeviceConnected(),
  })
})

// ============================================================
// DEVICE STATUS
// ============================================================

app.get('/api/device-status', (req, res) => {
  const connected = isDeviceConnected()

  res.json({
    connected,
    deviceName: 'ESP32 Assistive Device',
    wifi: connected,
  })
})

// ============================================================
// RECEIVE MESSAGE FROM ESP32
// ============================================================

app.post('/api/message', (req, res) => {
  const { message, category, button } = req.body

  if (!message || !category) {
    return res.status(400).json({
      success: false,
      error:
        'Missing required fields: "message" and "category"',
    })
  }

  // A message also proves the device is connected
  updateDeviceHeartbeat()

  const stored = addMessage({
    message,
    category,
    button,
  })

  console.log('')
  console.log('========================================')
  console.log('NEW ESP32 MESSAGE RECEIVED')
  console.log('========================================')
  console.log(`Message: ${message}`)
  console.log(`Category: ${category}`)
  console.log(`Button: ${button || 'N/A'}`)
  console.log(`Time: ${stored.indianDateTime}`)
  console.log('========================================')
  console.log('')

  res.status(200).json({
    success: true,
    message: 'Message received successfully',
    data: stored,
  })
})

// ============================================================
// LATEST MESSAGE
// ============================================================

app.get('/api/latest-message', (req, res) => {
  const latest = getLatestMessage()

  if (!latest) {
    return res.json({
      exists: false,
    })
  }

  res.json({
    exists: true,
    ...latest,
  })
})

// ============================================================
// ALL MESSAGES
// ============================================================

app.get('/api/messages', (req, res) => {
  res.json(getAllMessages())
})

// ============================================================
// CLEAR MESSAGE HISTORY
// ============================================================

app.delete('/api/messages', (req, res) => {
  clearMessages()

  console.log('Message history cleared')

  res.json({
    success: true,
    message: 'Message history cleared',
  })
})

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('==============================================')
  console.log(' ASSISTIVE COMMUNICATION SYSTEM BACKEND')
  console.log('==============================================')
  console.log(`Status: Running`)
  console.log(`Port: ${PORT}`)
  console.log('')
  console.log('Available endpoints:')
  console.log('GET    /')
  console.log('GET    /api/health')
  console.log('GET    /api/device-status')
  console.log('POST   /api/device-heartbeat')
  console.log('POST   /api/message')
  console.log('GET    /api/latest-message')
  console.log('GET    /api/messages')
  console.log('DELETE /api/messages')
  console.log('==============================================')
  console.log('')
})