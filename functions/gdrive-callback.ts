/**
 * Cloudflare Pages Function for Google Drive OAuth Callback
 * 
 * This function handles the redirect from Google OAuth.
 * 
 * IMPORTANT: For implicit OAuth flow (response_type=token), the access_token
 * is in the URL hash fragment (e.g., #access_token=xxx), which is NEVER sent
 * to the server. So this function always returns an HTML page with JavaScript
 * that reads the hash client-side and posts it to the opener window.
 * 
 * For code flow, the code is in the query string which IS sent to the server,
 * but we handle it the same way for consistency.
 * 
 * Location: functions/gdrive-callback.ts
 * Deployed to: https://3mpwrapp.pages.dev/gdrive-callback
 */

interface PagesContext {
  request: Request;
  env?: unknown;
  params?: Record<string, string>;
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  // Always return HTML that handles both code and implicit flow client-side
  // This is because hash fragments are never sent to the server
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Drive Authorization</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 500px;
      width: 90%;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h1 { font-size: 24px; color: #333; margin-bottom: 10px; }
    p { color: #666; font-size: 16px; line-height: 1.5; }
    .success h1 { color: #10b981; }
    .error h1 { color: #ef4444; }
    .status { margin-top: 15px; font-size: 14px; color: #999; }
    #loading, #success, #error { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <div id="loading">
      <div class="spinner"></div>
      <h1>Authorizing...</h1>
      <p>Connecting your Google Drive account</p>
      <div class="status">This window will close automatically</div>
    </div>
    <div id="success" class="success">
      <h1>✓ Success!</h1>
      <p>Your Google Drive account is now connected</p>
      <div class="status">You can close this window</div>
    </div>
    <div id="error" class="error">
      <h1>✗ Authorization Failed</h1>
      <p id="errorMessage">An error occurred during authorization</p>
      <div class="status">Please try again or contact support</div>
    </div>
  </div>

  <script>
    // Show loading initially
    document.getElementById('loading').style.display = 'block';
    
    console.log('[GDrive Callback] Page loaded');
    console.log('[GDrive Callback] Full URL:', window.location.href);
    console.log('[GDrive Callback] Hash:', window.location.hash);
    console.log('[GDrive Callback] Search:', window.location.search);
    console.log('[GDrive Callback] Has opener:', !!window.opener);
    
    // Parse URL parameters
    const url = new URL(window.location.href);
    
    // Code flow: code is in query string
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    // Implicit flow: access_token is in hash fragment (NEVER sent to server)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const tokenType = hashParams.get('token_type');
    const expiresIn = hashParams.get('expires_in');
    
    console.log('[GDrive Callback] Parsed - code:', !!code, 'access_token:', !!accessToken, 'error:', error);
    
    function showSuccess() {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('success').style.display = 'block';
    }
    
    function showError(message) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('error').style.display = 'block';
      document.getElementById('errorMessage').textContent = message;
    }
    
    function sendMessageToOpener() {
      if (window.opener) {
        try {
          // CRITICAL: Send the full URL including hash fragment
          // The parent window expects 'expo-auth-session' type
          const message = {
            type: 'expo-auth-session',
            url: window.location.href
          };
          console.log('[GDrive Callback] Sending message:', message.type);
          window.opener.postMessage(message, '*');
          console.log('[GDrive Callback] Message sent!');
          return true;
        } catch (e) {
          console.error('[GDrive Callback] Failed to post message:', e);
          return false;
        }
      } else {
        console.warn('[GDrive Callback] No opener window found');
        return false;
      }
    }
    
    // Handle the response
    if (error) {
      console.error('[GDrive Callback] OAuth error:', error, errorDescription);
      showError(error + ': ' + (errorDescription || 'Unknown error'));
      sendMessageToOpener();
      setTimeout(() => window.close(), 5000);
    } else if (accessToken) {
      // Implicit flow - token in hash
      console.log('[GDrive Callback] Implicit flow - token received, length:', accessToken.length);
      console.log('[GDrive Callback] Token type:', tokenType);
      console.log('[GDrive Callback] Expires in:', expiresIn, 'seconds');
      sendMessageToOpener();
      showSuccess();
      setTimeout(() => window.close(), 1500);
    } else if (code) {
      // Code flow - code in query string
      console.log('[GDrive Callback] Code flow - authorization code received');
      sendMessageToOpener();
      showSuccess();
      setTimeout(() => window.close(), 1500);
    } else {
      // No code or token
      console.error('[GDrive Callback] No code or token found in URL');
      showError('Authorization code not found. Please try again.');
      sendMessageToOpener();
      setTimeout(() => window.close(), 5000);
    }
  </script>
</body>
</html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Allow popup to communicate with opener
        'Cross-Origin-Opener-Policy': 'unsafe-none',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
};
