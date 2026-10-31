import { pathToFileURL } from 'node:url';

// Render Cron Job entrypoint. The job exits after one health check.
export async function ping(env, fetcher = fetch) {
  if (!env.PAISO_URL) throw new Error('PAISO_URL must be configured');
  const target = new URL(env.PAISO_URL);
  if (target.protocol !== 'https:' || !target.hostname.endsWith('.onrender.com') || target.username || target.password) {
    throw new Error('PAISO_URL must be an HTTPS Render service URL');
  }
  target.pathname = '/healthz'; target.search = ''; target.hash = '';
  const response = await fetcher(target.toString(), { method: 'GET', redirect: 'manual', headers: { 'User-Agent': 'PaisoRenderKeepAwake/1.0', 'Accept': 'application/json' }, signal: AbortSignal.timeout(90000) });
  if (!response.ok) throw new Error(`Render ping returned ${response.status}`);
  const health = await response.json();
  if (health?.ok !== true) throw new Error('App did not report a healthy response');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await ping(process.env); console.log('Paiso app health check passed.'); }
  catch (error) { console.error('Paiso health check failed:', error.message); process.exitCode = 1; }
}
