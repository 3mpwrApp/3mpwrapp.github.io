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
 * For native apps (no opener window), it redirects to the app's deep link scheme
 * with the token in the URL.
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
    #loading, #success, #error, #redirecting { display: none; }
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
    <div id="redirecting">
      <div class="spinner"></div>
      <h1>Redirecting to App...</h1>
      <p>Taking you back to the app</p>
      <div class="status">Please wait...</div>
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
    console.log('[GDrive Callback] User Agent:', navigator.userAgent);
    
    // Detect if this is from a native app (no opener window)
    const isNativeApp = !window.opener;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('[GDrive Callback] Is native app:', isNativeApp);
    console.log('[GDrive Callback] Is mobile:', isMobile);
    
    // Parse URL parameters
    const url = new URL(window.location.href);
    
    // Check state parameter to see if this is from native app
    const state = url.searchParams.get('state') || '';
    const isFromNativeApp = state.startsWith('native_app_') || (isNativeApp && isMobile);
    console.log('[GDrive Callback] State:', state);
    console.log('[GDrive Callback] Is from native app:', isFromNativeApp);
    
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
    
    function showLoading() {
      document.getElementById('loading').style.display = 'block';
      document.getElementById('redirecting').style.display = 'none';
      document.getElementById('success').style.display = 'none';
      document.getElementById('error').style.display = 'none';
    }
    
    function showRedirecting() {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('redirecting').style.display = 'block';
      document.getElementById('success').style.display = 'none';
      document.getElementById('error').style.display = 'none';
    }
    
    function showSuccess() {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('redirecting').style.display = 'none';
      document.getElementById('success').style.display = 'block';
      document.getElementById('error').style.display = 'none';
    }
    
    function showError(message) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('redirecting').style.display = 'none';
      document.getElementById('success').style.display = 'none';
      document.getElementById('error').style.display = 'block';
      document.getElementById('errorMessage').textContent = message;
    }
    
    function sendMessageToOpener() {
      if (window.opener) {
        try {
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
      }
      return false;
    }
    
    function redirectToNativeApp(token, err) {
      // Build deep link URL to redirect back to the app
      // The app listens for: empowrapp://gdrive-callback#access_token=...
      let deepLink;
      let params = '';
      if (token) {
        // Include the hash fragment with the token
        params = 'access_token=' + encodeURIComponent(token);
        if (expiresIn) params += '&expires_in=' + expiresIn;
        if (tokenType) params += '&token_type=' + tokenType;
        deepLink = 'empowrapp://gdrive-callback#' + params;
      } else if (err) {
        params = 'error=' + encodeURIComponent(err);
        deepLink = 'empowrapp://gdrive-callback?' + params;
      } else {
        params = 'error=unknown';
        deepLink = 'empowrapp://gdrive-callback?' + params;
      }
      
      console.log('[GDrive Callback] Redirecting to native app:', deepLink);
      showRedirecting();
      
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      // For Android, also try intent:// scheme which is more reliable in Custom Tabs
      // Format: intent://gdrive-callback#params#Intent;scheme=empowrapp;package=com.app3mpwr.app3mpwr;end
      if (isAndroid) {
        const intentUrl = 'intent://gdrive-callback' + 
          (token ? '#' + params : '?' + params) + 
          '#Intent;scheme=empowrapp;package=com.app3mpwr.app3mpwr;end';
        console.log('[GDrive Callback] Android intent URL:', intentUrl);
        
        // Try intent:// first for Android (most reliable in Chrome Custom Tabs)
        try {
          window.location.href = intentUrl;
          console.log('[GDrive Callback] Intent redirect triggered');
        } catch (e) {
          console.error('[GDrive Callback] Intent redirect failed:', e);
        }
      }
      
      // Method 1: Try anchor click (works well for regular browsers)
      setTimeout(() => {
        try {
          const a = document.createElement('a');
          a.href = deepLink;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          console.log('[GDrive Callback] Anchor click triggered');
        } catch (e) {
          console.error('[GDrive Callback] Anchor click failed:', e);
        }
      }, 200);
      
      // Method 2: Also try window.location as fallback
      setTimeout(() => {
        console.log('[GDrive Callback] Trying window.location.href fallback');
        window.location.href = deepLink;
      }, 400);
      
      // Method 3: Try window.open as another fallback
      setTimeout(() => {
        console.log('[GDrive Callback] Trying window.open fallback');
        window.open(deepLink, '_self');
      }, 600);
      
      // If redirect doesn't work (e.g., app not installed), show success/error
      setTimeout(() => {
        if (token) {
          showSuccess();
        } else {
          showError(err || 'Unknown error');
        }
      }, 2000);
    }
    
    // Handle the response
    if (error) {
      console.error('[GDrive Callback] OAuth error:', error, errorDescription);
      const errMsg = error + ': ' + (errorDescription || 'Unknown error');
      
      if (isFromNativeApp) {
        redirectToNativeApp(null, errMsg);
      } else {
        showError(errMsg);
        sendMessageToOpener();
        setTimeout(() => window.close(), 5000);
      }
    } else if (accessToken) {
      console.log('[GDrive Callback] Implicit flow - token received, length:', accessToken.length);
      
      if (isFromNativeApp) {
        // Redirect to native app with token
        redirectToNativeApp(accessToken, null);
      } else {
        // Web flow - send to opener window
        sendMessageToOpener();
        showSuccess();
        setTimeout(() => window.close(), 1500);
      }
    } else if (code) {
      console.log('[GDrive Callback] Code flow - authorization code received');
      
      if (isFromNativeApp) {
        // Redirect to native app with code (though native should use implicit flow)
        window.location.href = 'empowrapp://gdrive-callback?code=' + encodeURIComponent(code);
        showRedirecting();
      } else {
        sendMessageToOpener();
        showSuccess();
        setTimeout(() => window.close(), 1500);
      }
    } else {
      console.error('[GDrive Callback] No code or token found in URL');
      const errMsg = 'Authorization code not found. Please try again.';
      
      if (isFromNativeApp) {
        redirectToNativeApp(null, errMsg);
      } else {
        showError(errMsg);
        sendMessageToOpener();
        setTimeout(() => window.close(), 5000);
      }
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
