import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from 'react'

import {
  startPolling,
  deleteAllMessages,
} from '../services/esp32Service'

const MessageContext = createContext(null)


// ============================================================
// FORMAT TIME
// Converts backend UTC timestamp to the browser's local time.
// Example:
// Backend: 16:46 UTC
// India:   10:16 PM
// ============================================================

const formatTime = (timestamp) => {
  if (!timestamp) {
    const now = new Date()

    return now.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const date = new Date(timestamp)

  // If timestamp is invalid, fall back safely
  if (isNaN(date.getTime())) {
    return timestamp
  }

  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}


// ============================================================
// NORMALIZE MESSAGE
// Ensures every message from backend has the correct local time
// ============================================================

const normalizeMessage = (msg) => {
  if (!msg) return null

  return {
    ...msg,

    id: msg.id || msg._id || Date.now().toString(),

    message: msg.message || '',

    category: msg.category || 'General',

    // Try all possible timestamp fields from backend
    time: formatTime(
      msg.timestamp ||
      msg.createdAt ||
      msg.time
    ),
  }
}


// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
  deviceOnline: false,
  latestMessage: null,
  messageHistory: [],
}


// ============================================================
// REDUCER
// ============================================================

function messageReducer(state, action) {

  switch (action.type) {


    // --------------------------------------------------------
    // DEVICE STATUS
    // --------------------------------------------------------

    case 'SET_DEVICE_STATUS':

      return {
        ...state,
        deviceOnline: action.payload,
      }


    // --------------------------------------------------------
    // NEW MESSAGE
    // Used when adding a message directly from frontend
    // --------------------------------------------------------

    case 'NEW_MESSAGE': {

      const msg = normalizeMessage({
        id: Date.now().toString(),

        message: action.payload.message,

        category: action.payload.category,

        timestamp: action.payload.timestamp,
      })

      return {
        ...state,

        deviceOnline: true,

        latestMessage: msg,

        messageHistory: [
          msg,
          ...state.messageHistory,
        ],
      }
    }


    // --------------------------------------------------------
    // SET LATEST MESSAGE
    // Receives latest message from backend polling
    // --------------------------------------------------------

    case 'SET_LATEST': {

      const incoming =
        normalizeMessage(action.payload)

      if (!incoming) {
        return state
      }


      // Avoid unnecessary updates if same message
      if (
        state.latestMessage &&
        state.latestMessage.id === incoming.id
      ) {

        return state
      }


      return {
        ...state,

        latestMessage: incoming,
      }
    }


    // --------------------------------------------------------
    // SET MESSAGE HISTORY
    // Receives complete history from backend
    // --------------------------------------------------------

    case 'SET_HISTORY': {

      const incoming =
        Array.isArray(action.payload)
          ? action.payload.map(normalizeMessage)
          : []


      // Avoid unnecessary re-render
      if (

        incoming.length ===
        state.messageHistory.length &&

        incoming.length > 0 &&

        incoming[0].id ===
        state.messageHistory[0]?.id

      ) {

        return state
      }


      return {
        ...state,

        messageHistory: incoming,
      }
    }


    // --------------------------------------------------------
    // CLEAR HISTORY
    // --------------------------------------------------------

    case 'CLEAR_HISTORY':

      return {
        ...state,

        messageHistory: [],

        latestMessage: null,
      }


    default:

      return state
  }
}


// ============================================================
// MESSAGE PROVIDER
// ============================================================

export function MessageProvider({
  children,
}) {

  const [state, dispatch] =
    useReducer(
      messageReducer,
      initialState
    )


  const stopPollingRef =
    useRef(null)


  // ==========================================================
  // SET DEVICE STATUS
  // ==========================================================

  const setDeviceStatus =
    useCallback((online) => {

      dispatch({
        type: 'SET_DEVICE_STATUS',

        payload: online,
      })

    }, [])


  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const sendMessage =
    useCallback((
      message,
      category,
      timestamp
    ) => {

      dispatch({

        type: 'NEW_MESSAGE',

        payload: {
          message,
          category,
          timestamp,
        },

      })

    }, [])


  // ==========================================================
  // CLEAR HISTORY
  // ==========================================================

  const clearHistory =
    useCallback(async () => {

      try {

        await deleteAllMessages()

        dispatch({
          type: 'CLEAR_HISTORY',
        })

      }

      catch (error) {

        console.error(
          'Failed to clear message history:',
          error
        )

      }

    }, [])


  // ==========================================================
  // BACKEND POLLING
  // ==========================================================

  useEffect(() => {

    const stop =
      startPolling(

        // DEVICE STATUS
        (status) => {

          dispatch({

            type: 'SET_DEVICE_STATUS',

            payload:
              status?.connected || false,

          })

        },


        // LATEST MESSAGE
        (msg) => {

          dispatch({

            type: 'SET_LATEST',

            payload: msg,

          })

        },


        // MESSAGE HISTORY
        (history) => {

          dispatch({

            type: 'SET_HISTORY',

            payload: history,

          })

        },


        // Poll every 2 seconds
        2000

      )


    stopPollingRef.current =
      stop


    return () => {

      if (
        stopPollingRef.current
      ) {

        stopPollingRef.current()

      }

    }

  }, [])


  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {

    deviceOnline:
      state.deviceOnline,

    latestMessage:
      state.latestMessage,

    messageHistory:
      state.messageHistory,

    setDeviceStatus,

    sendMessage,

    clearHistory,

  }


  return (

    <MessageContext.Provider
      value={value}
    >

      {children}

    </MessageContext.Provider>

  )
}


// ============================================================
// CUSTOM HOOK
// ============================================================

export function useMessages() {

  const context =
    useContext(MessageContext)


  if (!context) {

    throw new Error(

      'useMessages must be used within a MessageProvider'

    )

  }


  return context
}