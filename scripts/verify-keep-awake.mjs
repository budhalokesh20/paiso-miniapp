import assert from 'node:assert/strict';
import { ping } from '../worker/keep-awake.mjs';
let called = '';
await ping({PAISO_URL:'https://paiso.onrender.com/some/path?secret=not-forwarded'}, async (url, options) => {
  called = url; assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'manual');
  return Response.json({ok:true,release:'rewards-v1'});
});
assert.equal(called,'https://paiso.onrender.com/healthz');
await assert.rejects(()=>ping({},()=>{}),/must be configured/);
await assert.rejects(()=>ping({PAISO_URL:'https://example.com/'},()=>{}),/Render service URL/);
await assert.rejects(()=>ping({PAISO_URL:'http://paiso.onrender.com/'},()=>{}),/HTTPS/);
await assert.rejects(()=>ping({PAISO_URL:'https://paiso.onrender.com/'},async()=>new Response('',{status:503})),/503/);
await assert.rejects(()=>ping({PAISO_URL:'https://paiso.onrender.com/'},async()=>Response.json({ok:false})),/healthy response/);
await assert.rejects(()=>ping({PAISO_URL:'https://paiso.onrender.com/'},async()=>new Response('<html>Starting…</html>')));
console.log('Keep-awake worker checks passed.');
