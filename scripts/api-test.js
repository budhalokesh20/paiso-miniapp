/**
 * Paiso full backend API + security test (runs against an isolated sandbox server, never production DB)
 * Usage: node scripts/api-test.js http://127.0.0.1:3999 <BOT_TOKEN> <ADMIN_SECRET>
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

try {
  const envText = fs.readFileSync(path.resolve(__dirname, '..', '.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
} catch {}

const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const BOT_TOKEN = process.argv[3] || process.env.BOT_TOKEN || '8539552673:AAGU3m9NE3yCi7c4ZujRyAnfh0xBfoTCpew';
const ADMIN_SECRET = process.argv[4] || process.env.ADMIN_SECRET || 'YZNnwM29E1I0rpgJIERqyIBv';
const ADS_SECRET = process.env.ADSGRAM_REWARD_SECRET || 'y34aL57e9YkM01sA';

let pass = 0;
let fail = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    failures.push(name);
    console.log(`  FAIL  ${name}${extra !== undefined ? ' -> ' + JSON.stringify(extra).slice(0, 300) : ''}`);
  }
}

function makeInitData(user, opts = {}) {
  const authDate = opts.authDate || Math.floor(Date.now() / 1000);
  const params = new URLSearchParams();
  params.set('auth_date', String(authDate));
  params.set('query_id', 'AAH' + crypto.randomBytes(4).toString('hex'));
  params.set('user', JSON.stringify(user));
  if (opts.startParam) params.set('start_param', opts.startParam);
  const dataCheck = [...params.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(opts.token || BOT_TOKEN).digest();
  const hash = crypto.createHmac('sha256', secret).update(dataCheck).digest('hex');
  params.set('hash', hash);
  return params.toString();
}

async function call(method, path, { initData, admin, body, headers } = {}) {
  const h = { 'Content-Type': 'application/json', ...(headers || {}) };
  if (initData !== undefined) h['x-init-data'] = initData;
  if (admin !== undefined) h['x-admin-id'] = admin;
  const r = await fetch(BASE + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  let data = null;
  const text = await r.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: r.status, data, headers: r.headers };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const uid = Math.floor(7000000 + Math.random() * 900000);
  const userAId = uid;
  const userBId = uid + 1;
  const userSelfId = uid + 2;

  const userA = { id: userAId, first_name: 'Alice', username: 'alice_t' };
  const userB = { id: userBId, first_name: 'Bob', username: 'bob_t' };
  const A = makeInitData(userA);
  const B = makeInitData(userB, { startParam: `ref_${userAId}` });

  console.log('\n[1] Authentication & Telegram initData security');
  let r = await call('GET', '/api/me', { initData: 'user=%7B%22id%22%3A1%7D&hash=deadbeef' });
  check('Forged initData rejected (401)', r.status === 401, r.status);
  r = await call('GET', '/api/me', { initData: makeInitData(userA, { token: '999:WRONG' }) });
  check('initData signed with wrong bot token rejected', r.status === 401, r.status);
  r = await call('GET', '/api/me', { initData: makeInitData(userA, { authDate: Math.floor(Date.now() / 1000) - 3 * 86400 }) });
  check('Expired / replayed initData (3 days old) rejected', r.status === 401, r.status);
  r = await call('GET', '/api/me', { headers: { 'X-Forwarded-For': '8.8.8.8', Host: 'localhost' } });
  check('Host-header spoof without initData rejected (no dev bypass)', r.status === 401, r.status);
  r = await call('GET', '/api/me', { initData: A });
  check('Valid initData accepted -> /api/me 200', r.status === 200 && r.data.user && r.data.user.id === String(userAId), r.data);
  check('/api/me returns tasks, ads, settings, notifications', Array.isArray(r.data.tasks) && r.data.ads && r.data.withdrawSettings && Array.isArray(r.data.notifications));
  check('App Task & Play Game tasks are served', r.data.tasks.some((t) => t.type === 'app_task') && r.data.tasks.some((t) => t.type === 'play_game'));
  check('Welcome notification created for new user', r.data.notifications.some((n) => /Welcome/.test(n.title)));
  check('Security headers present (nosniff, no x-powered-by)', r.headers.get('x-content-type-options') === 'nosniff' && !r.headers.get('x-powered-by'));

  console.log('\n[2] Referral flow');
  r = await call('GET', '/api/me', { initData: B });
  check('Referred user B created', r.status === 200 && r.data.user.referredBy === String(userAId), r.data.user);
  r = await call('GET', '/api/me', { initData: A });
  check('Referrer A referrals count = 1', r.data.user.referrals === 1, r.data.user.referrals);
  check('Referral history lists B as pending', r.data.referralHistory.length === 1 && r.data.referralHistory[0].qualified === false);
  const selfRef = makeInitData({ id: userSelfId, first_name: 'Self' }, { startParam: `ref_${userSelfId}` });
  r = await call('GET', '/api/me', { initData: selfRef });
  check('Self-referral ignored', r.data.user.referredBy === null, r.data.user.referredBy);

  console.log('\n[3] Daily check-in');
  r = await call('POST', '/api/daily', { initData: A, body: {} });
  check('Daily claim #1 credits coins', r.data.ok === true && r.data.reward > 0 && r.data.dailyStreak === 1, r.data);
  const coinsAfterDaily = r.data.coins;
  r = await call('POST', '/api/daily', { initData: A, body: {} });
  check('Daily claim #2 same day blocked (24h cooldown)', r.data.ok === false, r.data);

  console.log('\n[4] Tasks (social / app / game timers, telegram membership)');
  r = await call('GET', '/api/me', { initData: A });
  const tasks = r.data.tasks;
  const appTask = tasks.find((t) => t.type === 'app_task');
  const gameTask = tasks.find((t) => t.type === 'play_game');
  const tgTask = tasks.find((t) => t.type === 'telegram_join');
  r = await call('POST', '/api/task/claim', { initData: A, body: { taskId: 'does_not_exist' } });
  check('Unknown task -> 404', r.status === 404, r.status);
  r = await call('POST', '/api/task/claim', { initData: A, body: { taskId: tgTask.id } });
  check('Telegram join task rejected when user is not a channel member', r.data.ok === false, r.data);
  r = await call('POST', '/api/task/claim', { initData: A, body: { taskId: appTask.id } });
  check('App task: first claim starts timer (not instantly credited)', r.data.ok === false && r.data.started === true && r.data.waitSeconds > 0, r.data);
  r = await call('POST', '/api/task/claim', { initData: A, body: { taskId: appTask.id } });
  check('App task: verify before timer ends is blocked', r.data.ok === false && !r.data.started, r.data);
  r = await call('POST', '/api/task/claim', { initData: A, body: { taskId: gameTask.id } });
  check('Play game: first claim starts timer', r.data.started === true, r.data);

  console.log('\n[5] Admin auth & task management');
  r = await call('GET', '/api/admin/stats', {});
  check('Admin stats without key -> 403', r.status === 403, r.status);
  r = await call('GET', '/api/admin/stats', { admin: 'wrong-admin-key' });
  check('Wrong admin key rejected -> 403', r.status === 403, r.status);
  r = await call('GET', '/api/admin/stats', { admin: '8990374489' });
  check('Telegram ADMIN_ID accepted -> 200', r.status === 200, r.status);
  r = await call('GET', '/api/admin/stats', { admin: ADMIN_SECRET });
  check('Admin stats with ADMIN_SECRET -> 200', r.status === 200 && r.data.totalUsers >= 3, r.data);

  r = await call('POST', '/api/admin/tasks', {
    admin: ADMIN_SECRET,
    body: { title: 'Quick Test Game', type: 'play_game', reward: 77, url: 'https://example.com/game', waitSeconds: 5, resetHours: 24 }
  });
  check('Admin create play_game task', r.data.ok === true && r.data.task.type === 'play_game' && r.data.task.icon === 'GAME', r.data);
  const quickTaskId = r.data.task && r.data.task.id;
  r = await call('PUT', `/api/admin/tasks/${quickTaskId}`, { admin: ADMIN_SECRET, body: { type: 'app_task', reward: 88 } });
  check('Admin edit task (type -> app_task, reward 88)', r.data.ok && r.data.task.type === 'app_task' && r.data.task.reward === 88, r.data);
  r = await call('POST', '/api/admin/tasks', { admin: ADMIN_SECRET, body: { title: '', url: '' } });
  check('Admin create task without title/url -> 400', r.status === 400, r.status);

  console.log('\n[6] Timed task completes after wait');
  r = await call('POST', '/api/task/claim', { initData: A, body: { taskId: quickTaskId } });
  check('Quick task timer started (5s)', r.data.started === true, r.data);
  await sleep(5600);
  r = await call('POST', '/api/task/claim', { initData: A, body: { taskId: quickTaskId } });
  check('Quick task verified after 5s -> +88 coins', r.data.ok === true && r.data.reward === 88, r.data);
  r = await call('POST', '/api/task/claim', { initData: A, body: { taskId: quickTaskId } });
  check('Same task cannot be claimed twice', r.data.ok === false && /Already/i.test(r.data.error), r.data);
  r = await call('GET', '/api/me', { initData: A });
  check('Completed task marked done for user', r.data.tasks.find((t) => t.id === quickTaskId).done === true);
  check('Coins balance updated correctly', r.data.user.coins === coinsAfterDaily + 88, { coins: r.data.user.coins, expected: coinsAfterDaily + 88 });
  check('Task notification created', r.data.notifications.some((n) => n.type === 'task'));

  r = await call('POST', `/api/admin/tasks/${quickTaskId}/reset`, { admin: ADMIN_SECRET });
  check('Admin reset single task', r.data.ok === true, r.data);
  r = await call('GET', '/api/me', { initData: A });
  check('After reset, task is available again', r.data.tasks.find((t) => t.id === quickTaskId).done === false);
  r = await call('POST', '/api/admin/tasks/reset-all', { admin: ADMIN_SECRET });
  check('Admin reset all tasks', r.data.ok === true);
  r = await call('DELETE', `/api/admin/tasks/${quickTaskId}`, { admin: ADMIN_SECRET });
  check('Admin delete task', r.data.ok === true && !r.data.tasks.some((t) => t.id === quickTaskId));

  console.log('\n[7] Ads reward callback');
  r = await call('GET', `/api/adsgram/reward?userid=${userAId}`);
  check('Ad reward without secret -> 403', r.status === 403, r.status);
  r = await call('GET', `/api/adsgram/reward?userid=${userAId}&secret=wrong`);
  check('Ad reward with wrong secret -> 403', r.status === 403, r.status);
  const before = (await call('GET', '/api/me', { initData: A })).data;
  r = await call('GET', `/api/adsgram/reward?userid=${userAId}&secret=${ADS_SECRET}`);
  const afterAd = (await call('GET', '/api/me', { initData: A })).data;
  check('Ad reward with correct secret credits user', r.status === 200 && afterAd.ads.watchedToday === before.ads.watchedToday + 1 && afterAd.user.coins === before.user.coins + before.ads.reward, { before: before.user.coins, after: afterAd.user.coins });
  await call('GET', `/api/adsgram/reward?userid=${userAId}&secret=${ADS_SECRET}`);
  const afterAd2 = (await call('GET', '/api/me', { initData: A })).data;
  check('Ad cooldown prevents instant double credit', afterAd2.ads.watchedToday === afterAd.ads.watchedToday);

  console.log('\n[8] Withdrawal');
  await call('POST', '/api/admin/settings', { admin: ADMIN_SECRET, body: { requireQualification: true, minWithdrawCoins: 100 } });
  r = await call('POST', '/api/withdraw', { initData: A, body: { method: 'eSewa', account: '9800000000', amountCoins: 100 } });
  check('Withdraw blocked until qualification complete', r.data.ok === false && /unlock/i.test(r.data.error), r.data);
  await call('POST', '/api/admin/settings', { admin: ADMIN_SECRET, body: { requireQualification: false, minWithdrawCoins: 100 } });
  r = await call('POST', '/api/withdraw', { initData: A, body: { method: 'FakeBank', account: '9800000000', amountCoins: 100 } });
  check('Withdraw with disabled/unknown method rejected', r.data.ok === false, r.data);
  r = await call('POST', '/api/withdraw', { initData: A, body: { method: 'eSewa', account: '12', amountCoins: 100 } });
  check('Withdraw with invalid account rejected', r.data.ok === false, r.data);
  r = await call('POST', '/api/withdraw', { initData: A, body: { method: 'eSewa', account: '9800000000', amountCoins: -500 } });
  check('Negative amount rejected', r.data.ok === false, r.data);
  r = await call('POST', '/api/withdraw', { initData: A, body: { method: 'eSewa', account: '9800000000', amountCoins: 99999999 } });
  check('Amount above balance rejected', r.data.ok === false && /Balance/i.test(r.data.error), r.data);
  const balBefore = (await call('GET', '/api/me', { initData: A })).data.user.coins;
  r = await call('POST', '/api/withdraw', { initData: A, body: { method: 'eSewa', account: '9800000000', amountCoins: 100 } });
  check('Valid withdraw request created (pending)', r.data.ok === true, r.data);
  const balAfter = (await call('GET', '/api/me', { initData: A })).data.user.coins;
  check('Coins deducted on withdraw', balAfter === balBefore - 100, { balBefore, balAfter });
  r = await call('GET', '/api/my-withdrawals', { initData: A });
  const wd = r.data.withdrawals && r.data.withdrawals[0];
  check('Transaction history shows withdrawal', wd && wd.status === 'pending' && wd.coins === 100, r.data);
  r = await call('GET', '/api/my-withdrawals', { initData: B });
  check("User B cannot see User A's withdrawals", r.data.withdrawals.length === 0, r.data);

  r = await call('POST', `/api/admin/withdraw/${wd.id}`, { admin: ADMIN_SECRET, body: { action: 'reject' } });
  check('Admin reject withdrawal', r.data.ok === true && r.data.withdraw.status === 'rejected');
  const balRefund = (await call('GET', '/api/me', { initData: A })).data.user.coins;
  check('Rejected withdrawal refunds coins', balRefund === balBefore, { balRefund, balBefore });
  r = await call('POST', `/api/admin/withdraw/${wd.id}`, { admin: ADMIN_SECRET, body: { action: 'reject' } });
  const balRefund2 = (await call('GET', '/api/me', { initData: A })).data.user.coins;
  check('Rejecting again does NOT double-refund', r.status === 400 && balRefund2 === balRefund, { status: r.status, balRefund2 });

  console.log('\n[9] Notifications');
  r = await call('POST', '/api/admin/notifications', { admin: ADMIN_SECRET, body: { userId: String(userBId), title: 'Hi Bob', message: 'Bonus for you', coins: 25 } });
  check('Admin sends individual notification + bonus', r.data.ok === true, r.data);
  r = await call('GET', '/api/me', { initData: B });
  check('User B receives notification and +25 bonus', r.data.notifications.some((n) => n.title === 'Hi Bob') && r.data.user.coins >= 25 && r.data.unreadCount > 0, r.data.user);
  r = await call('GET', '/api/me', { initData: A });
  check("User A does NOT see Bob's private notification", !r.data.notifications.some((n) => n.title === 'Hi Bob'));
  r = await call('POST', '/api/admin/notifications', { admin: ADMIN_SECRET, body: { userId: 'all', title: 'Broadcast', message: 'Hello everyone' } });
  r = await call('GET', '/api/me', { initData: A });
  check('Broadcast notification visible to all users', r.data.notifications.some((n) => n.title === 'Broadcast'));
  r = await call('POST', '/api/notifications/read', { initData: B, body: {} });
  check('Mark all notifications read -> unread 0', r.data.ok && r.data.unreadCount === 0, r.data.unreadCount);
  r = await call('DELETE', '/api/notifications', { initData: B });
  check('Clear notifications', r.data.ok === true);
  r = await call('POST', '/api/admin/notifications', { admin: ADMIN_SECRET, body: { userId: '999999999', title: 'x', message: 'y' } });
  check('Notification to unknown user -> 404', r.status === 404, r.status);

  console.log('\n[10] Profile verification (OTP)');
  r = await call('POST', '/api/verify/confirm-otp', { initData: A, body: { otp: '123456' } });
  check('Confirm OTP without requesting -> error', r.data.ok === false, r.data);
  r = await call('POST', '/api/verify/send-otp', { initData: A, body: { fullName: 'A1', email: 'a@gmail.com', dob: '2000-01-01', gender: 'Male' } });
  check('Fake name rejected', r.data.ok === false, r.data);
  r = await call('POST', '/api/verify/send-otp', { initData: A, body: { fullName: 'Alice Test', email: 'not-an-email', dob: '2000-01-01', gender: 'Male' } });
  check('Invalid email rejected', r.data.ok === false, r.data);
  r = await call('POST', '/api/verify/send-otp', { initData: A, body: { fullName: 'Alice Test', email: 'x@mailinator.com', dob: '2000-01-01', gender: 'Male' } });
  check('Disposable email domain rejected', r.data.ok === false, r.data);
  r = await call('POST', '/api/verify/send-otp', { initData: A, body: { fullName: 'Alice Test', email: 'x@thisdomaindoesnotexist-paiso-zz.com', dob: '2000-01-01', gender: 'Male' } });
  check('Email domain without MX record rejected', r.data.ok === false, r.data);
  r = await call('POST', '/api/verify/send-otp', { initData: A, body: { fullName: 'Alice Test', email: 'alice@gmail.com', dob: '2020-01-01', gender: 'Male' } });
  check('Under-13 age rejected', r.data.ok === false, r.data);
  r = await call('POST', '/api/verify/send-otp', { initData: A, body: { fullName: 'Alice Test', email: 'alice@gmail.com', dob: '2000-01-01', gender: 'Other' } });
  check('Invalid gender rejected', r.data.ok === false, r.data);
  r = await call('POST', '/api/verify/send-otp', { initData: A, body: { fullName: 'Alice Test', email: 'alice@gmail.com', dob: '2000-01-01', gender: 'Female' } });
  check('OTP request dispatched safely without code leakage in response', r.data.otp === undefined && r.data.code === undefined && (r.data.ok === true || /email/i.test(r.data.error)), r.data);
  r = await call('GET', '/api/me', { initData: A });
  check('OTP never appears in notifications', !r.data.notifications.some((n) => /OTP/i.test(n.title)));
  check('pendingOtp never exposed to client', !('pendingOtp' in r.data.user) || r.data.user.pendingOtp === undefined, r.data.user.pendingOtp);

  console.log('\n[11] Admin user CRUD');
  r = await call('POST', `/api/admin/user/${userBId}/coins`, { admin: ADMIN_SECRET, body: { delta: 50 } });
  check('Admin adjust coins', r.data.ok === true);
  r = await call('POST', `/api/admin/user/${userBId}/verify`, { admin: ADMIN_SECRET });
  check('Admin toggle blue tick', r.data.ok === true && r.data.verified === true);
  r = await call('PUT', `/api/admin/user/${userBId}`, { admin: ADMIN_SECRET, body: { name: 'Bobby' } });
  check('Admin edit user', r.data.ok === true && r.data.user.first_name === 'Bobby');
  r = await call('DELETE', `/api/admin/user/${userSelfId}`, { admin: ADMIN_SECRET });
  check('Admin delete user', r.data.ok === true);
  r = await call('DELETE', `/api/admin/user/${userSelfId}`, {});
  check('Delete user without admin key -> 403', r.status === 403);

  console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`);
  if (fail) console.log('Failed: ' + failures.join(' | '));
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error('Test crashed:', e);
  process.exit(2);
});
