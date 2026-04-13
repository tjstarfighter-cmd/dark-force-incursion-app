const CLIENT_ID = '528457753404-5712ntr2cpmru055avp0k3ipqv7g1de3.apps.googleusercontent.com'
const SCOPES = 'https://www.googleapis.com/auth/drive.file'
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

function getRedirectUri(): string {
  return window.location.origin + window.location.pathname
}

/** Generate a random string for PKCE code_verifier */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/** SHA-256 hash for PKCE code_challenge */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

let accessToken: string | null = null
let tokenExpiry: number = 0

export function isAuthenticated(): boolean {
  return !!accessToken && Date.now() < tokenExpiry
}

export function getAccessToken(): string | null {
  if (!isAuthenticated()) return null
  return accessToken
}

/**
 * Start the OAuth PKCE flow by redirecting to Google.
 */
export async function startAuthFlow(): Promise<void> {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Store verifier for the callback
  sessionStorage.setItem('oauth_code_verifier', codeVerifier)
  sessionStorage.setItem('oauth_return_view', 'settings')

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent',
  })

  window.location.href = `${AUTH_ENDPOINT}?${params}`
}

/**
 * Handle the OAuth callback. Call this on app load.
 * Returns true if an auth code was found and exchanged.
 */
export async function handleAuthCallback(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const codeVerifier = sessionStorage.getItem('oauth_code_verifier')

  if (!code || !codeVerifier) return false

  // Clean up URL and session storage
  sessionStorage.removeItem('oauth_code_verifier')
  window.history.replaceState({}, '', window.location.pathname)

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: getRedirectUri(),
      }),
    })

    if (!response.ok) {
      console.warn('OAuth token exchange failed:', await response.text())
      return false
    }

    const data = await response.json()
    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in * 1000)

    // Store refresh token if provided
    if (data.refresh_token) {
      localStorage.setItem('gdrive_refresh_token', data.refresh_token)
    }

    return true
  } catch (e) {
    console.warn('OAuth callback error:', e)
    return false
  }
}

/**
 * Try to refresh the access token using a stored refresh token.
 */
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('gdrive_refresh_token')
  if (!refreshToken) return false

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) return false

    const data = await response.json()
    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in * 1000)
    return true
  } catch {
    return false
  }
}

export function clearAuth(): void {
  accessToken = null
  tokenExpiry = 0
  localStorage.removeItem('gdrive_refresh_token')
}
