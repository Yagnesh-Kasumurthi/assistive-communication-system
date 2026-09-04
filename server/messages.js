// ============================================================
// ASSISTIVE COMMUNICATION SYSTEM
// MESSAGE AND DEVICE STATUS STORAGE
// ============================================================


// ============================================================
// INDIA DATE-TIME HELPER
// Generates a timestamp in IST (Asia/Kolkata).
// Uses 'en-GB' locale (not 'en-IN') because 'en-IN' can produce
// a 2-digit year in some Node.js/ICU builds, hiding the date.
// Format: DD-MM-YYYY HH:mm:ss
// Example: 04-09-2026 14:35:20
// ============================================================

function getIndiaDateTime() {
  const now = new Date()

  // 'en-GB' guarantees DD/MM/YYYY order and a 4-digit year
  // on every Node.js version. timeZone forces IST regardless
  // of the server's OS locale setting.
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = fmt.formatToParts(now)

  const get = (type) => {
    const part = parts.find(p => p.type === type)
    return part ? part.value : '00'
  }

  const day    = get('day')
  const month  = get('month')
  const year   = get('year')
  const hour   = get('hour')
  const minute = get('minute')
  const second = get('second')

  // Assemble manually: DD-MM-YYYY HH:mm:ss
  return `${day}-${month}-${year} ${hour}:${minute}:${second}`
}

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
  // Generate IST timestamp once, at the moment of receipt.
  // This is never regenerated — polling will return this same value.
  const indianDateTime = getIndiaDateTime()

  const storedMessage = {
    id: Date.now(),

    message,

    category,

    button: button || null,

    // indianDateTime: the canonical timestamp shown in the UI
    // Format: DD-MM-YYYY HH:mm:ss  (always Asia/Kolkata)
    indianDateTime,

    // Keep ISO for any server-side debug logging
    timestamp: new Date().toISOString(),
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