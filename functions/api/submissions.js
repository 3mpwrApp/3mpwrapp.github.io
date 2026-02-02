/**
 * Cloudflare Pages Function for handling event and campaign submissions
 * JavaScript version for immediate deployment
 */

export async function onRequest(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Parse request
    const submission = await request.json();

    // Basic validation
    const errors = [];
    if (!submission.type || !['event', 'campaign'].includes(submission.type)) {
      errors.push('Invalid type');
    }
    if (!submission.data?.title) {
      errors.push('Title required');
    }
    if (!submission.submittedBy?.uid) {
      errors.push('User ID required');
    }

    if (errors.length > 0) {
      return new Response(JSON.stringify({ success: false, errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const submissionId = `${submission.type}:${submission.data.id}:${submission.submittedAt}`;

    // Store in KV if available
    if (env.SUBMISSIONS_KV) {
      try {
        await env.SUBMISSIONS_KV.put(
          `submission:${submissionId}`,
          JSON.stringify({ ...submission, status: 'pending' }),
          { metadata: { type: submission.type, status: 'pending' } }
        );
      } catch (err) {
        console.error('KV storage failed:', err);
      }
    }

    // Send Discord webhook if configured
    if (env.NOTIFICATION_WEBHOOK_URL) {
      try {
        const title = submission.data.title;
        const submitter = submission.submittedBy.displayName || 
                         submission.submittedBy.email || 
                         submission.submittedBy.uid;
        
        const description = submission.type === 'event' 
          ? (submission.data.description || '').substring(0, 200)
          : (submission.data.summary || '').substring(0, 200);

        await fetch(env.NOTIFICATION_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🆕 New ${submission.type} submission from 3mpwr App`,
            embeds: [{
              title: `${submission.type === 'event' ? '📅' : '📢'} ${title}`,
              description: description,
              fields: [
                { name: 'Submitted By', value: submitter, inline: true },
                { name: 'Type', value: submission.type, inline: true },
                { name: 'ID', value: submission.data.id, inline: true },
              ],
              color: submission.type === 'event' ? 0x3498db : 0xe74c3c,
              timestamp: new Date(submission.submittedAt).toISOString(),
            }],
          }),
        });
      } catch (err) {
        console.error('Webhook failed:', err);
      }
    }

    // Success response
    return new Response(JSON.stringify({
      success: true,
      message: `${submission.type === 'event' ? 'Event' : 'Campaign'} "${submission.data.title}" has been submitted for review. Thank you!`,
      submissionId,
      status: 'pending',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Submission error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An error occurred',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
