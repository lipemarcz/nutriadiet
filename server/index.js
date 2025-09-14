import 'dotenv/config';
import { createServer } from 'http';
import { URL } from 'url';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Simple in-memory rate limiter per IP
const hits = new Map();
function rateLimit(ip, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const rec = hits.get(ip) ?? { count: 0, ts: now };
  if (now - rec.ts > windowMs) {
    rec.count = 0;
    rec.ts = now;
  }
  rec.count += 1;
  hits.set(ip, rec);
  return rec.count <= limit;
}

const QuerySchema = z.object({
  q: z.string().min(1).max(80),
  sources: z.string().optional(), // "TACO,TBCA"
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
});

const port = Number(process.env.API_PORT || 3000);

function json(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    ...headers,
  });
  res.end(payload);
}

const server = createServer(async (req, res) => {
  try {
    if (!req.url) {
      json(res, 400, { error: 'Bad Request' });
      return;
    }

    const url = new URL(req.url, `http://localhost:${port}`);
    const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'local';

    // Health check endpoint
    if (req.method === 'GET' && url.pathname === '/health') {
      json(res, 200, { status: 'ok' }, { 'Cache-Control': 'no-store' });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/foods/search') {
      if (!rateLimit(ip)) {
        json(res, 429, { error: 'Too Many Requests' }, { 'Cache-Control': 'no-store' });
        return;
      }

      const parsed = QuerySchema.safeParse({
        q: url.searchParams.get('q') ?? '',
        sources: url.searchParams.get('sources') ?? 'TACO,TBCA',
        page: url.searchParams.get('page') ?? '1',
        pageSize: url.searchParams.get('pageSize') ?? '25',
      });
      if (!parsed.success) {
        json(res, 400, { error: parsed.error.flatten() });
        return;
      }

      const { q, sources, page, pageSize } = parsed.data;
      const srcArr = sources.split(',').map((s) => s.trim()).filter(Boolean);
      const offset = (page - 1) * pageSize;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnon) {
        json(res, 500, { error: 'Supabase env vars missing' });
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseAnon);

      const t0 = performance.now();
      const { data, error } = await supabase.rpc('search_foods', {
        q,
        sources: srcArr,
        limit_count: pageSize,
        offset_count: offset,
      });
      const durationMs = Math.round(performance.now() - t0);

      if (error) {
        console.error('search_foods error', { q_len: q.length, sources: srcArr, pageSize, duration_ms: durationMs, error: error.message });
        json(
          res,
          200,
          { items: [], page, pageSize, fallback: true },
          { 'Cache-Control': 'no-store' }
        );
        return;
      }

      // Structured log
      console.log(
        JSON.stringify({
          evt: 'foods_search',
          q_len: q.length,
          sources: srcArr,
          pageSize,
          duration_ms: durationMs,
          hit_fallback: false,
        })
      );

      json(
        res,
        200,
        { page, pageSize, items: data ?? [] },
        { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=60' }
      );
      return;
    }

    json(res, 404, { error: 'Not Found' });
  } catch (e) {
    console.error('Unhandled error', e);
    json(res, 500, { error: 'Internal Server Error' });
  }
});

server.listen(port, () => {
  console.log(`api:listening ${port}`);
});

export default server;


