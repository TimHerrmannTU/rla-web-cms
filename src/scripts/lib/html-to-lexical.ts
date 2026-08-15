import type { BasePayload } from 'payload'
import {
  convertHTMLToLexical,
  defaultEditorConfig,
  sanitizeServerEditorConfig,
  type SanitizedServerEditorConfig,
} from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'

let editorConfigPromise: Promise<SanitizedServerEditorConfig> | null = null

/** Memoized per process — sanitizing the editor config is the same result every call. */
function getSanitizedEditorConfig(payload: BasePayload): Promise<SanitizedServerEditorConfig> {
  if (!editorConfigPromise) {
    editorConfigPromise = sanitizeServerEditorConfig(defaultEditorConfig, payload.config)
  }
  return editorConfigPromise
}

/**
 * Converts a raw HTML string (e.g. WordPress's `content.rendered`) into Payload's lexical
 * richText JSON shape, using the root default editor config — fine as long as the target
 * field's editor doesn't add node types beyond the defaults (custom blocks, etc.).
 */
export async function htmlToLexical(payload: BasePayload, html: string) {
  const editorConfig = await getSanitizedEditorConfig(payload)
  return convertHTMLToLexical({ editorConfig, html, JSDOM })
}
