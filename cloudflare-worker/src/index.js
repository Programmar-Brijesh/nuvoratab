/**
 * NuvoraTab - Cloudflare Worker Discord Support Integration
 * 
 * Secure, zero-telemetry backend for processing support tickets from the
 * static NuvoraTab website and dispatching formatted embeds to Discord.
 * 
 * Features:
 * - CORS origin enforcement (Production website + Localhost development)
 * - Request size limits (<64 KB)
 * - Input validation & sanitization (control-character stripping)
 * - Anti-spam rate limiting & duplicate-submission protection
 * - Safe Discord webhook dispatch with zero secret exposure
 * - Explicit error handling & HTTP status compliance
 */

// In-isolate state for rate limiting and duplicate prevention.
// IMPORTANT NOTE ON DISTRIBUTED RATE LIMITING:
// Cloudflare Workers run across hundreds of global edge data centers (PoPs).
// This in-memory state protects against rapid bursts, double-clicks, and brute-force
// attempts hitting the active edge isolate.
// For globally synchronized durable rate limiting across all edge PoPs worldwide,
// bind a Cloudflare KV namespace (e.g., env.SUPPORT_KV) or use Cloudflare Rate Limiting Rules.
const ipRateLimitMap = new Map();
const recentSubmissionsMap = new Map();

// Configuration constants
const MAX_REQUEST_SIZE_BYTES = 64 * 1024; // 64 KB
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

// Discord Embed category colors (Hex)
const CATEGORY_COLORS = {
  'Bug Report': 0xef4444,            // Red
  'Wallpaper Suggestion': 0x8b5cf6,  // Violet
  'Feature Suggestion': 0x06b6d4,    // Cyan
  'Privacy Question': 0x10b981,      // Emerald
  'General Question': 0x3b82f6       // Blue
};

const ALLOWED_CATEGORIES = [
  'Bug Report',
  'Wallpaper Suggestion',
  'Feature Suggestion',
  'Privacy Question',
  'General Question'
];

// Default permitted origins (Localhost & GitHub Pages)
const DEFAULT_ALLOWED_ORIGINS = [
  'https://brijesh-verma.github.io',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5500',
  'http://localhost:8787',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:8787',
  'http://127.0.0.1:5173'
];

/**
 * Generate clean, readable Unique Ticket ID
 * Example: NVT-M8Z9X2-K4F1
 */
