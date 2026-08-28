/**
 * ═══════════════════════════════════════════════════════════════
 *  ASSISTIVE COMMUNICATION SYSTEM — Persistent Message Store
 * ═══════════════════════════════════════════════════════════════
 *
 *  Stores messages received from the ESP32 assistive device.
 *  Uses in-memory cache for ultra-fast reads + automatic JSON
 *  file persistence so Message History and Latest Message survive
 *  server restarts / cloud container reboots.
 *
 *  Design:
 *   - Fast in-memory array for synchronous API responses
 *   - Asynchronous file sync to `server/data/messages.json`
 *   - Graceful fallback to pure memory if file system is read-only
 * ═══════════════════════════════════════════════════════════════
 */

const fs = require('fs')
const path = require('path')

// ── Persistence Setup ────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'messages.json')

// ── In-Memory State ──────────────────────────────────────────

/** @type {Array<{id: string, message: string, category: string, button: string, timestamp: string, time: string}>} */
let messages = []

/** Latest message reference */
let latestMessage = null

/** Device connection tracking */
let deviceConnected = false
let lastActivityTime = null

// If no message received for 30s, mark device as offline
const DEVICE_TIMEOUT_MS = 30000 // 30 seconds

// ── Persistence Helpers ──────────────────────────────────────

/**
 * Initialize storage directory and load previously saved messages.
 */
function initStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8')
      if (raw.trim()) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          messages = parsed
          latestMessage = messages.length > 0 ? messages[0] : null
          console.log(`  💾 Loaded ${messages.length} message(s) from persistent storage (${DATA_FILE})`)
        }
      }
    }
  } catch (err) {
    console.warn('  ⚠️ Could not read messages.json, running in memory-only mode:', err.message)
  }
}

/**
 * Persist current messages array to disk.
 */
function persistMessages() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), 'utf8', (err) => {
      if (err) {
        console.warn('  ⚠️ Failed to write messages to disk:', err.message)
      }
    })
  } catch (err) {
    console.warn('  ⚠️ Persistence error:', err.message)
  }
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Format a Date object into a readable 12-hour time string.
 * @param {Date} date
 * @returns {string} e.g. "10:32 AM"
 */
function formatTime(date) {
  let h = date.getHours()
  const m = date.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

// ── Public API ───────────────────────────────────────────────

/**
 * Add a new message to the store.
 * Called when the ESP32 sends a POST /api/message.
 */
function addMessage({ message, category, button }) {
  const now = new Date()

  const msg = {
    id: Date.now().toString(),
    message,
    category,
    button: button || '',
    timestamp: now.toISOString(),
    time: formatTime(now),
  }

  // Prepend so newest is first
  messages.unshift(msg)

  // Cap message history to latest 200 items to keep storage lean
  if (messages.length > 200) {
    messages = messages.slice(0, 200)
  }

  latestMessage = msg

  // Mark device as connected
  deviceConnected = true
  lastActivityTime = Date.now()

  // Save to disk asynchronously
  persistMessages()

  return msg
}

/**
 * Get the latest message, or null if none exist.
 */
function getLatestMessage() {
  return latestMessage || null
}

/**
 * Get all messages (newest first).
 */
function getAllMessages() {
  return messages
}

/**
 * Clear all stored messages.
 */
function clearMessages() {
  messages = []
  latestMessage = null
  persistMessages()
}

/**
 * Check whether the device should be considered "connected".
 * It's connected if a message arrived within the timeout window.
 */
function isDeviceConnected() {
  if (!deviceConnected) return false
  if (!lastActivityTime) return false
  if (Date.now() - lastActivityTime > DEVICE_TIMEOUT_MS) {
    deviceConnected = false
    return false
  }
  return true
}

// Initialize on module load
initStorage()

module.exports = {
  addMessage,
  getLatestMessage,
  getAllMessages,
  clearMessages,
  isDeviceConnected,
}
