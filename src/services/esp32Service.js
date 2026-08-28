/**
 * ═══════════════════════════════════════════════════════════════
 *  ESP32 Service Layer — Backend Communication
 * ═══════════════════════════════════════════════════════════════
 *
 *  Connects the React caregiver dashboard to the Express backend.
 *
 *  Configuration:
 *   - Production: Set VITE_API_URL in environment (e.g. https://my-backend.onrender.com)
 *   - Development: Automatically discovers backend on port 5000 or 5001 (macOS fallback)
 * ═══════════════════════════════════════════════════════════════
 */

// Read configured API URL from Vite environment variables (if set)
const configuredBase =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE)) ||
  ''

// In development without an explicit env URL, test ports 5000 and 5001
let activeApiBase = configuredBase ? configuredBase.replace(/\/+$/, '') : 'http://localhost:5000'

/**
 * Robust fetch wrapper:
 * - If VITE_API_URL is configured (production), fetches from that URL directly.
 * - If in local dev without env config, falls back gracefully between 5000 and 5001.
 */
async function apiRequest(path, options = {}) {
  // If explicitly configured via environment variable, use it directly
  if (configuredBase) {
    const targetUrl = `${configuredBase.replace(/\/+$/, '')}${path}`
    const res = await fetch(targetUrl, {
      ...options,
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res
  }

  // Local development auto-discovery
  const candidates = [activeApiBase, activeApiBase === 'http://localhost:5000' ? 'http://localhost:5001' : 'http://localhost:5000']
  for (const base of candidates) {
    try {
      const res = await fetch(`${base}${path}`, {
        ...options,
        signal: AbortSignal.timeout(2500),
      })
      if (res.ok) {
        activeApiBase = base
        return res
      }
    } catch {
      // Try next candidate
    }
  }
  throw new Error('Backend unreachable')
}

// ── Device Status ────────────────────────────────────────────

/**
 * Fetch device connection status.
 */
export async function fetchDeviceStatus() {
  try {
    const res = await apiRequest('/api/device-status')
    return await res.json()
  } catch {
    return { connected: false, deviceName: 'ESP32 Assistive Device', wifi: false }
  }
}

// ── Latest Message ───────────────────────────────────────────

/**
 * Fetch the latest message received from the ESP32.
 */
export async function fetchLatestMessage() {
  try {
    const res = await apiRequest('/api/latest-message')
    const data = await res.json()
    if (!data || !data.exists) return null
    return data
  } catch {
    return null
  }
}

// ── Message History ──────────────────────────────────────────

/**
 * Fetch all message history (newest first).
 */
export async function fetchAllMessages() {
  try {
    const res = await apiRequest('/api/messages')
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// ── Send Message (Simulation / Testing) ───────────────────────

/**
 * Send a message to the backend (simulates ESP32 button press).
 */
export async function postMessage({ message, category, button }) {
  try {
    const res = await apiRequest('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, category, button }),
    })
    return await res.json()
  } catch (err) {
    return { success: false, error: 'Backend unreachable' }
  }
}

// ── Clear History ────────────────────────────────────────────

/**
 * Clear all messages from backend persistent storage.
 */
export async function deleteAllMessages() {
  try {
    const res = await apiRequest('/api/messages', {
      method: 'DELETE',
    })
    return await res.json()
  } catch {
    return { success: false, error: 'Backend unreachable' }
  }
}

// ── Polling Engine ───────────────────────────────────────────

/**
 * Polls the backend every `interval` ms.
 */
export function startPolling(onStatus, onMessage, onHistory, interval = 2000) {
  let active = true

  const poll = async () => {
    if (!active) return

    try {
      const status = await fetchDeviceStatus()
      if (active && onStatus) onStatus(status)

      const msg = await fetchLatestMessage()
      if (active && onMessage && msg) onMessage(msg)

      const history = await fetchAllMessages()
      if (active && onHistory) onHistory(history)
    } catch {
      // Ignored: failures handled inside individual fetch functions
    }

    if (active) {
      setTimeout(poll, interval)
    }
  }

  poll()

  return () => {
    active = false
  }
}
