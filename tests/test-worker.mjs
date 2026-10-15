/**
 * Automated Test Suite for NuvoraTab Cloudflare Worker
 * 
 * Tests:
 * 1. Health check & route availability (GET /api/health)
 * 2. CORS preflight (OPTIONS) with allowed and disallowed origins
 * 3. Method restrictions (Rejecting GET/PUT on support endpoint)
 * 4. Request size limits (>64 KB rejected with 413)
 * 5. Input validation & sanitization (name, email, subject, message, malformed JSON)
 * 6. Missing DISCORD_SUPPORT_WEBHOOK secret handling (503 without token leakage)
 * 7. Successful delivery with mocked Discord 204 response (Full embed verification)
 * 8. Duplicate submission prevention (409 Conflict)
 * 9. Rate limiting enforcement (429 Too Many Requests)
 * 10. Discord API failure handling (502 for Discord 404/500/network error)
 */

import worker, {
  resetMemoryState,
  sanitizeString,
  generateTicketId,
  CATEGORY_COLORS
} from '../cloudflare-worker/src/index.js';

const MOCK_WEBHOOK_URL = 'https://discord.com/api/webhooks/123456789012345678/mock_token_abcdef123456';
const MOCK_ENV = {
  DISCORD_SUPPORT_WEBHOOK: MOCK_WEBHOOK_URL,
  ALLOWED_ORIGINS: 'https://brijesh-verma.github.io,https://nuvoratab.com'
};

// Intercept globalThis.fetch to mock Discord Webhook API
let originalFetch = globalThis.fetch;
let mockDiscordHandler = null;

