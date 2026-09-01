/**
 * useParentSession
 *
 * Listens for postMessage events sent by the Angular shell (AgentComponent)
 * and persists the data into sessionStorage so every part of the app can
 * read it via the helper getParentSession().
 *
 * Messages handled
 * ─────────────────
 *   SET_TOKEN            → sessionStorage['access_token']
 *   SET_ORGANISATION     → sessionStorage['organisation']
 *   SET_PARENT_SESSION   → sessionStorage['parentSession'] (JSON)
 *
 * Ack messages sent back to the parent
 * ─────────────────────────────────────
 *   TOKEN_RECEIVED
 *   ORG_RECEIVED
 *   PARENT_SESSION_RECEIVED
 */

import { useEffect } from 'react';

export interface ParentSession {
  projectId?: string | number;
  projectName?: string;
  roleId?: string | number;
  roleName?: string;
  portfolioId?: string | number;
  portfolioName?: string;
  token?: string;
  userId?: string | number;
  userName?: string;
}

const SESSION_KEY = 'parentSession';

/** Read the stored parent session. Returns null when not embedded. */
export function getParentSession(): ParentSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as ParentSession) : null;
  } catch {
    return null;
  }
}

export function useParentSession(): void {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || typeof msg.type !== 'string') return;

      // Determine the parent origin so we can reply safely.
      // event.origin is '*' only when the sender used '*'; otherwise it's
      // the exact origin — we accept both scenarios.
      const replyOrigin = event.origin === 'null' || event.origin === '' ? '*' : event.origin;

      const ack = (type: string, extra?: Record<string, unknown>) => {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type, status: 'ok', ...extra }, replyOrigin);
        }
      };

      switch (msg.type) {
        case 'SET_TOKEN': {
          const token: string = msg.token ?? '';
          if (token) sessionStorage.setItem('access_token', token);
          ack('TOKEN_RECEIVED');
          break;
        }

        case 'SET_ORGANISATION': {
          const org: string = msg.organisation ?? '';
          if (org) sessionStorage.setItem('organisation', org);
          ack('ORG_RECEIVED');
          break;
        }

        case 'SET_PARENT_SESSION': {
          const details: ParentSession = msg.parentSessionDetails ?? {};
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(details));

          // Also mirror individual keys that other services may read directly
          if (details.token)     sessionStorage.setItem('access_token', details.token);
          if (details.projectId !== undefined)
            sessionStorage.setItem('projectId', String(details.projectId));
          if (details.projectName)
            sessionStorage.setItem('projectName', details.projectName);
          if (details.roleId !== undefined)
            sessionStorage.setItem('roleId', String(details.roleId));
          if (details.roleName)
            sessionStorage.setItem('roleName', details.roleName);

          ack('PARENT_SESSION_RECEIVED');
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
}
