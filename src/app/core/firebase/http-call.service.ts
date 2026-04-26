import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';

const BASE_URL = `https://${environment.functionsRegion}-${environment.vertexAiProject}.cloudfunctions.net`;

/**
 * Low-level helper for calling Cloud Functions in a cross-project setup.
 *
 * AngularFire's `httpsCallable(fns, 'NAME')` auto-attaches the Firebase Auth
 * token only when using a *named* function.  Passing a full URL bypasses that
 * mechanism and the token is **not** sent, causing 401 Unauthenticated errors.
 *
 * This service manually retrieves the ID token and injects it as a Bearer
 * header before every request, matching the Firebase callable wire protocol
 * so the Go middleware can verify it.
 */
@Injectable({ providedIn: 'root' })
export class HttpCallService {
  private auth = inject(Auth);

  /**
   * Call a Cloud Function by name (relative to the AI project base URL).
   * Wraps the request body in `{ data: payload }` as required by the
   * Firebase callable protocol and unwraps `{ result: ... }` in the response.
   */
  async call<Req, Res>(functionName: string, payload: Req): Promise<Res> {
    const token = await this.auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error(`Not authenticated — cannot call ${functionName}`);
    }

    const url = `${BASE_URL}/${functionName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      // Firebase callable protocol wraps the body in { data: ... }
      body: JSON.stringify({ data: payload }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${functionName} failed (${response.status}): ${text}`);
    }

    const json = await response.json();

    // Firebase callable response format: { result: ... }
    // Plain Go handlers return the result directly.
    return (json.result ?? json) as Res;
  }
}
