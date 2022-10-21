import { SESSION } from '../../../../types/session'
import { H3Event } from 'h3'
import { state } from '../../../shared/api'

export default defineEventHandler(async (event) => {
  const session_id = await event.context.params.session_id;

    let sessions = await useStorage().getItem('db:sessions') as SESSION[]
    const sessionId = sessions.findIndex((s: SESSION) => s.id === session_id)
    sessions[sessionId].readOnly = !sessions[sessionId].readOnly
    await useStorage().setItem('db:sessions', sessions)


    // Refresh all clients
    state.wss.clients.forEach((ws) => {
        // @ts-ignore
        console.log('send: to %o', ws.user.name)
        const sessionId = useCookie(event, 'session')
        const userId = useCookie(event, 'userId')
        if (ws.readyState === ws.OPEN && ws.user.session === sessionId) {
          ws.send(JSON.stringify({
            type: 'refresh',
          }))
        }
    })
    console.log('refreshed all clients')
    return true
})