import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Shared HTTP interceptor used by every MFE. Registered ONCE by the host so the
 * Angular root injector applies it to every outbound HttpClient request — remotes
 * never need to register it themselves.
 *
 * Responsibilities:
 *  - Attach the bearer JWT from localStorage (if present)
 *  - Add the X-Requested-With marker that the proxy-service expects
 *  - Default Content-Type to application/json for non-FormData payloads
 *  - Forward Project / Role headers from sessionStorage when the app has a context
 *  - Forward access-token header for /service endpoints (legacy contract)
 *
 * Replaces the per-MFE AipInterceptorService copies that lived in
 *   <mfe>/projects/<name>/src/app/features/services/interceptor.ts
 */
@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  // Note: return type intentionally left as `any` so this shared interceptor
  // compiles cleanly under each consumer MFE's tsconfig path mapping. Each MFE
  // has its own rxjs install; using a concrete `Observable<HttpEvent>` return
  // would surface as a TS2719 "two different types with this name" because TS
  // sees them as distinct from the shared-lib's rxjs.
  intercept(request: HttpRequest<any>, next: HttpHandler): any {
    const activeProfile = sessionStorage.getItem('activeProfiles');
    const capBaseUrl = sessionStorage.getItem('capBaseUrl');
    const project = sessionStorage.getItem('project');
    const role = sessionStorage.getItem('role');
    const accessToken = localStorage.getItem('accessToken');

    request = request.clone({ headers: request.headers.set('X-Requested-With', 'Leap') });

    if (!request.headers.has('Content-Type')) {
      request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
      if (activeProfile && JSON.parse(activeProfile).indexOf('dbjwt') !== -1) {
        request = request.clone({ headers: request.headers.set('charset', 'utf-8') });
      }
    }

    if (request.body instanceof FormData) {
      request = request.clone({ headers: request.headers.delete('Content-Type', 'application/json') });
    }

    const isApiRequest =
      (request.url.includes('api') || request.url.includes('json')) &&
      !request.url.endsWith('/api/aip/getConfigDetails') &&
      (!capBaseUrl || !request.url.includes(capBaseUrl));

    // Project and roleId headers are required by the backend's CustomAuthorizationManager
    // for ALL authenticated modes (dbjwt and oauth2). Send them whenever they are available.
    if (isApiRequest) {
      if (project) {
        try {
          const p = JSON.parse(project);
          if (p?.id?.toString()) {
            request = request.clone({ headers: request.headers.set('Project', p.id.toString()) });
          }
          if (p?.name?.toString()) {
            request = request.clone({ headers: request.headers.set('ProjectName', p.name.toString()) });
          }
        } catch { /* ignore parse errors */ }
      }
      if (role) {
        try {
          const r = JSON.parse(role);
          // Send rank (approval level: 2=Project Admin, 3=Org Admin) not id
          if (r?.rank?.toString()) {
            const rankValue = r.rank.toString();
            console.log('[AUTH-INTERCEPTOR] Sending rank header:', rankValue, 'for URL:', request.url);
            request = request.clone({ headers: request.headers.set('rank', rankValue) });
            // Also send as 'roleId' for compatibility with approval workflow endpoints
            request = request.clone({ headers: request.headers.set('roleId', rankValue) });
          }
          if (r?.name?.toString()) {
            request = request.clone({ headers: request.headers.set('roleName', r.name.toString()) });
          }
        } catch (e) { 
          console.error('[AUTH-INTERCEPTOR] Error parsing role:', e);
        }
      }
      
      // Send organization header for approval workflow filtering
      const org = sessionStorage.getItem('organization');
      if (org) {
        try {
          const o = JSON.parse(org);
          if (o?.id?.toString()) {
            request = request.clone({ headers: request.headers.set('organisation', o.id.toString()) });
          } else if (o?.name?.toString()) {
            request = request.clone({ headers: request.headers.set('organisation', o.name.toString()) });
          }
        } catch { 
          // If not JSON, treat as string directly
          request = request.clone({ headers: request.headers.set('organisation', org) });
        }
      }
    }

    // Authorization Bearer is only needed in dbjwt mode; oauth2 mode uses angular-oauth2-oidc.
    if (localStorage.hasOwnProperty('jwtToken') && isApiRequest) {
      request = request.clone({
        setHeaders: { Authorization: 'Bearer ' + localStorage.getItem('jwtToken') },
      });
    }

    // Extract username from JWT token and send as user-login header
    if (isApiRequest) {
      let username = null;
      
      // Try to get username from sessionStorage first (if stored by auth service)
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          username = userObj?.username || userObj?.preferred_username || userObj?.name;
        } catch { /* ignore parse errors */ }
      }
      
      // If not in sessionStorage, try to extract from JWT token
      if (!username) {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
          try {
            const parts = jwtToken.split('.');
            if (parts.length === 3) {
              const decoded = JSON.parse(atob(parts[1]));
              username = decoded?.preferred_username || decoded?.username || decoded?.name;
            }
          } catch { /* ignore JWT decode errors */ }
        }
      }
      
      // Also try from OAuth2 access token (different format)
      if (!username && localStorage.getItem('access_token')) {
        try {
          const token = localStorage.getItem('access_token') || '';
          const parts = token.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(atob(parts[1]));
            username = decoded?.preferred_username || decoded?.username || decoded?.name;
          }
        } catch { /* ignore JWT decode errors */ }
      }
      
      // Send user-login header if username found
      if (username) {
        request = request.clone({ headers: request.headers.set('user-login', username) });
      }
    }

    if (request.url.includes('service') && accessToken) {
      request = request.clone({ headers: request.headers.append('access-token', accessToken) });
    }

    return next.handle(request);
  }
}
