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
  fs.copyFileSync(path.join(root, 'data/tasks.json'), path.join(sandbox, 'data/tasks.json'));
  const game = {id:'game_test',title:'Test Game',description:'Fixture game',url:'https://example.com/game',priceCoins:0,enabled:true,createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z'};
  const paid = {...game,id:'game_paid',title:'Paid Game',priceCoins:100};
  const user = {id:'999001',first_name:'Test User',username:'test',coins:100,totalEarned:100,referrals:0,lastDaily:'',totalDailyCheckins:0,totalAdsWatched:0,referredBy:null,refBonusPaid:false,joinedAt:'2026-01-01T00:00:00Z'};
  const history = [{id:'other',gameId:'other',gameTitle:'Another user private game',userId:'999002',coins:50,at:'2026-01-01T00:00:00Z'}];
  fs.writeFileSync(path.join(sandbox,'data/db.json'),JSON.stringify({users:{'999001':user},games:[game,paid],gamePlays:history}));
  const probe=net.createServer(); await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
  const port=probe.address().port; await new Promise(resolve=>probe.close(resolve));
  const server=spawn(process.execPath,[path.join(sandbox,'server.js')],{cwd:sandbox,env:{...process.env,NODE_PATH:path.join(root,'node_modules'),PORT:String(port),NODE_ENV:'development',BOT_TOKEN:'',DATABASE_URL:''},stdio:'ignore'});
  const base=`http://127.0.0.1:${port}`;
  try {
    let ready=false;
    for(let i=0;i<80;i++){ try{await fetch(base+'/api/me');ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));} }
    assert.ok(ready,'isolated server started');
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
    console.log('Isolated backend game, history privacy and authentication checks passed.');
  } finally { server.kill(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
