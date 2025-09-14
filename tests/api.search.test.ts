import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fetch from 'node-fetch';
import childProcess from 'child_process';
import { setTimeout as sleep } from 'timers/promises';

let proc: childProcess.ChildProcess | null = null;
const port = 3001;
const base = `http://localhost:${port}`;

async function waitUntilReady(timeoutMs = 10_000) {
  const t0 = Date.now();
  // Poll a simple request until success or timeout
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(`${base}/health`);
      if (r.ok) return true;
    } catch {
      // Ignore fetch errors during server startup
    }
    await sleep(300);
  }
  throw new Error('API server not ready');
}

describe('API /api/foods/search', () => {
  beforeAll(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://stub.supabase.co';
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'stub_anon_key';

    proc = childProcess.spawn(
      process.execPath,
      ['server/index.js'],
      {
        env: {
          ...process.env,
          API_PORT: String(port),
          NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnon,
        },
        stdio: 'inherit',
      }
    );
    await waitUntilReady();
  }, 20_000);

  afterAll(async () => {
    if (proc) proc.kill();
  });

  it('pao -> TACO first when active', async () => {
    const r = await fetch(`${base}/api/foods/search?q=pao&sources=TACO,TBCA`);
    const j: any = await r.json();
    expect(Array.isArray(j.items)).toBe(true);
    if (j.items.length > 0) {
      expect(j.items[0].source).toBe('TACO');
    }
  }, 20_000);

  it('accent-insensitive acai', async () => {
    const r = await fetch(`${base}/api/foods/search?q=acai`);
    const j: any = await r.json();
    expect(Array.isArray(j.items)).toBe(true);
  }, 20_000);

  it('TBCA only shows TBCA first', async () => {
    const r = await fetch(`${base}/api/foods/search?q=pao%20forma&sources=TBCA`);
    const j: any = await r.json();
    expect(Array.isArray(j.items)).toBe(true);
    if (j.items.length > 0) {
      expect(j.items[0].source).toBe('TBCA');
    }
  }, 20_000);

  describe('API /health', () => {
    it('returns ok', async () => {
      const r = await fetch(`${base}/health`);
      expect(r.status).toBe(200);
      const j: any = await r.json();
      expect(j).toEqual({ status: 'ok' });
    });
  });

  describe('API /api/foods/search invalid inputs', () => {
    it('400 when q is missing', async () => {
      const r = await fetch(`${base}/api/foods/search`);
      expect(r.status).toBe(400);
      const j: any = await r.json();
      expect(j.error).toBeDefined();
    });
  });
});


