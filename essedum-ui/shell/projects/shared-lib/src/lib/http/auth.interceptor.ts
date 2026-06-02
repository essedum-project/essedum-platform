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

    if (
      localStorage.hasOwnProperty('jwtToken') &&
      (request.url.includes('api') || request.url.includes('json')) &&
      !request.url.endsWith('/api/aip/getConfigDetails') &&
      (!capBaseUrl || !request.url.includes(capBaseUrl))
    ) {
      request = request.clone({
        setHeaders: { Authorization: 'Bearer ' + localStorage.getItem('jwtToken') },
      });
      if (project) {
        const p = JSON.parse(project);
        if (p?.id?.toString()) {
          request = request.clone({ headers: request.headers.set('Project', p.id.toString()) });
        }
        if (p?.name?.toString()) {
          request = request.clone({ headers: request.headers.set('ProjectName', p.name.toString()) });
        }
      }
      if (role) {
        const r = JSON.parse(role);
        if (r?.id?.toString()) {
          request = request.clone({ headers: request.headers.set('roleId', r.id.toString()) });
        }
        if (r?.name?.toString()) {
          request = request.clone({ headers: request.headers.set('roleName', r.name.toString()) });
        }
      }
    }

    if (request.url.includes('service') && accessToken) {
      request = request.clone({ headers: request.headers.append('access-token', accessToken) });
    }

    return next.handle(request);
  }
}
