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
// GET INDIA DATE-TIME
// Generates IST timestamp in DD-MM-YYYY HH:mm:ss format.
// Used as a fallback only when the server does not supply
// indianDateTime (e.g. for frontend-only simulated messages).
// Uses 'en-GB' locale — 'en-IN' can return a 2-digit year
// in some environments, causing the date to not display.
// ============================================================

function getIndiaDateTime() {
  const now = new Date()

  // 'en-GB' gives unambiguous DD/MM/YYYY + 4-digit year
  // on all browsers and Node.js versions.
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


// ============================================================
// NORMALIZE MESSAGE
// Ensures every message has a consistent shape.
// Preserves the server-generated indianDateTime field.
// Never regenerates the timestamp on re-render or polling.
// ============================================================

const normalizeMessage = (msg) => {
  if (!msg) return null

  return {
    ...msg,

    id: msg.id || msg._id || Date.now().toString(),

    message: msg.message || '',

    category: msg.category || 'General',

    // Use server-supplied IST timestamp if present.
    // Fall back to generating one now (only for frontend-simulated messages).
    indianDateTime:
      msg.indianDateTime ||
      getIndiaDateTime(),
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