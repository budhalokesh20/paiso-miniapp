// Isolated file-backed server; never reads or writes the application's live database.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
async function main() {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'paiso-game-test-'));
  fs.mkdirSync(path.join(sandbox, 'data'));
  fs.copyFileSync(path.join(root, 'server.js'), path.join(sandbox, 'server.js'));
  if(process.env.PAISO_ADMIN_UI_TEST) fs.cpSync(path.join(root,'public'),path.join(sandbox,'public'),{recursive:true});
  for(const module of ['transactional-snapshot.js','reward-rules.js']) fs.copyFileSync(path.join(root,module),path.join(sandbox,module));
  fs.copyFileSync(path.join(root, 'data/tasks.json'), path.join(sandbox, 'data/tasks.json'));
  const game = {id:'game_test',title:'Test Game',description:'Fixture game',url:'https://example.com/game',priceCoins:0,enabled:true,createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z'};
  const paid = {...game,id:'game_paid',title:'Paid Game',priceCoins:100};
  const user = {id:'999001',first_name:'Test User',username:'test',coins:100,totalEarned:100,referrals:0,lastDaily:'',totalDailyCheckins:0,totalAdsWatched:0,referredBy:null,refBonusPaid:false,joinedAt:'2026-01-01T00:00:00Z'};
  const history = [{id:'other',gameId:'other',gameTitle:'Another user private game',userId:'999002',coins:50,at:'2026-01-01T00:00:00Z'}];
  fs.writeFileSync(path.join(sandbox,'data/db.json'),JSON.stringify({users:{'999001':user},games:[game,paid],gamePlays:history}));
  const usePg=process.env.PAISO_API_TEST_DB==='pg';
  const pgPath=path.join(sandbox,'postgres');
  if(usePg){const {PGlite}=require(process.env.PGLITE_MODULE || '@electric-sql/pglite');const local=new PGlite(pgPath);await local.exec('CREATE TABLE paiso_state(id int PRIMARY KEY,data jsonb NOT NULL)');await local.query('INSERT INTO paiso_state VALUES(1,$1::jsonb)',[fs.readFileSync(path.join(sandbox,'data/db.json'),'utf8')]);await local.close();}
  const probe=net.createServer(); await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
  const port=probe.address().port; await new Promise(resolve=>probe.close(resolve));
  const server=spawn(process.execPath,[path.join(sandbox,'server.js')],{cwd:sandbox,env:{...process.env,NODE_PATH:path.join(root,'node_modules'),PORT:String(port),NODE_ENV:usePg?'test':'development',BOT_TOKEN:'',DATABASE_URL:'',PAISO_TEST_PGLITE_MODULE:usePg?process.env.PGLITE_MODULE:'',PAISO_TEST_DB_PATH:pgPath},stdio:'ignore'});
  const base=`http://127.0.0.1:${port}`;
  try {
    let ready=false;
    for(let i=0;i<80;i++){ try{await fetch(base+'/api/me');ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));} }
    assert.ok(ready,'isolated server started');
    assert.deepEqual(await (await fetch(base+'/healthz')).json(),{ok:true,release:'rewards-v1'});
    const denied=await fetch(base+'/api/me',{headers:{'x-forwarded-for':'203.0.113.10'}});
    assert.equal(denied.status,401,'missing bot token cannot create a remote test account');
    let me=await (await fetch(base+'/api/me')).json();
    assert.equal(me.games[0].url,undefined,'hosted game URL is not exposed');
    assert.deepEqual(me.recentGames,[],'another user’s history stays private');
    const started=await (await fetch(base+'/api/games/game_test/play',{method:'POST'})).json();
    assert.equal(started.ok,true); assert.match(started.playUrl,/^\/api\/games\/game_test\/content\?ticket=/);
    const content=await fetch(base+started.playUrl,{redirect:'manual'});
    assert.equal(content.status,302); assert.equal(content.headers.get('location'),game.url);
    me=await (await fetch(base+'/api/me')).json();
    assert.equal(me.recentGames.length,1); assert.equal(me.recentGames[0].gameTitle,'Test Game');
    assert.equal(me.recentGames[0].coins,0); assert.equal(me.recentGames[0].userId,undefined);
    const attempts=await Promise.all([fetch(base+'/api/games/game_paid/play',{method:'POST'}),fetch(base+'/api/games/game_paid/play',{method:'POST'})]);
    assert.deepEqual(attempts.map(response=>response.status).sort(),[200,402],'concurrent plays cannot spend the same balance twice');
    me=await (await fetch(base+'/api/me')).json();
    assert.equal(me.user.coins,0); assert.equal(me.recentGames[0].coins,100);
    const admin={'Content-Type':'application/json','x-admin-id':'admin'};
    assert.equal((await fetch(base+'/api/admin/rewards/spin',{method:'PUT',headers:admin,body:JSON.stringify({enabled:true,cooldownMs:86400000,rewards:[10]})})).status,200);
    const spins=await Promise.all([fetch(base+'/api/rewards/spin',{method:'POST'}),fetch(base+'/api/rewards/spin',{method:'POST'})]);
    assert.deepEqual(spins.map(response=>response.status).sort(),[200,409]);
    assert.equal((await fetch(base+'/api/admin/rewards/codes',{method:'POST',headers:admin,body:JSON.stringify({code:'TEST-25',points:25,maxUses:1})})).status,200);
    const redeem=()=>fetch(base+'/api/rewards/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:'test-25'})});
    const redemptions=await Promise.all([redeem(),redeem()]);
    assert.deepEqual(redemptions.map(response=>response.status).sort(),[200,409]);
    me=await (await fetch(base+'/api/me')).json();assert.equal(me.user.coins,35,'spin and bonus credit exactly once');
    if(!usePg){
      await fetch(base+'/api/admin/rewards/codes',{method:'POST',headers:admin,body:JSON.stringify({code:'FAIL-20',points:20,maxUses:1})});
      const blocked=path.join(sandbox,'data/db.json.tmp');fs.mkdirSync(blocked);
      const fail=await fetch(base+'/api/rewards/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:'FAIL-20'})});
      assert.equal(fail.status,503,'storage failure must not report a credited reward');fs.rmdirSync(blocked);
      const retry=await (await fetch(base+'/api/rewards/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:'FAIL-20'})})).json();
      assert.equal(retry.ok,true,'failed commit must not consume the bonus code');
    }
    const daily=await (await fetch(base+'/api/daily',{method:'POST'})).json();assert.equal(daily.ok,true);
    const repeatedDaily=await (await fetch(base+'/api/daily',{method:'POST'})).json();assert.equal(repeatedDaily.ok,false);
    await fetch(base+'/api/admin/settings',{method:'POST',headers:admin,body:JSON.stringify({minWithdrawCoins:100,requireQualification:false})});
    const withdrawal=await (await fetch(base+'/api/withdraw',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({method:'eSewa',account:'test-12345',amountCoins:100})})).json();
    assert.equal(withdrawal.ok,true,'existing withdrawals commit through the new persistence fence');
    assert.equal((await (await fetch(base+'/api/my-withdrawals')).json()).withdrawals.length,1);
    if(process.env.PAISO_ADMIN_UI_TEST){
      const {chromium}=require(process.env.PAISO_PLAYWRIGHT || 'playwright');
      const browser=await chromium.launch({headless:true,executablePath:process.env.PAISO_CHROMIUM});
      try{const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
        await page.route('https://fonts.googleapis.com/**',route=>route.abort());
        await page.addInitScript(()=>sessionStorage.setItem('paiso_admin_key','admin'));
        await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
        await page.getByRole('button',{name:'Games',exact:true}).first().click();
        await page.getByLabel('Possible P points (comma separated)').fill('15');
        const saved=page.waitForResponse(response=>response.url().endsWith('/api/admin/rewards/spin') && response.request().method()==='PUT');
        await page.getByRole('button',{name:'Save spin settings',exact:true}).click();assert.equal((await saved).status(),200);
        await page.waitForFunction(()=>document.querySelector('input[name="rewards"]').value==='15' && !document.querySelector('button[type="submit"]').disabled);
        await page.getByLabel('Code',{exact:true}).fill('UI-TEST');
        await page.getByLabel('P points',{exact:true}).fill('30');
        await page.getByLabel('Total redemptions').fill('2');
        const created=page.waitForResponse(response=>response.url().endsWith('/api/admin/rewards/codes') && response.request().method()==='POST');
        await page.getByRole('button',{name:'Create code',exact:true}).click();assert.equal((await created).status(),200);
        await page.getByText('UI-TEST',{exact:true}).waitFor();
        const row=page.getByText('UI-TEST',{exact:true}).locator('..').locator('..');
        await row.getByRole('button',{name:'Pause',exact:true}).click();
        await row.getByRole('button',{name:'Enable',exact:true}).waitFor();
        const state=await (await fetch(base+'/api/admin/rewards',{headers:{'x-admin-id':'admin'}})).json();
        assert.deepEqual(state.spin.rewards,[15]);assert.equal(state.codes.find(code=>code.code==='UI-TEST').enabled,false);
        fs.mkdirSync(path.join(root,'ui/preview'),{recursive:true});await page.screenshot({path:path.join(root,'ui/preview/admin-rewards.png'),fullPage:true});
        assert.deepEqual(errors,[]);
      }finally{await browser.close();}
    }
    console.log('Isolated backend game, history privacy and authentication checks passed.');
  } finally { const stopped=new Promise(resolve=>server.once('exit',resolve)); server.kill(); await stopped; }
  if(usePg){
    const {PGlite}=require(process.env.PGLITE_MODULE || '@electric-sql/pglite');const reopened=new PGlite(pgPath);
    try{const snapshot=(await reopened.query('SELECT data FROM paiso_state WHERE id=1')).rows[0].data;
      assert.equal(snapshot.users['999001'].coins,35,'committed rewards persist after server shutdown');
      assert.equal(snapshot.rewardCodes['TEST-25'].uses,1);
      assert.equal(snapshot.rewardCodes['TEST-25'].usedBy['999001'],true);
      const backup=(await reopened.query("SELECT data FROM paiso_release_backups WHERE release='rewards-v1'")).rows[0].data;
      assert.equal(backup.users['999001'].coins,100,'release backup preserves the balance before the upgrade');
    }finally{await reopened.close();}
  }
  for (const dbUrl of ['', 'not-a-postgres-url']) {
    const production=spawn(process.execPath,[path.join(sandbox,'server.js')],{cwd:sandbox,env:{...process.env,NODE_PATH:path.join(root,'node_modules'),PORT:String(port),NODE_ENV:'production',BOT_TOKEN:'',DATABASE_URL:dbUrl},stdio:'ignore'});
    const exit=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{production.kill();reject(new Error('production startup did not stop'));},5000);production.on('exit',code=>{clearTimeout(timer);resolve(code);});});
    assert.notEqual(exit,0,'production must not fall back to temporary file data when PostgreSQL is missing or invalid');
  }
  console.log('Production database startup fails closed.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
