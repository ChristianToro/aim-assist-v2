import { useRef, useState } from 'react'
import { ApiError } from '../services/api'
import { startMatch } from '../services/matches'
import { saveMatchResult } from '../services/scores'

// Answers that mean the server refused this match itself (not found,
// implausible, already submitted, expired), as opposed to a failure.
const REJECTED_STATUSES = new Set([400, 404, 409, 410])

const failureStatus = (error) =>
  error instanceof ApiError && REJECTED_STATUSES.has(error.status)
    ? 'rejected'
    : 'error'

/*
 * useMatchSave — a signed-in player's match on the server. beginMatch()
 * requests a match ticket as the round starts, in parallel with the
 * engine; saveMatch(events) redeems it with the event log at game over.
 *
 * saveStatus: null | 'saving' | 'saved' | 'unregistered' (no ticket) |
 * 'rejected' | 'error'. Signed out, nothing is requested or saved.
 */
export const useMatchSave = ({ mode, user }) => {
  const [saveStatus, setSaveStatus] = useState(null)
  // The current round's ticket request (a promise), or null.
  const ticketRef = useRef(null)

  const requestTicket = () => {
    const ticket = startMatch(mode.label)
    // Forget a failed request, so a Restart asks again. saveMatch reports
    // the missing ticket at game over; this catch also keeps the
    // rejection from surfacing as unhandled before then.
    ticket.catch((error) => {
      console.error('Failed to register match:', error)
      if (ticketRef.current === ticket) ticketRef.current = null
    })
    return ticket
  }

  // A Restart keeps the round's ticket: it's spent only on submit, and the
  // server's checks only need at least the match's real time to have
  // passed since it was issued. Start and Play again take a fresh one.
  const beginMatch = ({ restart = false } = {}) => {
    setSaveStatus(null)
    if (!user) return
    if (restart && ticketRef.current) return
    ticketRef.current = requestTicket()
  }

  const saveMatch = async (events) => {
    if (!user) return
    const ticket = ticketRef.current
    ticketRef.current = null
    setSaveStatus('saving')

    const issued = await ticket?.catch(() => null)
    if (!issued) {
      setSaveStatus('unregistered')
      return
    }
    try {
      await saveMatchResult({ matchId: issued.matchId, events })
      setSaveStatus('saved')
    } catch (error) {
      console.error('Failed to save match:', error)
      setSaveStatus(failureStatus(error))
    }
  }

  return { saveStatus, beginMatch, saveMatch }
}
