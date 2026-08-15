import { getPayload, type BasePayload } from 'payload'
import config from '../../payload.config'
import { requireEnv } from './env'

let clientPromise: Promise<BasePayload> | null = null

/** Memoized Payload local-API client — one init per process instead of one per script. */
export function getPayloadClient(): Promise<BasePayload> {
  requireEnv('PAYLOAD_SECRET')
  if (!clientPromise) {
    clientPromise = getPayload({ config })
  }
  return clientPromise
}
