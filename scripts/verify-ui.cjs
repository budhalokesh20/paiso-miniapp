const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const { chromium } = require(process.env.PAISO_PLAYWRIGHT || 'playwright');
const express = require('express');
const app = express();
app.use(express.static(path.join(root,'public')));
const fixtures = {
  user:{id:'12345',first_name:'Paiso User',username:'paiso_user',coins:12500,totalEarned:12500,referrals:125,lastDaily:'',dailyStreak:3},
  tasks:[
    {id:'app',title:'Install & Open App',description:'Install new app and open',type:'app_task',reward:200,waitSeconds:1},
    {id:'game',title:'Play Gaming App',description:'Play and reach level 5',type:'play_game',reward:500,waitSeconds:30},
    {id:'survey',title:'Complete Survey',description:'Share your opinion',type:'social_visit',reward:300,waitSeconds:15},
    {id:'web',title:'Visit Website',description:'Visit and stay for 30 seconds',type:'social_visit',reward:80,waitSeconds:30},
    {id:'channel',title:'Join Channel',description:'Join and stay',type:'telegram_join',reward:100},
    {id:'quiz',title:'Daily Quiz',description:'Answer 5 questions',type:'social_visit',reward:50,waitSeconds:15},
  ].map(t=>({...t,url:'https://example.com',target:'',icon:''})),
  games:[{id:'runner',title:'City Runner'},{id:'puzzle',title:'Color Match'},{id:'pool',title:'Pocket Pool'},{id:'racer',title:'Car Racing'}].map(g=>({...g,description:'Play for fun',priceCoins:0,enabled:true,plays:0,coinsCollected:0})),
  coinPerNpr:100,minWithdrawCoins:10000,referralBonusCoins:200,dailyBonus:100,
  ads:{blockId:'',reward:50,dailyCap:10,watchedToday:0},canDaily:true,nextDailyAt:0,dailyStreak:3,
  qualification:{adsDone:3,adsReq:3,tasksDone:2,tasksReq:2,dailyDone:3,dailyReq:2,qualified:true},
  referralHistory:['user123','nepali_user','gaming_boy'].map((name,i)=>({id:String(i),name:'@'+name,username:'',joinedAt:'2026-10-29T10:00:00Z',qualified:true,bonusCoins:200,adsDone:3,adsReq:3,tasksDone:2,tasksReq:2,dailyDone:2,dailyReq:2})),
  withdrawSettings:{methods:[{id:'esewa',name:'eSewa',logo:'',placeholder:'eSewa ID',enabled:true},{id:'khalti',name:'Khalti',logo:'',enabled:true}],countries:[]},
  refLink:'https://t.me/paiso_bot?start=12345',notifications:[],unreadCount:0
};
async function run(){
  const server=app.listen(0,'127.0.0.1'); await new Promise(resolve=>server.once('listening',resolve));
  const browser=await chromium.launch({headless:true,...(process.env.PAISO_CHROMIUM ? {executablePath:process.env.PAISO_CHROMIUM} : {})});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
  // Test app interactions against fixtures without waiting on third-party SDK networks.
  await context.route('https://telegram.org/js/telegram-web-app.js', route=>route.fulfill({contentType:'application/javascript',body:''}));
  await context.route('https://sad.adsgram.ai/js/sad.min.js', route=>route.fulfill({contentType:'application/javascript',body:''}));
  const page=await context.newPage(); const errors=[]; const claims=[];
  page.on('pageerror', e=>errors.push(e.message));
  await context.route('**/api/**',async route=>{
    const url=new URL(route.request().url()); let data={ok:true};
    if(url.pathname==='/api/me') data=fixtures;
    if(url.pathname==='/api/my-withdrawals') data={withdrawals:[]};
    if(url.pathname.endsWith('/play')) data={ok:true,playUrl:'about:blank',coins:12500};
    if(url.pathname==='/api/task/claim'){claims.push(route.request().postDataJSON());data=claims.length===1?{ok:false,started:true,waitSeconds:1}:{ok:true,reward:200}; if(claims.length>1) fixtures.tasks[0].done=true;}
    if(url.pathname==='/api/daily'){fixtures.canDaily=false;fixtures.dailyStreak=4;fixtures.nextDailyAt=Date.now()+86400000;data={ok:true,reward:100,coins:12600,dailyStreak:4,nextDailyAt:fixtures.nextDailyAt};}
    await route.fulfill({json:data});
  });
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});
  await page.locator('.explore-card').last().waitFor();
  fs.mkdirSync(path.join(root,'ui/preview'),{recursive:true});
  for(const tab of ['home','tasks','refer','wallet','games','offers']){
    await page.evaluate(tab=>window.showTab(tab),tab);
    await page.waitForFunction(tab => getComputedStyle(document.getElementById('tab-'+tab)).opacity === '1', tab);
    await page.screenshot({path:path.join(root,'ui/preview',tab+'.png')});
    const overflow=await page.locator('#tab-'+tab).evaluate(el=>el.scrollWidth>el.clientWidth);
    if (overflow) console.log(await page.locator('#tab-'+tab).evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,children:[...el.querySelectorAll('*')].filter(child=>child.getBoundingClientRect().right>el.getBoundingClientRect().right+1).slice(0,12).map(child=>({class:child.className,width:child.getBoundingClientRect().width,right:child.getBoundingClientRect().right}))})));
    assert.equal(overflow,false,tab+' must not overflow horizontally');
  }
  const homeSizes = [{width:320,height:568},{width:360,height:640},{width:390,height:844},{width:480,height:800},{width:768,height:1024},{width:844,height:390},{width:1280,height:800}];
  for (const size of homeSizes) {
    await page.setViewportSize(size);
    await page.evaluate(()=>window.showTab('home'));
    await page.waitForFunction(()=>getComputedStyle(document.getElementById('tab-home')).opacity==='1');
    const layout = await page.evaluate(()=>{
      const home=document.getElementById('tab-home');
      home.scrollTop=home.scrollHeight;
      const cards=[...document.querySelectorAll('#featuredGames .featured-game')];
      const dock=document.querySelector('.bottom-nav').getBoundingClientRect();
      const shortcuts=[...document.querySelectorAll('#exploreGrid button')];
      const childRects=[...document.querySelector('.home-layout').children].map(el=>el.getBoundingClientRect());
      return {
        overflow:home.scrollWidth>home.clientWidth,
        lastCardBottom:Math.max(...cards.map(el=>el.getBoundingClientRect().bottom)),
        dockTop:dock.top,
        tapTargets:shortcuts.every(el=>el.clientWidth>=44&&el.clientHeight>=44),
        dailyWidth:document.getElementById('dailyCard').getBoundingClientRect().width,
        heroWidth:document.querySelector('.home-hero').getBoundingClientRect().width,
        overlaps:childRects.some((a,i)=>childRects.some((b,j)=>i!==j&&a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1)),
      };
    });
    assert.equal(layout.overflow,false,'Home overflow '+JSON.stringify(size));
    assert.equal(layout.overlaps,false,'Home section overlap '+JSON.stringify(size));
    assert.equal(layout.tapTargets,true,'Home touch targets');
    assert.ok(layout.lastCardBottom<=layout.dockTop-12,'Last game clears dock '+JSON.stringify(size));
    if(size.width>=700) assert.ok(layout.dailyWidth<layout.heroWidth*.6,'Tablet uses two columns');
    await page.evaluate(()=>{document.getElementById('tab-home').scrollTop=0;});
    if ([320,390,768,844].includes(size.width)) await page.screenshot({path:path.join(root,'ui/preview',`home-${size.width}.png`)});
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('#featuredGames button').first().focus();
  await page.evaluate(()=>{window.__featuredNode=document.querySelector('#featuredGames button');window.__homeScroll=document.getElementById('tab-home').scrollTop;});
  await page.clock.install();
  const refresh=page.waitForResponse(response=>response.url().endsWith('/api/my-withdrawals'));
  await page.clock.fastForward(8000); await refresh;
  assert.equal(await page.evaluate(()=>window.__featuredNode===document.querySelector('#featuredGames button')&&document.activeElement===window.__featuredNode&&document.getElementById('tab-home').scrollTop===window.__homeScroll),true,'Background refresh preserves game button, focus and scroll');
  await page.clock.resume();
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.home-hero button').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await page.getByRole('button',{name:'Claim daily reward',exact:true}).click();
  assert.equal(await page.locator('#dailyBtn').evaluate(el=>el===document.activeElement),true);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByRole('button',{name:'Search tasks',exact:true}).click();
  await page.getByRole('searchbox',{name:'Search tasks'}).fill('survey');
  assert.equal(await page.locator('#taskList .task-card').count(),1);
  await page.getByRole('searchbox',{name:'Search tasks'}).fill('');
  await page.getByRole('button',{name:'Apps',exact:true}).click();
  assert.equal(await page.locator('#taskList .task-card').count(),1);
  await page.locator('#verify-app').click();
  await page.waitForFunction(()=>document.getElementById('verify-app')?.textContent==='Verify');
  await page.locator('#verify-app').click();
  await page.waitForFunction(()=>!document.getElementById('verify-app'));
  assert.equal(claims.length,2,'start and verify preserve the backend flow');
  await page.getByRole('button',{name:'Done',exact:true}).click();
  assert.equal(await page.locator('#taskList .task-card').count(),1);
  await page.getByRole('button',{name:'Withdraw rewards',exact:true}).click();
  await page.waitForFunction(()=>getComputedStyle(document.getElementById('tab-wallet')).opacity==='1');
  assert.equal(await page.locator('#sub-withdraw').evaluate(el=>el.classList.contains('open')),true);
  await page.screenshot({path:path.join(root,'ui/preview','withdraw.png')});
  await page.evaluate(()=>window.closeSettingPage());
  for(const width of [320,360,430,768]){
    await page.setViewportSize({width,height:844});
    for(const tab of ['home','tasks','refer','wallet','games']){
      await page.evaluate(tab=>window.showTab(tab),tab);
      assert.equal(await page.locator('#tab-'+tab).evaluate(el=>el.scrollWidth>el.clientWidth),false,tab+' overflow at '+width);
    }
  }
  const brokenImages=await page.locator('img').evaluateAll(imgs=>imgs.filter(img=>!img.complete||img.naturalWidth===0).map(img=>img.src));
  assert.deepEqual(brokenImages,[]); assert.deepEqual(errors,[]);
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.showTab('home'));
  await page.getByRole('button',{name:'Claim daily reward',exact:true}).click();
  assert.equal(await page.locator('#dailyBtn').evaluate(el=>el===document.activeElement),true);
  await page.locator('#dailyBtn').click();
  await page.waitForFunction(()=>document.getElementById('dailyBtn').disabled);
  await page.locator('#featuredGames button').first().click();
  await page.locator('#gameModal').waitFor({state:'visible'});
  assert.equal(await page.locator('#gameModal').evaluate(el=>getComputedStyle(el).visibility),'visible');
  await page.getByRole('button',{name:'Close game',exact:true}).click();
  assert.equal(await page.locator('#gameModal').isVisible(),false);
  await page.evaluate(()=>window.showTab('refer'));
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.getByRole('button',{name:'Copy',exact:true}).click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),fixtures.refLink);
  await page.evaluate(()=>window.showTab('wallet'));
  await page.getByRole('button',{name:'Notifications',exact:true}).click();
  await page.locator('#notifModal').waitFor({state:'visible'});
  assert.equal(await page.locator('#notifModal').evaluate(el=>getComputedStyle(el).position),'fixed');
  assert.deepEqual(errors,[]);
  await page.evaluate(()=>window.closeNotificationsModal());
  const savedGames=fixtures.games;
  fixtures.games=fixtures.games.map(g=>({...g,title:'A very long game title that should wrap without breaking the layout',priceCoins:12500}));
  await page.reload({waitUntil:'networkidle'});
  await page.setViewportSize({width:320,height:568});
  assert.equal(await page.locator('#tab-home').evaluate(el=>el.scrollWidth>el.clientWidth),false,'Long titles do not overflow');
  fixtures.games=[];
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#featuredGames .games-empty-link').waitFor();
  assert.equal(await page.locator('#featuredGames').getAttribute('aria-busy'),'false');
  fixtures.games=savedGames;
  await context.route('**/api/me',route=>route.abort());
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.getElementById('featuredGames').getAttribute('aria-busy')==='false');
  assert.match(await page.locator('#featuredGames').innerText(),/check your connection/i);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:true,screens:7,homeSizes,taskStartAndVerify:true,search:true,filters:true,withdrawal:true,homeGameLaunch:true,dailyCheckin:true,copyReferral:true,notifications:true,stablePolling:true,emptyAndOffline:true,reducedMotion:true,brokenImages,errors},null,2));
  await browser.close();server.close();
}
run().catch(e=>{console.error(e);process.exit(1)});
