import SuperJSON from 'superjson'
import { MergeableChannelOptions } from '../../types'
import { __DEVTOOLS_KIT_BROADCAST_MESSAGING_EVENT_KEY } from './context'

const BROADCAST_CHANNEL_NAME = '__devtools-kit:broadcast-channel__'

export function createBroadcastChannel(): MergeableChannelOptions {
  const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)

  return {
    post: (data) => {
      channel.postMessage(SuperJSON.stringify({
        event: __DEVTOOLS_KIT_BROADCAST_MESSAGING_EVENT_KEY,
        data,
      }))
    },
    on: (handler) => {
      channel.onmessage = (event) => {
        // The channel can receive payloads that are not JSON strings (e.g. an
        // object) when it is shared with other code. Parsing a non-string
        // value throws `SyntaxError: "[object Object]" is not valid JSON`.
        if (typeof event.data !== 'string')
          return
        const parsed = SuperJSON.parse<{ event: string, data: unknown }>(event.data)
        if (parsed.event === __DEVTOOLS_KIT_BROADCAST_MESSAGING_EVENT_KEY) {
          handler(parsed.data)
        }
      }
    },
  }
}
