/**
 * Cloudflare Pages Function for Google Drive OAuth Callback
 * 
 * This function handles the redirect from Google OAuth and:
 * 1. On web: Passes the code to the parent window via postMessage
 * 2. On mobile apps: Deep-links back to the app with the code
 * 
 * Deploy to: functions/gdrive-callback.ts
 */

interface PagesContext {
  request: Request;
  env?: unknown;
  params?: Record<string, string>;
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const state = url.searchParams.get('state');

  // If there's an error, show it
  if (error) {
    const errorDescription = url.searchParams.get('error_description') || 'Unknown error';
    return new Response(
      `
        <html>
          <head>
            <title>Authorization Error</title>
            <style>
              body { font-family: system-ui; padding: 20px; background: #f5f5f5; }
              .error { background: #fee; border: 1px solid #f88; padding: 20px; border-radius: 8px; }
              h1 { color: #c00; }
            </style>
          </head>
          <body>
            <div class="error">
              <h1>Authorization Failed</h1>
              <p><strong>Error:</strong> ${error}</p>
              <p><strong>Details:</strong> ${errorDescription}</p>
              <p>You can close this window.</p>
            </div>
          </body>
        </html>
      `,
      {
        status: 400,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }

  if (!code) {
    return new Response(
      `
        <html>
          <head>
            <title>Missing Code</title>
          </head>
          <body>
            <p>Error: Authorization code not found in callback.</p>
            <p>You can close this window.</p>
          </body>
        </html>
      `,
      {
        status: 400,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }

  // Success: Return HTML that posts the code back to the opener window
  return new Response(
    `
      <html>
        <head>
          <title>Authorizing...</title>
          <style>
            body { font-family: system-ui; padding: 20px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .container { text-align: center; }
            .success { background: #efe; border: 1px solid #8f8; padding: 20px; border-radius: 8px; }
            h1 { color: #080; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">
              <h1>✓ Authorization Successful</h1>
              <p>Your Google Drive connection is being established...</p>
              <p>This window will close automatically.</p>
            </div>
          </div>
          <script>
            // Pass the authorization code back to the opener window (web app)
            if (window.opener) {
              window.opener.postMessage({
                type: 'GDRIVE_AUTH_CODE',
                code: '${code}',
                state: '${state || ''}'
              }, '*');
              
              // Close this window after a short delay
              setTimeout(() => {
                window.close();
              }, 500);
            } else {
              // No opener (not opened from a window), show message
              document.body.innerHTML = '<p>Authorization successful! Please return to the app.</p>';
            }
          </script>
        </body>
      </html>
    `,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
};