function setupMockFetch() {
  globalThis.fetch = async (url, options) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    if (urlStr.startsWith('https://discord.com/api/webhooks/')) {
      if (mockDiscordHandler) {
        return mockDiscordHandler(urlStr, options);
      }
      return new Response(null, { status: 204 });
    }
    return originalFetch(url, options);
  };
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🧪 Running NuvoraTab Cloudflare Worker Test Suite');
  console.log('====================================================\n');

  setupMockFetch();

  try {
    // ------------------------------------------------------------------------
    // Group 1: Health Check Endpoint
    // ------------------------------------------------------------------------
    console.log('📦 Group 1: Health Check Endpoint');
    {
      const req = new Request('https://worker.local/api/health', { method: 'GET' });
      const res = await worker.fetch(req, MOCK_ENV);
      const data = await res.json();
      assert(res.status === 200, 'GET /api/health returns HTTP 200');
      assert(data.status === 'healthy', 'Health check body has status "healthy"');
      assert(data.service === 'nuvoratab-support-worker', 'Service identifier is correct');

      const postReq = new Request('https://worker.local/api/health', { method: 'POST' });
      const postRes = await worker.fetch(postReq, MOCK_ENV);
      assert(postRes.status === 405, 'POST /api/health returns 405 Method Not Allowed');
    }

    // ------------------------------------------------------------------------
    // Group 2: CORS Preflight & Origin Verification
    // ------------------------------------------------------------------------
    console.log('\n📦 Group 2: CORS Preflight & Origin Verification');
    {
      // Allowed production origin (Programmar-Brijesh GitHub Pages)
      const reqRepoOwner = new Request('https://worker.local/api/support', {
        method: 'OPTIONS',
        headers: { 'Origin': 'https://programmar-brijesh.github.io' }
      });
      const resRepoOwner = await worker.fetch(reqRepoOwner, MOCK_ENV);
      assert(resRepoOwner.status === 204, 'Preflight for https://programmar-brijesh.github.io returns 204');
      assert(resRepoOwner.headers.get('Access-Control-Allow-Origin') === 'https://programmar-brijesh.github.io', 'Reflects programmar-brijesh.github.io');

      // Case-insensitive GitHub Pages origin
      const reqCase = new Request('https://worker.local/api/support', {
        method: 'OPTIONS',
        headers: { 'Origin': 'https://Programmar-Brijesh.github.io' }
      });
      const resCase = await worker.fetch(reqCase, MOCK_ENV);
      assert(resCase.status === 204, 'Preflight with mixed-case Origin returns 204');
      assert(resCase.headers.get('Access-Control-Allow-Origin') === 'https://Programmar-Brijesh.github.io', 'Reflects mixed-case origin');

      // Allowed secondary production origin
      const reqProd = new Request('https://worker.local/api/support', {
        method: 'OPTIONS',
        headers: { 'Origin': 'https://brijesh-verma.github.io' }
      });
      const resProd = await worker.fetch(reqProd, MOCK_ENV);
      assert(resProd.status === 204, 'Preflight for https://brijesh-verma.github.io returns 204');
      assert(resProd.headers.get('Access-Control-Allow-Origin') === 'https://brijesh-verma.github.io', 'Reflects allowed production origin');

      // Allowed localhost dev origin
      const reqLocal = new Request('https://worker.local/api/support', {
        method: 'OPTIONS',
        headers: { 'Origin': 'http://localhost:3000' }
      });
      const resLocal = await worker.fetch(reqLocal, MOCK_ENV);
      assert(resLocal.headers.get('Access-Control-Allow-Origin') === 'http://localhost:3000', 'Reflects localhost:3000');

      // Allowed custom origin from env
      const reqCustom = new Request('https://worker.local/api/support', {
        method: 'OPTIONS',
        headers: { 'Origin': 'https://nuvoratab.com' }
      });
      const resCustom = await worker.fetch(reqCustom, MOCK_ENV);
      assert(resCustom.headers.get('Access-Control-Allow-Origin') === 'https://nuvoratab.com', 'Reflects allowed custom origin from env');

      // Disallowed origin preflight
      const reqBad = new Request('https://worker.local/api/support', {
        method: 'OPTIONS',
        headers: { 'Origin': 'https://malicious-phishing-site.example' }
      });
      const resBad = await worker.fetch(reqBad, MOCK_ENV);
      assert(resBad.status === 403, 'Preflight from unauthorized origin is rejected with 403');
    }

    // ------------------------------------------------------------------------
    // Group 3: Method & Route Restrictions
    // ------------------------------------------------------------------------
    console.log('\n📦 Group 3: Method & Route Restrictions');
    {
      const getReq = new Request('https://worker.local/api/support', { method: 'GET' });
      const getRes = await worker.fetch(getReq, MOCK_ENV);
      assert(getRes.status === 405, 'GET /api/support returns 405 Method Not Allowed');

      const notFoundReq = new Request('https://worker.local/unknown-path', { method: 'POST' });
      const notFoundRes = await worker.fetch(notFoundReq, MOCK_ENV);
      assert(notFoundRes.status === 404, 'Unknown path returns 404 Not Found');
    }

    // ------------------------------------------------------------------------
    // Group 4: Request Size Limits
    // ------------------------------------------------------------------------
    console.log('\n📦 Group 4: Request Size Limits');
    {
      // Header check
      const hugeHeaderReq = new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '80000' // 80 KB > 64 KB
        },
        body: JSON.stringify({ name: 'Huge' })
      });
      const hugeHeaderRes = await worker.fetch(hugeHeaderReq, MOCK_ENV);
      assert(hugeHeaderRes.status === 413, 'Content-Length > 64 KB rejected with 413 Payload Too Large');

      // Body check
      const oversizedString = 'x'.repeat(70000);
      const hugeBodyReq = new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test',
          email: 'test@example.com',
          category: 'General Question',
          subject: 'Huge body',
          message: oversizedString
        })
      });
      const hugeBodyRes = await worker.fetch(hugeBodyReq, MOCK_ENV);
      assert(hugeBodyRes.status === 413, 'Actual payload body > 64 KB rejected with 413 Payload Too Large');
    }

    // ------------------------------------------------------------------------
    // Group 5: Input Validation & Sanitization
    // ------------------------------------------------------------------------
    console.log('\n📦 Group 5: Input Validation & Sanitization');
    {
      resetMemoryState();

      // Empty name
      const resEmptyName = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '10.0.0.1' },
        body: JSON.stringify({ name: '', email: 'valid@example.com', subject: 'Subject', message: 'Valid message' })
      }), MOCK_ENV);
      assert(resEmptyName.status === 400, 'Empty name returns 400');

      // Invalid email
      const resBadEmail = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '10.0.0.2' },
        body: JSON.stringify({ name: 'Alex', email: 'not-an-email', subject: 'Subject', message: 'Valid message' })
      }), MOCK_ENV);
      assert(resBadEmail.status === 400, 'Invalid email returns 400');

      // Short subject (<2 chars)
      const resShortSub = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '10.0.0.3' },
        body: JSON.stringify({ name: 'Alex', email: 'alex@example.com', subject: 'A', message: 'Valid message' })
      }), MOCK_ENV);
      assert(resShortSub.status === 400, 'Subject <2 characters returns 400');

      // Short message (<5 chars)
      const resShortMsg = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '10.0.0.4' },
        body: JSON.stringify({ name: 'Alex', email: 'alex@example.com', subject: 'Valid subject', message: 'Hi' })
      }), MOCK_ENV);
      assert(resShortMsg.status === 400, 'Message <5 characters returns 400');

      // Malformed JSON
      const resBadJson = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '10.0.0.5' },
        body: '{ malformed json: true '
      }), MOCK_ENV);
      assert(resBadJson.status === 400, 'Malformed JSON returns 400');

      // Control character sanitization unit test
      const tainted = 'Hello\u0000World\u0007!';
      const cleaned = sanitizeString(tainted, 100);
      assert(cleaned === 'HelloWorld!', 'Sanitizer removes null bytes and control chars');
    }

    // ------------------------------------------------------------------------
    // Group 6: Missing DISCORD_SUPPORT_WEBHOOK Secret Handling
    // ------------------------------------------------------------------------
    console.log('\n📦 Group 6: Missing DISCORD_SUPPORT_WEBHOOK Secret');
    {
      resetMemoryState();
      const emptyEnv = { DISCORD_SUPPORT_WEBHOOK: '' };
      const resNoSecret = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '10.0.0.6' },
        body: JSON.stringify({
          name: 'Security Test',
          email: 'sec@example.com',
          category: 'General Question',
          subject: 'Missing Secret',
          message: 'Testing graceful 503 response'
        })
      }), emptyEnv);

      assert(resNoSecret.status === 503, 'Missing secret returns 503 Service Unavailable');
      const body = await resNoSecret.json();
      assert(body.success === false, 'Body indicates success: false');
      assert(!JSON.stringify(body).includes('discord.com'), 'Error message does not leak webhook URL');
    }

    // ------------------------------------------------------------------------
    // Group 7: Successful Delivery with Mocked Discord 204 Response
    // ------------------------------------------------------------------------
    console.log('\n📦 Group 7: Successful Delivery & Embed Verification');
    {
      resetMemoryState();
      let capturedPayload = null;
      let capturedHeaders = null;

      mockDiscordHandler = async (url, options) => {
        capturedHeaders = options.headers;
        capturedPayload = JSON.parse(options.body);
        return new Response(null, { status: 204 });
      };

      const validTicketPayload = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        category: 'Bug Report',
        subject: 'Wallpaper not rotating automatically',
        message: 'The new-tab wallpaper stays on the first mountain image and does not rotate.',
        diagnostics: 'Browser: Google Chrome 124\nScreen: 2560x1440 (Scale: 1x)\nLanguage: en-US'
      };

      const resSuccess = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://brijesh-verma.github.io',
          'cf-connecting-ip': '10.0.0.7'
        },
        body: JSON.stringify(validTicketPayload)
      }), MOCK_ENV);

      const resData = await resSuccess.json();
      assert(resSuccess.status === 200, 'Successful submission returns HTTP 200');
      assert(resData.success === true, 'Response contains success: true');
      assert(typeof resData.ticketId === 'string' && resData.ticketId.startsWith('NVT-'), 'Ticket ID matches NVT- format');
      assert(resSuccess.headers.get('Access-Control-Allow-Origin') === 'https://brijesh-verma.github.io', 'CORS origin preserved in response');

      // Verify Discord Embed formatting
      assert(capturedPayload !== null, 'Discord webhook was invoked');
      assert(capturedPayload.username === 'NuvoraTab Support Desk', 'Discord username matches specification');
      assert(capturedPayload.embeds && capturedPayload.embeds.length === 1, 'Discord payload has 1 embed');

      const embed = capturedPayload.embeds[0];
      assert(embed.title.includes('[Bug Report]'), 'Embed title contains category tag');
      assert(embed.color === CATEGORY_COLORS['Bug Report'], 'Embed color corresponds to Bug Report (red)');
      
      const fields = embed.fields;
      const getFieldValue = (name) => fields.find(f => f.name === name)?.value;
      assert(getFieldValue('Ticket ID') === `\`${resData.ticketId}\``, 'Embed contains correct Ticket ID field');
      assert(getFieldValue('User Name') === 'Jane Doe', 'Embed contains User Name');
      assert(getFieldValue('User Email') === 'jane@example.com', 'Embed contains User Email');
      assert(getFieldValue('Inquiry Type') === 'Bug Report', 'Embed contains Inquiry Type');
      assert(getFieldValue('Status') === '🟢 Open / Needs Review', 'Embed contains Status indicator');
      assert(getFieldValue('Environment Diagnostics').includes('Browser: Google Chrome 124'), 'Diagnostics formatted in code block');
      assert(embed.footer.text.includes(resData.ticketId), 'Footer contains Ticket ID reference');
    }

    // ------------------------------------------------------------------------
    // Group 8: Duplicate Submission Prevention
    // ------------------------------------------------------------------------
    console.log('\n📦 Group 8: Duplicate Submission Prevention');
    {
      resetMemoryState();
      mockDiscordHandler = async () => new Response(null, { status: 204 });

      const dupPayload = {
        name: 'Duplicate Tester',
        email: 'dup@example.com',
        category: 'Feature Suggestion',
        subject: 'Add Dark Mode Accent Option',
        message: 'It would be great to allow custom neon accent tints on the clock.'
      };

      const ip = '192.0.2.55';

      // First submission (should succeed)
      const res1 = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': ip },
        body: JSON.stringify(dupPayload)
      }), MOCK_ENV);
      assert(res1.status === 200, 'Initial submission succeeds with 200');

      // Second immediate submission (should be blocked as duplicate)
      const res2 = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': ip },
        body: JSON.stringify(dupPayload)
      }), MOCK_ENV);
      assert(res2.status === 409, 'Immediate duplicate submission returns 409 Conflict');
      const dupData = await res2.json();
      assert(dupData.success === false, 'Duplicate response indicates success: false');
      assert(dupData.error.includes('identical support request was recently received'), 'Error message informs user of duplicate window');
    }

    // ------------------------------------------------------------------------
    // Group 9: In-Isolate Rate Limiting Enforcement
    // ------------------------------------------------------------------------
    console.log('\n📦 Group 9: In-Isolate Rate Limiting Enforcement');
    {
      resetMemoryState();
      mockDiscordHandler = async () => new Response(null, { status: 204 });

      const spamIp = '203.0.113.88';
      let triggered429 = false;

      for (let i = 0; i < 6; i++) {
        const res = await worker.fetch(new Request('https://worker.local/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': spamIp },
          body: JSON.stringify({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            category: 'General Question',
            subject: `Subject ${i}`,
            message: `Message content number ${i} is long enough.`
          })
        }), MOCK_ENV);

        if (res.status === 429) {
          triggered429 = true;
          const data = await res.json();
          assert(data.error.includes('Too many support requests'), '429 error message informs user of rate limit');
          break;
        }
      }

      assert(triggered429, 'Rate limiter successfully triggers HTTP 429 upon exceeding window limit (5 requests)');
    }

    // ------------------------------------------------------------------------
    // Group 10: Discord API Failure & Network Error Handling
    // ------------------------------------------------------------------------
    console.log('\n📦 Group 10: Discord API Failure & Network Error Handling');
    {
      resetMemoryState();

      // Case A: Discord returns 404 Not Found (e.g. deleted webhook)
      mockDiscordHandler = async () => new Response(JSON.stringify({ message: 'Unknown Webhook' }), { status: 404 });
      const res404 = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '10.0.0.10' },
        body: JSON.stringify({
          name: 'Fail User',
          email: 'fail@example.com',
          category: 'General Question',
          subject: 'Discord 404 Test',
          message: 'Testing discord webhook not found scenario.'
        })
      }), MOCK_ENV);
      assert(res404.status === 502, 'Discord 404 returns 502 Bad Gateway to client');
      const body404 = await res404.json();
      assert(body404.success === false, 'Body indicates failure');
      assert(!JSON.stringify(body404).includes('mock_token'), 'Sensitive webhook token is not leaked to client');

      // Case B: Discord returns 500 Internal Server Error
      resetMemoryState();
      mockDiscordHandler = async () => new Response('Internal Server Error', { status: 500 });
      const res500 = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '10.0.0.11' },
        body: JSON.stringify({
          name: 'Fail User',
          email: 'fail@example.com',
          category: 'General Question',
          subject: 'Discord 500 Test',
          message: 'Testing discord outage scenario.'
        })
      }), MOCK_ENV);
      assert(res500.status === 502, 'Discord 500 returns 502 Bad Gateway to client');

      // Case C: Network error / fetch exception
      resetMemoryState();
      mockDiscordHandler = async () => {
        throw new Error('ECONNRESET connection aborted');
      };
      const resNetErr = await worker.fetch(new Request('https://worker.local/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '10.0.0.12' },
        body: JSON.stringify({
          name: 'Net User',
          email: 'net@example.com',
          category: 'General Question',
          subject: 'Network Exception Test',
          message: 'Testing fetch throw exception scenario.'
        })
      }), MOCK_ENV);
      assert(resNetErr.status === 502, 'Fetch network exception returns 502 Bad Gateway');
      const bodyNet = await resNetErr.json();
      assert(bodyNet.error.includes('Network connectivity error'), 'User receives helpful fallback message');
    }

  } finally {
    restoreFetch();
  }

  console.log('\n====================================================');
  console.log(`Results: ${passedTests} Passed, ${failedTests} Failed (Total: ${totalTests})`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL CLOUDFLARE WORKER TESTS PASSED SUCCESSFULLY!\n');
  }
}

runAllTests().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
