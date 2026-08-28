import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import { startPolling, deleteAllMessages } from '../services/esp32Service'

const MessageContext = createContext(null)

const formatTime = () => {
  const now = new Date()
  let h = now.getHours()
  const m = now.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

const initialState = {
  deviceOnline: false,
  latestMessage: null,
  messageHistory: [],
}

function messageReducer(state, action) {
  switch (action.type) {
    case 'SET_DEVICE_STATUS':
      return { ...state, deviceOnline: action.payload }

    case 'NEW_MESSAGE': {
      const msg = {
        id: Date.now().toString(),
        message: action.payload.message,
        category: action.payload.category,
        time: action.payload.time || formatTime(),
      }
      return {
        ...state,
        deviceOnline: true,
        latestMessage: msg,
        messageHistory: [msg, ...state.messageHistory],
      }
    }

    // SET_LATEST — update the latest message from backend polling
    // Only updates if the message id changed (avoids unnecessary re-renders)
    case 'SET_LATEST': {
      const incoming = action.payload
      if (!incoming) return state
      // Same message as before? Skip
      if (state.latestMessage && state.latestMessage.id === incoming.id) return state
      return {
        ...state,
        latestMessage: incoming,
      }
    }

    // SET_HISTORY — replace the full history from backend polling
    case 'SET_HISTORY': {
      const incoming = action.payload
      // Quick length check to avoid unnecessary re-renders
      if (incoming.length === state.messageHistory.length &&
          incoming.length > 0 &&
          incoming[0].id === (state.messageHistory[0]?.id)) {
        return state
      }
      return {
        ...state,
        messageHistory: incoming,
      }
    }

    case 'CLEAR_HISTORY':
      return { ...state, messageHistory: [], latestMessage: null }

    default:
      return state
  }
}

export function MessageProvider({ children }) {
  const [state, dispatch] = useReducer(messageReducer, initialState)
  const stopPollingRef = useRef(null)

  const setDeviceStatus = useCallback((online) => {
    dispatch({ type: 'SET_DEVICE_STATUS', payload: online })
  }, [])

  const sendMessage = useCallback((message, category) => {
    dispatch({ type: 'NEW_MESSAGE', payload: { message, category } })
  }, [])

  const clearHistory = useCallback(async () => {
    // Clear on the backend too
    await deleteAllMessages()
    dispatch({ type: 'CLEAR_HISTORY' })
  }, [])

  // ── Backend Polling ────────────────────────────────────────
  // Polls GET /api/device-status, /api/latest-message, /api/messages
  // every 2 seconds so the dashboard stays in sync with the ESP32.
  useEffect(() => {
    const stop = startPolling(
      // onStatus — update device online/offline
      (status) => {
        dispatch({ type: 'SET_DEVICE_STATUS', payload: status.connected })
      },
      // onMessage — update latest message
      (msg) => {
        dispatch({ type: 'SET_LATEST', payload: msg })
      },
      // onHistory — update full message history
      (history) => {
        dispatch({ type: 'SET_HISTORY', payload: history })
      },
      2000 // poll every 2 seconds
    )

    stopPollingRef.current = stop

    return () => {
      if (stopPollingRef.current) stopPollingRef.current()
    }
  }, [])

  const value = {
    deviceOnline: state.deviceOnline,
    latestMessage: state.latestMessage,
    messageHistory: state.messageHistory,
    setDeviceStatus,
    sendMessage,
    clearHistory,
  }

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider')
  }
  return context
}
