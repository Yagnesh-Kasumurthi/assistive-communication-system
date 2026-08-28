// ============================================================
// ASSISTIVE COMMUNICATION SYSTEM
// MESSAGE AND DEVICE STATUS STORAGE
// ============================================================

// Store all received messages
let messages = []

// Store the latest heartbeat time
let lastDeviceHeartbeat = null

// Device is considered offline if no heartbeat
// is received for this amount of time.

const DEVICE_TIMEOUT = 30000

// ============================================================
// ADD MESSAGE
// ============================================================

function addMessage({
  message,
  category,
  button,
}) {
  const now = new Date()

  const storedMessage = {
    id: Date.now(),

    message,

    category,

    button: button || null,

    timestamp: now.toISOString(),

    time: now.toLocaleTimeString(),

    date: now.toLocaleDateString(),
  }

  messages.unshift(storedMessage)

  // Limit stored messages
  if (messages.length > 100) {
    messages = messages.slice(0, 100)
  }

  // Receiving a message also means ESP32 is connected
  updateDeviceHeartbeat()

  return storedMessage
}

// ============================================================
// GET LATEST MESSAGE
// ============================================================

function getLatestMessage() {
  if (messages.length === 0) {
    return null
  }

  return messages[0]
}

// ============================================================
// GET ALL MESSAGES
// ============================================================

function getAllMessages() {
  return messages
}

// ============================================================
// CLEAR MESSAGES
// ============================================================

function clearMessages() {
  messages = []
}

// ============================================================
// UPDATE DEVICE HEARTBEAT
// ============================================================

function updateDeviceHeartbeat() {
  lastDeviceHeartbeat = Date.now()
}

// ============================================================
// CHECK DEVICE CONNECTION
// ============================================================

function isDeviceConnected() {
  if (!lastDeviceHeartbeat) {
    return false
  }

  const currentTime = Date.now()

  const difference =
    currentTime - lastDeviceHeartbeat

  return difference < DEVICE_TIMEOUT
}

// ============================================================
// GET LAST HEARTBEAT
// ============================================================

function getLastDeviceHeartbeat() {
  return lastDeviceHeartbeat
}

// ============================================================
// EXPORT FUNCTIONS
// ============================================================

module.exports = {
  addMessage,

  getLatestMessage,

  getAllMessages,

  clearMessages,

  updateDeviceHeartbeat,

  isDeviceConnected,

  getLastDeviceHeartbeat,
}