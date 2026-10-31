// Deploy separately from the Render service; configure PAISO_URL at deployment.
export async function ping(env, fetcher = fetch) {
  if (!env.PAISO_URL) throw new Error('PAISO_URL must be configured');
  const target = new URL(env.PAISO_URL);
  if (target.protocol !== 'https:' || !target.hostname.endsWith('.onrender.com') || target.username || target.password) {
    throw new Error('PAISO_URL must be an HTTPS Render service URL');
  }
  target.pathname = '/'; target.search = ''; target.hash = '';
  const response = await fetcher(target.toString(), { method: 'GET', redirect: 'manual', headers: { 'User-Agent': 'PaisoKeepAwake/1.0' }, signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Render ping returned ${response.status}`);
  await response.body?.cancel();
}

export default {
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(ping(env));
  },
};
