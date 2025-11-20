/**
 * Cloudflare Pages Function - Admin Submissions Dashboard
 * View and manage submissions from the mobile app
 * 
 * Endpoint: https://3mpwrapp.pages.dev/admin/submissions
 */

// Cloudflare Workers type declarations
declare global {
  interface KVNamespace {
    get(key: string, options?: { type: 'text' }): Promise<string | null>;
    put(key: string, value: string, options?: { metadata?: any }): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string; metadata?: any }> }>;
  }
  
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }
  
  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    run(): Promise<D1Result>;
  }
  
  interface D1Result {
    success: boolean;
    results?: any[];
  }
}

interface Env {
  SUBMISSIONS_KV?: KVNamespace;
  SUBMISSIONS_DB?: D1Database;
  ADMIN_PASSWORD?: string; // Simple password protection
}

const ADMIN_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3mpwr App - Submissions Admin</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      font-size: 32px;
      margin-bottom: 8px;
      color: #60a5fa;
    }
    .subtitle {
      color: #94a3b8;
      margin-bottom: 32px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: #1e293b;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #334155;
    }
    .stat-label {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #60a5fa;
    }
    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .filter-btn {
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #1e293b;
      color: #e2e8f0;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .filter-btn:hover {
      background: #334155;
    }
    .filter-btn.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }
    .submissions {
      display: grid;
      gap: 16px;
    }
    .submission-card {
      background: #1e293b;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #334155;
      transition: all 0.2s;
    }
    .submission-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
    }
    .submission-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .submission-title {
      font-size: 20px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 8px;
    }
    .submission-type {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .type-event {
      background: #1e3a8a;
      color: #93c5fd;
    }
    .type-campaign {
      background: #581c87;
      color: #d8b4fe;
    }
    .submission-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
      padding: 16px;
      background: #0f172a;
      border-radius: 8px;
    }
    .meta-item {
      font-size: 13px;
    }
    .meta-label {
      color: #64748b;
      margin-bottom: 4px;
    }
    .meta-value {
      color: #e2e8f0;
      font-weight: 500;
    }
    .submission-description {
      color: #cbd5e1;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .submission-actions {
      display: flex;
      gap: 12px;
    }
    .action-btn {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-approve {
      background: #10b981;
      color: white;
    }
    .btn-approve:hover {
      background: #059669;
    }
    .btn-reject {
      background: #ef4444;
      color: white;
    }
    .btn-reject:hover {
      background: #dc2626;
    }
    .btn-view {
      background: #3b82f6;
      color: white;
    }
    .btn-view:hover {
      background: #2563eb;
    }
    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #64748b;
    }
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 3mpwr App Submissions</h1>
    <p class="subtitle">Review and manage event and campaign submissions from the mobile app</p>

    <div class="stats" id="stats">
      <div class="stat-card">
        <div class="stat-label">Total Submissions</div>
        <div class="stat-value" id="total-count">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending Review</div>
        <div class="stat-value" id="pending-count">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Events</div>
        <div class="stat-value" id="events-count">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Campaigns</div>
        <div class="stat-value" id="campaigns-count">-</div>
      </div>
    </div>

    <div class="filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="pending">Pending</button>
      <button class="filter-btn" data-filter="event">Events</button>
      <button class="filter-btn" data-filter="campaign">Campaigns</button>
      <button class="filter-btn" data-filter="approved">Approved</button>
      <button class="filter-btn" data-filter="rejected">Rejected</button>
    </div>

    <div id="submissions-container">
      <div class="loading">Loading submissions...</div>
    </div>
  </div>

  <script>
    // This would be populated by the API
    // For now, showing static message
    document.getElementById('submissions-container').innerHTML = \`
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h2>No Submissions Yet</h2>
        <p>Submissions from the mobile app will appear here.</p>
        <br>
        <p style="color: #3b82f6; font-weight: 600;">
          Note: This admin page requires backend implementation.<br>
          Connect to KV or D1 database to view submissions.
        </p>
      </div>
    \`;

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Implement filtering logic here
      });
    });
  </script>
</body>
</html>
`;

/**
 * Simple password protection
 */
function requireAuth(request: Request, env: Env): Response | null {
  const authHeader = request.headers.get('Authorization');
  
  if (!env.ADMIN_PASSWORD) {
    // No password set, allow access (not recommended for production)
    return null;
  }

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Access"',
      },
    });
  }

  const credentials = atob(authHeader.substring(6));
  const [, password] = credentials.split(':');

  if (password !== env.ADMIN_PASSWORD) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Access"',
      },
    });
  }

  return null;
}

/**
 * Main GET handler - Show admin dashboard
 */
export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  // Check authentication
  const authResponse = requireAuth(request, env);
  if (authResponse) {
    return authResponse;
  }

  // Return admin HTML
  return new Response(ADMIN_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