function generateTicketId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NVT-${timestamp.slice(-6)}-${randomPart}`;
}

/**
 * Sanitize string: remove dangerous control characters, trim, limit length
 */
function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Verify whether an Origin header matches allowed origins
 */
function isOriginAllowed(origin, env = {}) {
  if (!origin) return false;

  // 1. Check default origins
  if (DEFAULT_ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // 2. Check chrome-extension origins
  if (origin.startsWith('chrome-extension://')) {
    return true;
  }

  // 3. Check custom origins from environment variable ALLOWED_ORIGINS (comma-separated)
  if (env && env.ALLOWED_ORIGINS) {
    const customOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
    if (customOrigins.includes(origin)) {
      return true;
    }
  }

  return false;
}

/**
 * Build standard CORS headers for a request
 */
function getCorsHeaders(request, env = {}) {
  const origin = request.headers.get('Origin');
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };

  if (origin && isOriginAllowed(origin, env)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

/**
 * Build standard JSON response with CORS headers
 */
function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...corsHeaders
    }
  });
}

/**
 * Extract client IP from Cloudflare or forwarded headers
 */
function getClientIp(request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

/**
 * In-isolate IP Rate Limiter
 */
function checkRateLimit(clientIp) {
  const now = Date.now();
  const clientData = ipRateLimitMap.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }

  clientData.count += 1;
  ipRateLimitMap.set(clientIp, clientData);

  // Periodic cleanup
  if (ipRateLimitMap.size > 1000) {
    for (const [ip, data] of ipRateLimitMap.entries()) {
      if (now > data.resetTime) {
        ipRateLimitMap.delete(ip);
      }
    }
  }

  return clientData.count <= MAX_REQUESTS_PER_WINDOW;
}

/**
 * Duplicate submission prevention based on IP + Email + Subject + Message excerpt
 */
function isDuplicateSubmission(clientIp, email, subject, message) {
  const now = Date.now();
  const signature = `${clientIp}::${email.toLowerCase()}::${subject.toLowerCase().trim()}::${message.trim().substring(0, 60)}`;

  // Clean old entries
  for (const [key, timestamp] of recentSubmissionsMap.entries()) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) {
      recentSubmissionsMap.delete(key);
    }
  }

  if (recentSubmissionsMap.has(signature)) {
    return true;
  }

  recentSubmissionsMap.set(signature, now);
  return false;
}

/**
 * Reset memory state (useful for test suites)
 */
function resetMemoryState() {
  ipRateLimitMap.clear();
  recentSubmissionsMap.clear();
}

/**
 * Main Request Handler
 */
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const corsHeaders = getCorsHeaders(request, env);

  // 1. Handle CORS Preflight (OPTIONS)
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('Origin');
    if (origin && !isOriginAllowed(origin, env)) {
      return new Response('CORS Origin Denied', { status: 403 });
    }
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // 2. Health check endpoint (GET /api/health or /health)
  if (pathname === '/api/health' || pathname === '/health') {
    if (request.method !== 'GET') {
      return jsonResponse({ success: false, error: 'Method not allowed.' }, 405, {
        ...corsHeaders,
        'Allow': 'GET, OPTIONS'
      });
    }
    return jsonResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'nuvoratab-support-worker'
    }, 200, corsHeaders);
  }

  // 3. Match Support Ticket endpoint (/api/support, /support, or /)
  if (pathname !== '/api/support' && pathname !== '/support' && pathname !== '/') {
    return jsonResponse({
      success: false,
      error: 'Not Found. Use /api/support for support submissions.'
    }, 404, corsHeaders);
  }

  // 4. Enforce POST method on support ticket endpoint
  if (request.method !== 'POST') {
    return jsonResponse({
      success: false,
      error: 'Method not allowed. Only POST requests are accepted.'
    }, 405, {
      ...corsHeaders,
      'Allow': 'POST, OPTIONS'
    });
  }

  // 5. Enforce Payload Size Limit before parsing
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE_BYTES) {
    return jsonResponse({
      success: false,
      error: `Payload too large. Support tickets must be under ${MAX_REQUEST_SIZE_BYTES / 1024} KB.`
    }, 413, corsHeaders);
  }

  // 6. Extract client IP & apply rate limiting
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return jsonResponse({
      success: false,
      error: 'Too many support requests sent. Please wait a few minutes before trying again.'
    }, 429, corsHeaders);
  }

  // 7. Parse Request Body with size safeguard
  let rawBody = '';
  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse({
      success: false,
      error: 'Unable to read request payload.'
    }, 400, corsHeaders);
  }

  if (rawBody.length > MAX_REQUEST_SIZE_BYTES) {
    return jsonResponse({
      success: false,
      error: `Payload too large. Support tickets must be under ${MAX_REQUEST_SIZE_BYTES / 1024} KB.`
    }, 413, corsHeaders);
  }

  let payload = null;
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch {
    return jsonResponse({
      success: false,
      error: 'Invalid request payload. Expected a valid JSON object.'
    }, 400, corsHeaders);
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return jsonResponse({
      success: false,
      error: 'Invalid request payload. Expected a valid JSON object.'
    }, 400, corsHeaders);
  }

  const { name, email, category, subject, message, diagnostics } = payload;

  // 8. Field Validation & Sanitization
  const cleanName = sanitizeString(name, 100);
  const cleanEmail = sanitizeString(email, 150);
  const cleanCategory = sanitizeString(category, 50);
  const cleanSubject = sanitizeString(subject, 200);
  const cleanMessage = sanitizeString(message, 3000);
  const cleanDiagnostics = sanitizeString(diagnostics, 1000);

  if (!cleanName || cleanName.length < 1) {
    return jsonResponse({
      success: false,
      error: 'Your name is required.'
    }, 400, corsHeaders);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return jsonResponse({
      success: false,
      error: 'Please enter a valid email address so our team can follow up.'
    }, 400, corsHeaders);
  }

  const selectedCategory = ALLOWED_CATEGORIES.includes(cleanCategory) ? cleanCategory : 'General Question';

  if (!cleanSubject || cleanSubject.length < 2) {
    return jsonResponse({
      success: false,
      error: 'Please enter a descriptive subject line (minimum 2 characters).'
    }, 400, corsHeaders);
  }

  if (!cleanMessage || cleanMessage.length < 5) {
    return jsonResponse({
      success: false,
      error: 'Please enter a detailed description of your issue or question (minimum 5 characters).'
    }, 400, corsHeaders);
  }

  // 9. Duplicate Submission Check
  if (isDuplicateSubmission(clientIp, cleanEmail, cleanSubject, cleanMessage)) {
    return jsonResponse({
      success: false,
      error: 'An identical support request was recently received. Please wait 2 minutes before submitting again.'
    }, 409, corsHeaders);
  }

  // 10. Verify Server-Side Secret Configuration
  const webhookUrl = env ? env.DISCORD_SUPPORT_WEBHOOK : null;
  if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    console.error('[Support Worker Error] DISCORD_SUPPORT_WEBHOOK secret is missing, empty, or invalid.');
    return jsonResponse({
      success: false,
      error: 'Support dispatch service is currently unavailable. Please contact brijeshverma8896@gmail.com directly.'
    }, 503, corsHeaders);
  }

  // 11. Generate Ticket ID & Discord Embed
  const ticketId = generateTicketId();
  const embedColor = CATEGORY_COLORS[selectedCategory] || 0x06b6d4;

  const discordPayload = {
    username: 'NuvoraTab Support Desk',
    avatar_url: 'https://raw.githubusercontent.com/brijesh-verma/nuvoratab/main/assets/icon128.png',
    embeds: [
      {
        title: `🎫 [${selectedCategory}] ${cleanSubject}`,
        description: `**New Support Ticket Received**\nA user submitted a request through the NuvoraTab Support Portal.`,
        color: embedColor,
        fields: [
          {
            name: 'Ticket ID',
            value: `\`${ticketId}\``,
            inline: true
          },
          {
            name: 'Inquiry Type',
            value: selectedCategory,
            inline: true
          },
          {
            name: 'Timestamp',
            value: new Date().toUTCString(),
            inline: true
          },
          {
            name: 'User Name',
            value: cleanName,
            inline: true
          },
          {
            name: 'User Email',
            value: cleanEmail,
            inline: true
          },
          {
            name: 'Status',
            value: '🟢 Open / Needs Review',
            inline: true
          },
          {
            name: 'Subject Line',
            value: cleanSubject,
            inline: false
          },
          {
            name: 'Detailed Description',
            value: cleanMessage.length > 1024 ? cleanMessage.slice(0, 1021) + '...' : cleanMessage,
            inline: false
          },
          {
            name: 'Environment Diagnostics',
            value: cleanDiagnostics
              ? `\`\`\`yaml\n${cleanDiagnostics.slice(0, 950)}\n\`\`\``
              : '*User opted out of environment diagnostics.*',
            inline: false
          }
        ],
        footer: {
          text: `NuvoraTab Support Desk • Ticket ID: ${ticketId}`
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  // 12. Dispatch to Discord Webhook with safety guarantees
  try {
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'NuvoraTab-Support-Service/1.0'
      },
      body: JSON.stringify(discordPayload)
    });

    if (discordResponse.status === 204 || discordResponse.status === 200) {
      return jsonResponse({
        success: true,
        ticketId: ticketId,
        message: 'Your support ticket has been received and routed to our team.'
      }, 200, corsHeaders);
    }

    // Discord returned non-success (e.g. 400, 401, 404, 500)
    console.error(`[Support Worker Discord Error] Non-success status returned by Discord: ${discordResponse.status}`);
    return jsonResponse({
      success: false,
      error: 'Failed to deliver ticket to Discord. Please try again or email us directly at brijeshverma8896@gmail.com.'
    }, 502, corsHeaders);
  } catch (networkError) {
    console.error('[Support Worker Network Error] Fetch to Discord failed:', networkError?.message || networkError);
    return jsonResponse({
      success: false,
      error: 'Network connectivity error contacting support dispatch. Please try again or email brijeshverma8896@gmail.com.'
    }, 502, corsHeaders);
  }
}

export default {
  fetch: handleRequest
};

// Export internals for automated testing
export {
  handleRequest,
  generateTicketId,
  sanitizeString,
  isOriginAllowed,
  getCorsHeaders,
  checkRateLimit,
  isDuplicateSubmission,
  resetMemoryState,
  CATEGORY_COLORS,
  ALLOWED_CATEGORIES,
  DEFAULT_ALLOWED_ORIGINS
};
