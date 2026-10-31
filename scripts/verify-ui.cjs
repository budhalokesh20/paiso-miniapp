const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const { chromium } = require(process.env.PAISO_PLAYWRIGHT || 'playwright');
const express = require('express');
const app = express();
app.use(express.static(path.join(root,'public')));
const fixtures = {
  spinSettings:{enabled:true,cooldownMs:86400000,rewards:[10]},nextSpinAt:0,
  user:{id:'12345',first_name:'Aarav',username:'paiso_user',coins:12500,totalEarned:12500,referrals:125,lastDaily:'',dailyStreak:3},
  tasks:[
    {id:'app',title:'Install & Open App',description:'Install new app and open',type:'app_task',reward:200,waitSeconds:1},
    {id:'game',title:'Play Gaming App',description:'Play and reach level 5',type:'play_game',reward:500,waitSeconds:30},
    {id:'survey',title:'Complete Survey',description:'Share your opinion',type:'social_visit',reward:300,waitSeconds:15},
    {id:'web',title:'Visit Website',description:'Visit and stay for 30 seconds',type:'social_visit',reward:80,waitSeconds:30},
    {id:'channel',title:'Join Channel',description:'Join and stay',type:'telegram_join',reward:100},
    {id:'quiz',title:'Daily Quiz',description:'Answer 5 questions',type:'social_visit',reward:50,waitSeconds:15},
  ].map(t=>({...t,url:'https://example.com',target:'',icon:''})),
  games:[{id:'fruit',title:'Fruit Master'},{id:'racer',title:'Car Racing'},{id:'puzzle',title:'Puzzle Match'},{id:'bubble',title:'Bubble Pop'}].map(g=>({...g,description:'Play for fun',priceCoins:g.id==='bubble'?50:0,enabled:true,plays:0,coinsCollected:0})),
  coinPerNpr:100,minWithdrawCoins:10000,referralBonusCoins:200,dailyBonus:100,
  ads:{blockId:'',reward:50,dailyCap:10,watchedToday:0},canDaily:true,nextDailyAt:0,dailyStreak:3,
  qualification:{adsDone:3,adsReq:3,tasksDone:2,tasksReq:2,dailyDone:3,dailyReq:2,qualified:true},
  referralHistory:['user123','nepali_user','gaming_boy'].map((name,i)=>({id:String(i),name:'@'+name,username:'',joinedAt:'2026-10-29T10:00:00Z',qualified:true,bonusCoins:200,adsDone:3,adsReq:3,tasksDone:2,tasksReq:2,dailyDone:2,dailyReq:2})),
  withdrawSettings:{methods:[{id:'esewa',name:'eSewa',logo:'',placeholder:'eSewa ID',enabled:true},{id:'khalti',name:'Khalti',logo:'',enabled:true}],countries:[]},
  refLink:'https://t.me/paiso_bot?start=12345',notifications:[],unreadCount:0,
  recentGames:[{gameId:'fruit',gameTitle:'Fruit Master',coins:0,at:'2026-10-29T10:00:00Z'}]
};
async function run(){
  const server=app.listen(0,'127.0.0.1'); await new Promise(resolve=>server.once('listening',resolve));
  const browser=await chromium.launch({headless:true,...(process.env.PAISO_CHROMIUM ? {executablePath:process.env.PAISO_CHROMIUM} : {})});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
  // Test app interactions against fixtures without waiting on third-party SDK networks.
  await context.route('https://telegram.org/js/telegram-web-app.js', route=>route.fulfill({contentType:'application/javascript',body:''}));
  await context.route('https://sad.adsgram.ai/js/sad.min.js', route=>route.fulfill({contentType:'application/javascript',body:''}));
  const page=await context.newPage(); const errors=[]; const claims=[]; let dailyRequests=0;
  page.on('pageerror', e=>errors.push(e.message));
  await context.route('**/api/**',async route=>{
    const url=new URL(route.request().url()); let data={ok:true};
    if(url.pathname==='/api/me') data=fixtures;
    if(url.pathname==='/api/my-withdrawals') data={withdrawals:[]};
    if(url.pathname==='/api/notifications/read'){fixtures.unreadCount=0;data={ok:true,notifications:[],unreadCount:0};}
    if(url.pathname.endsWith('/play')) data={ok:true,playUrl:'about:blank',coins:12500};
    if(url.pathname==='/api/task/claim'){claims.push(route.request().postDataJSON());data=claims.length===1?{ok:false,started:true,waitSeconds:1}:{ok:true,reward:200}; if(claims.length>1) fixtures.tasks[0].done=true;}
    if(url.pathname==='/api/daily'){dailyRequests++;fixtures.canDaily=false;fixtures.dailyStreak=4;fixtures.nextDailyAt=Date.now()+86400000;data={ok:true,reward:100,coins:12600,dailyStreak:4,nextDailyAt:fixtures.nextDailyAt};}
    if(url.pathname==='/api/rewards/spin'){fixtures.nextSpinAt=Date.now()+86400000;data={ok:true,points:10,coins:12510};}
    if(url.pathname==='/api/rewards/redeem'){data=route.request().postDataJSON().code==='TEST-25'?{ok:true,points:25,coins:12535}:{ok:false,error:'Invalid bonus code.'};}
    await route.fulfill({json:data});
  });
  fixtures.unreadCount=12;
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});
  await page.locator('.explore-card').last().waitFor();
  fs.mkdirSync(path.join(root,'ui/preview'),{recursive:true});
  assert.equal(await page.locator('#homeGreeting').innerText(),'Hey, Aarav');
  assert.equal(await page.locator('.app-header .brand-wrap, .app-header .paiso-symbol').count(),0);
  assert.equal(await page.getByRole('button',{name:'Search tasks',exact:true}).count(),0);
  assert.equal(await page.locator('#homeUnreadBadge').innerText(),'9+');
  await page.locator('#homeNotificationsBtn').click();
  await page.locator('#notifModal').waitFor({state:'visible'});
  await page.waitForFunction(()=>document.getElementById('homeUnreadBadge').style.display==='none');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#homeNotificationsBtn').evaluate(el=>el===document.activeElement),true);
  await page.getByRole('button',{name:'Your profile',exact:true}).click();
  assert.equal(await page.locator('.app-header').isVisible(),false);
  await page.locator('.bottom-nav').getByRole('button',{name:'Home',exact:true}).click();
  for(const tab of ['home','tasks','refer','wallet','games','offers']){
    await page.evaluate(tab=>window.showTab(tab),tab);
    await page.waitForFunction(tab => getComputedStyle(document.getElementById('tab-'+tab)).opacity === '1', tab);
    assert.equal(await page.locator('.app-header').isVisible(),tab==='home','Header is Home-only: '+tab);
    if(tab!=='home') assert.equal(Math.round((await page.locator('.app-viewport').boundingBox()).y),0,'No header gap: '+tab);
    await page.screenshot({path:path.join(root,'ui/preview',tab+'.png')});
    const overflow=await page.locator('#tab-'+tab).evaluate(el=>el.scrollWidth>el.clientWidth);
    if (overflow) console.log(await page.locator('#tab-'+tab).evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,children:[...el.querySelectorAll('*')].filter(child=>child.getBoundingClientRect().right>el.getBoundingClientRect().right+1).slice(0,12).map(child=>({class:child.className,width:child.getBoundingClientRect().width,right:child.getBoundingClientRect().right}))})));
    assert.equal(overflow,false,tab+' must not overflow horizontally');
  }
  await page.evaluate(()=>window.showTab('games'));
  await page.getByRole('searchbox',{name:'Search games'}).fill('puzzle');
  assert.equal(await page.locator('#gamesGrid .game-card').count(),1);
  assert.match(await page.locator('#gamesGrid').innerText(),/Puzzle Match/);
  await page.getByRole('searchbox',{name:'Search games'}).fill('');
  await page.getByRole('button',{name:'Coins',exact:true}).click();
  assert.equal(await page.locator('#gamesGrid .game-card').count(),1);
  assert.match(await page.locator('#gamesGrid').innerText(),/Bubble Pop/);
  await page.getByRole('button',{name:'Free',exact:true}).click();
  assert.equal(await page.locator('#gamesGrid .game-card').count(),3);
  await page.getByRole('button',{name:'All games',exact:true}).click();
  await page.getByRole('searchbox',{name:'Search games'}).fill('no such game');
  assert.match(await page.locator('#gamesGrid').innerText(),/No games found/);
  await page.getByRole('searchbox',{name:'Search games'}).fill('');
  assert.match(await page.locator('#gameHistory').innerText(),/Fruit Master/);


  // Reference Tasks landing and real category lists.
  for(const size of [{width:320,height:568},{width:768,height:1024},{width:1280,height:800}]) {
    await page.setViewportSize(size);
    for(const tab of ['home','tasks']) {
      await page.evaluate(tab=>window.showTab(tab),tab);
      for(const [card,id] of [['spin','sub-spin'],['bonus','sub-bonus']]) {
        const opener=page.locator('#tab-'+tab+' .quick-'+card+' > button');
        await opener.scrollIntoViewIfNeeded();
        const scroll=await page.locator('#tab-'+tab).evaluate(el=>el.scrollTop);
        await opener.click();
        await page.locator('#'+id).evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
        const bounds=await page.locator('#'+id).boundingBox();
        assert.ok(Math.abs(bounds.x)<1 && Math.abs(bounds.y)<1 && Math.abs(bounds.width-size.width)<1 && Math.abs(bounds.height-size.height)<1,'Separate reward page fills viewport');
        assert.equal(await page.locator('#'+id).evaluate(el=>el.scrollWidth>el.clientWidth),false);
        if(size.width===320 && tab==='home') await page.screenshot({path:path.join(root,'ui/preview',id+'-320.png')});
        await page.locator('#'+id).getByRole('button',{name:'Back',exact:true}).click();
        assert.equal(await page.locator('#tab-'+tab).evaluate(el=>el.scrollTop),scroll,'Back preserves the originating page scroll');
      }
    }
  }
  await page.setViewportSize({width:390,height:844});
  console.log('Checking Tasks layouts and category actions');
  const taskSizes=[{width:320,height:568},{width:390,height:844},{width:768,height:1024},{width:844,height:390},{width:1280,height:800}];
  for(const size of taskSizes) {
    await page.setViewportSize(size);
    await page.evaluate(()=>window.showTab('tasks'));
    await page.waitForFunction(()=>getComputedStyle(document.getElementById('tab-tasks')).opacity==='1');
    assert.equal(await page.locator('#tab-tasks').evaluate(el=>el.scrollWidth>el.clientWidth),false,'Tasks landing overflow '+size.width);
    assert.equal(await page.locator('#tab-tasks .quick-card').count(),3);
    assert.equal(await page.locator('#tab-tasks .task-category').count(),3);
    await page.screenshot({path:path.join(root,'ui/preview','tasks-'+size.width+'.png')});
    await page.locator('#tab-tasks').evaluate(el=>{el.scrollTop=el.scrollHeight;});
    const lastCategory=await page.locator('#tab-tasks .task-category').last().boundingBox();
    const dock=await page.locator('.bottom-nav').boundingBox();
    assert.ok(lastCategory.y+lastCategory.height<=dock.y-12,'Categories clear navigation');
    for(const [name,filter] of [['Watch Videos','video'],['Play Games','play_game'],['Complete Offers','app_task']]) {
      const categoryButton=page.locator('.task-category').filter({hasText:name});
      await categoryButton.scrollIntoViewIfNeeded();
      const categoryScroll=await page.locator('#tab-tasks').evaluate(el=>el.scrollTop);
      await categoryButton.click();
      const bounds=await page.locator('#sub-task-list').boundingBox();
      assert.equal(Math.round(bounds.y),0,'Task list opens from the top after scroll');
      assert.equal(Math.round(bounds.height),size.height,'Task list fills the app');
      assert.equal(await page.locator('#sub-task-list .filter-chip.active').getAttribute('data-filter'),filter);
      assert.equal(await page.locator('#taskList .task-card').count(),1);
      assert.equal(await page.locator('#sub-task-list').evaluate(el=>el.scrollWidth>el.clientWidth),false,'Task list overflow');
      if(size.width===390 && filter==='app_task') await page.screenshot({path:path.join(root,'ui/preview','tasks-offers-list.png')});
      await page.getByRole('button',{name:'Back to Tasks',exact:true}).click();
      assert.equal(await page.locator('#tab-tasks').evaluate(el=>el.scrollTop),categoryScroll,'Back preserves category scroll position');
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('#tab-tasks').getByRole('button',{name:'Check In',exact:true}).click();
  assert.equal(await page.locator('#dailyCheckinModal').isVisible(),true);
  await page.keyboard.press('Escape');
  await page.locator('#tab-tasks').getByRole('button',{name:'View All',exact:true}).click();
  assert.equal(await page.locator('#taskList .task-card').count(),fixtures.tasks.length+1);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#settingsLayer').isVisible(),false);

  // Settings retains only live, distinct actions and stays readable on narrow screens.
  await page.evaluate(()=>window.showTab('wallet'));
  assert.equal(await page.locator('#settings-menu-view .settings-row').count(),8);
  assert.equal(await page.locator('#sub-language').count(),0);
  assert.equal(await page.getByRole('button',{name:'Change avatar',exact:true}).count(),0);
  const settingsLinks=[['Profile & Verification','sub-verify'],['Withdraw Rewards','sub-withdraw'],['My Activity','sub-history'],['Help Center','sub-faq'],['Contact Support','sub-support'],['Privacy Information','sub-privacy'],['Terms of Service','sub-terms']];
  for(const width of [320,390,768,1280]) {
    await page.setViewportSize({width,height:844});
    await page.evaluate(()=>{window.showTab('wallet');document.getElementById('tab-wallet').scrollTop=0;});
    assert.equal(await page.locator('#settings-menu-view .settings-row').evaluateAll(rows=>rows.every(row=>row.getBoundingClientRect().height>=60 && parseFloat(getComputedStyle(row.querySelector('.settings-item-title')).fontSize)>=16)),true,'Readable settings rows at '+width);
    await page.screenshot({path:path.join(root,'ui/preview','settings-'+width+'.png')});
    for(const [title,id] of settingsLinks) {
      await page.locator('#settings-menu-view .settings-row').filter({hasText:title}).click();
      await page.waitForFunction(id=>document.getElementById(id).classList.contains('open'),id);
      const pane=page.locator('#'+id);
      await pane.evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
      const panelBounds=await pane.boundingBox();
      const shellBounds=await page.locator('.app-shell').boundingBox();
      assert.ok(Math.abs(panelBounds.y-shellBounds.y)<1 && Math.abs(panelBounds.height-shellBounds.height)<1,id+' must fill app from the top, including after menu scroll: '+JSON.stringify({panelBounds,shellBounds}));
      const detailContent=await pane.locator(':scope > .screen-content').boundingBox();
      if(detailContent) assert.ok(Math.abs(detailContent.width-panelBounds.width)<1,id+' content fills the available page');
      assert.equal(await pane.evaluate(el=>el.scrollTop),0,id+' opens at the top');
      assert.equal(await page.locator('.app-viewport').evaluate(el=>el.inert),true,'Background is inactive behind a detail page');
      assert.equal(await pane.evaluate(el=>el.contains(document.elementFromPoint(el.getBoundingClientRect().left+20,20))),true,'Detail page covers the app header');
      assert.equal(await pane.evaluate(el=>{const rect=el.getBoundingClientRect();return el.contains(document.elementFromPoint(rect.left+20,rect.bottom-20));}),true,'Detail page covers bottom navigation');
      assert.equal(await pane.evaluate(el=>el.scrollWidth>el.clientWidth),false,id+' overflow at '+width);
      if(width===390 && ['sub-verify','sub-withdraw'].includes(id)) await page.screenshot({path:path.join(root,'ui/preview','settings-'+id+'.png')});
      if(id==='sub-verify') {
        await page.getByLabel('Full Name',{exact:true}).fill('Paiso Test User');
        assert.equal(await page.getByLabel('Full Name',{exact:true}).inputValue(),'Paiso Test User');
        assert.ok(await page.getByLabel('Full Name',{exact:true}).evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));
      }
      if(id==='sub-withdraw') {
        await page.getByLabel('Amount (Coins)',{exact:true}).fill('10000');
        assert.match(await page.locator('#wReceivePreview').innerText(),/100/);
        assert.equal(await page.locator('#wMethodsGrid button').count(),2);
      }
      await pane.evaluate(el=>{el.scrollTop=el.scrollHeight;});
      await pane.getByRole('button',{name:'Back to Settings',exact:true}).click();
      await page.waitForFunction(id=>!document.getElementById(id).classList.contains('open'),id);
      assert.equal(await page.locator('.app-viewport').evaluate(el=>el.inert),false);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'View account details',exact:true}).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#settingsLayer').isVisible(),false);
  assert.equal(await page.getByRole('button',{name:'View account details',exact:true}).evaluate(el=>el===document.activeElement),true,'Back restores the opener');
  await page.evaluate(()=>{window.showTab('tasks');document.getElementById('tab-tasks').scrollTop=200;window.showTab('home');window.showTab('tasks');});
  assert.equal(await page.locator('#tab-tasks').evaluate(el=>el.scrollTop),0,'Tab navigation starts at the top');

  const homeSizes = [{width:320,height:568},{width:360,height:640},{width:390,height:844},{width:480,height:800},{width:600,height:900},{width:768,height:1024},{width:844,height:390},{width:1280,height:800},{width:1920,height:1080}];
  console.log('Checking fullscreen layouts and footer navigation');
  for (const size of homeSizes) {
    await page.setViewportSize(size);
    await page.evaluate(()=>window.showTab('home'));
    await page.waitForFunction(()=>getComputedStyle(document.getElementById('tab-home')).opacity==='1');
    const layout = await page.evaluate(()=>{
      const home=document.getElementById('tab-home');
      const header=document.querySelector('.home-header');
      const initialHeaderTop=header.getBoundingClientRect().top;
      home.scrollTop=home.scrollHeight;
      const cards=[...document.querySelectorAll('#featuredGames .featured-game')];
      const dock=document.querySelector('.bottom-nav').getBoundingClientRect();
      const shortcuts=[...document.querySelectorAll('#exploreGrid button')];
      const childRects=[...document.querySelector('.home-layout').children].map(el=>el.getBoundingClientRect());
      return {
        overflow:home.scrollWidth>home.clientWidth,
        headerScrollError:Math.abs(header.getBoundingClientRect().top-initialHeaderTop+home.scrollTop),
        lastCardBottom:Math.max(...cards.map(el=>el.getBoundingClientRect().bottom)),
        dockTop:dock.top,
        tapTargets:shortcuts.every(el=>el.clientWidth>=44&&el.clientHeight>=44),
        quickColumns:getComputedStyle(document.querySelector('.quick-grid')).gridTemplateColumns.split(' ').length,
        earnColumns:getComputedStyle(document.querySelector('.explore-grid')).gridTemplateColumns.split(' ').length,
        heroWidth:document.querySelector('.home-hero').getBoundingClientRect().width,
        overlaps:childRects.some((a,i)=>childRects.some((b,j)=>i!==j&&a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1)),
      };
    });
    assert.equal(layout.overflow,false,'Home overflow '+JSON.stringify(size));
    assert.ok(layout.headerScrollError<1,'Header scrolls with content instead of covering it '+JSON.stringify(size));
    assert.equal(layout.overlaps,false,'Home section overlap '+JSON.stringify(size));
    assert.equal(layout.tapTargets,true,'Home touch targets');
    assert.ok(layout.lastCardBottom<=layout.dockTop-12,'Last game clears dock '+JSON.stringify(size));
    assert.equal(layout.quickColumns,3,'Three quick tasks');
    assert.equal(layout.earnColumns,2,'Two earn columns');
    const shell=await page.locator('.app-shell').boundingBox();
    assert.ok(Math.abs(shell.width-size.width)<1 && Math.abs(shell.height-size.height)<1 && shell.x===0 && shell.y===0,'App fills available viewport '+JSON.stringify(size));
    const nav=await page.locator('.bottom-nav').boundingBox();
    const viewport=await page.locator('.app-viewport').boundingBox();
    assert.ok(nav.y+nav.height<=size.height-12 && nav.width<=440 && nav.x>=12,'Capsule floats above the bottom with side clearance');
    assert.ok(viewport.y+viewport.height<=nav.y+1,'Dock reserves space instead of covering content');
    const capsule=await page.locator('.bottom-nav-items').boundingBox();
    const rewardAction=await page.locator('.bottom-nav > .nav-reward').boundingBox();
    assert.ok(rewardAction.x>=capsule.x+capsule.width+7 && rewardAction.width===rewardAction.height,'Independent circular action sits right of capsule');
    assert.equal(await page.locator('.bottom-nav button').evaluateAll(buttons=>buttons.every(button=>{
      const r=button.getBoundingClientRect(); const icon=button.querySelector('.nav-icon').getBoundingClientRect();
      return r.width>=44 && r.height>=44 && icon.top>=r.top && icon.bottom<=r.bottom;
    })),true,'Navigation touch targets contain their icons');
    for(const tab of ['tasks','refer','wallet','home']) {
      await page.locator('.bottom-nav button[data-tab="'+tab+'"]').click();
      await page.locator('.bottom-nav').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(animation=>animation.finished.catch(()=>{}))));
      assert.equal(await page.locator('.bottom-nav [aria-current="page"]').getAttribute('data-tab'),tab,'Current destination '+tab);
      const activePill=await page.locator('.nav-active-pill').boundingBox();
      const activeButton=await page.locator('.bottom-nav button.active').boundingBox();
      assert.ok(Math.abs(activePill.x-activeButton.x)<1 && Math.abs(activePill.width-activeButton.width)<1,'Sliding indicator aligns with active tab '+tab);
      assert.equal(await page.locator('.bottom-nav-items').evaluate(el=>[...el.querySelectorAll('button')].every(button=>{
        const label=button.querySelector('.nav-label');
        if (!button.classList.contains('active')) return getComputedStyle(label).opacity==='0' && label.getBoundingClientRect().width===0;
        return getComputedStyle(button).color==='rgb(255, 255, 255)' && label.scrollWidth<=label.clientWidth+1;
      })),true,'Only the active label is visible, white and unclipped');
      assert.equal(await page.locator('#tab-'+tab).evaluate(el=>el.scrollWidth>el.clientWidth),false,'Responsive page overflow '+tab+' '+size.width);
      if(size.width===390) await page.locator('.bottom-nav').screenshot({path:path.join(root,'ui/preview','navigation-'+tab+'.png')});
    }
    await page.evaluate(()=>{document.getElementById('tab-home').scrollTop=0;});
    await page.waitForFunction(()=>getComputedStyle(document.getElementById('tab-home')).opacity==='1');
    if ([320,390,768,844,1280,1920].includes(size.width)) await page.screenshot({path:path.join(root,'ui/preview',`home-${size.width}.png`)});
  }
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.bottom-nav button[data-tab="wallet"]').click();
  assert.equal(await page.locator('.nav-active-pill').evaluate(el=>getComputedStyle(el).transitionDuration),'0s','Reduced-motion disables the sliding transition');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.bottom-nav button[data-tab="tasks"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.bottom-nav [aria-current="page"]').getAttribute('data-tab'),'tasks');
  await page.locator('.bottom-nav').getByRole('button',{name:'Withdraw rewards',exact:true}).click();
  assert.equal(await page.locator('#sub-withdraw').isVisible(),true,'Footer wallet opens withdrawal');
  await page.evaluate(()=>{window.closeSettingPage();window.showTab('home');});
  if(process.argv.includes('--layout-only')) {
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({passed:true,fullscreen:true,footerNavigation:true,homeSizes,taskSizes,errors},null,2));
    await browser.close();server.close();return;
  }
  console.log('Checking polling, rewards and feedback');
  await page.locator('#featuredGames button').first().focus();
  await page.evaluate(()=>{window.__featuredNode=document.querySelector('#featuredGames button');window.__homeScroll=document.getElementById('tab-home').scrollTop;});
  await page.clock.install();
  const refresh=page.waitForResponse(response=>response.url().endsWith('/api/my-withdrawals'));
  await page.clock.fastForward(8000); await refresh;
  const stableGame=await page.evaluate(()=>({node:window.__featuredNode===document.querySelector('#featuredGames button'),focus:document.activeElement===window.__featuredNode,scroll:document.getElementById('tab-home').scrollTop===window.__homeScroll}));
  assert.deepEqual(stableGame,{node:true,focus:true,scroll:true},'Background refresh preserves game button, focus and scroll');
  await page.clock.resume();
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.home-hero button').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await page.locator('#tab-home .quick-checkin button').click();
  assert.equal(await page.locator('#dailyBtn').evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#dailyCheckinModal').isVisible(),false);
  await page.getByRole('button',{name:'Spin Now',exact:true}).click();
  assert.equal(await page.locator('#sub-spin').isVisible(),true);
  assert.equal(await page.locator('#sub-bonus').isVisible(),false);
  assert.equal(Math.round((await page.locator('#sub-spin').boundingBox()).height),844);
  await page.locator('#spinClaimButton').click();
  await page.waitForFunction(()=>document.getElementById('spinRewardResult').textContent.includes('+10'));
  assert.equal(await page.locator('#spinClaimButton').isDisabled(),true);
  await page.screenshot({path:path.join(root,'ui/preview','rewards-spin.png')});
  await page.locator('#sub-spin').getByRole('button',{name:'Back',exact:true}).click();
  await page.locator('#quickBonusBtn').click();
  assert.equal(await page.locator('#sub-bonus').isVisible(),true);
  assert.equal(await page.locator('#sub-spin').isVisible(),false);
  await page.locator('#bonusCodeInput').fill('BAD');
  await page.locator('#bonusRedeemButton').click();
  await page.waitForFunction(()=>document.getElementById('bonusRewardResult').textContent==='Invalid bonus code.');
  await page.locator('#bonusCodeInput').fill('TEST-25');
  await page.locator('#bonusRedeemButton').click();
  await page.waitForFunction(()=>document.getElementById('bonusRewardResult').textContent.includes('+25'));
  await page.screenshot({path:path.join(root,'ui/preview','rewards-code.png')});
  await page.locator('#sub-bonus').getByRole('button',{name:'Back',exact:true}).click();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.bottom-nav').getByRole('button',{name:'Tasks',exact:true}).click();
  await page.locator('#tab-tasks').getByRole('button',{name:'View All',exact:true}).click();
  await page.getByRole('searchbox',{name:'Search tasks'}).fill('survey');
  assert.equal(await page.locator('#taskList .task-card').count(),1);
  await page.getByRole('searchbox',{name:'Search tasks'}).fill('');
  await page.getByRole('button',{name:'Apps',exact:true}).click();
  assert.equal(await page.locator('#taskList .task-card').count(),1);
  await page.locator('#verify-app').focus();
  await page.evaluate(()=>{window.__taskNode=document.getElementById('verify-app');});
  const taskRefresh=page.waitForResponse(response=>response.url().endsWith('/api/my-withdrawals'));
  await page.clock.fastForward(8000); await taskRefresh;
  assert.equal(await page.evaluate(()=>window.__taskNode===document.getElementById('verify-app')&&document.activeElement===window.__taskNode),true,'Polling preserves task button and focus');
  await page.locator('#verify-app').click();
  await page.waitForFunction(()=>document.getElementById('verify-app')?.textContent==='Verify');
  await page.locator('#verify-app').click();
  await page.waitForFunction(()=>!document.getElementById('verify-app'));
  assert.equal(claims.length,2,'start and verify preserve the backend flow');
  await page.getByRole('button',{name:'Done',exact:true}).click();
  assert.equal(await page.locator('#taskList .task-card').count(),1);
  await page.getByRole('button',{name:'Back to Tasks',exact:true}).click();
  await page.locator('.bottom-nav').getByRole('button',{name:'Home',exact:true}).click();
  await page.getByRole('button',{name:'Withdraw rewards',exact:true}).click();
  await page.waitForFunction(()=>getComputedStyle(document.getElementById('tab-wallet')).opacity==='1');
  assert.equal(await page.locator('#sub-withdraw').evaluate(el=>el.classList.contains('open')),true);
  await page.locator('#wMethodsGrid button').first().focus();
  await page.evaluate(()=>{window.__methodNode=document.querySelector('#wMethodsGrid button');});
  const methodRefresh=page.waitForResponse(response=>response.url().endsWith('/api/my-withdrawals'));
  await page.clock.fastForward(8000); await methodRefresh;
  assert.equal(await page.evaluate(()=>window.__methodNode===document.querySelector('#wMethodsGrid button')&&document.activeElement===window.__methodNode),true,'Polling preserves payment option and focus');
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
  await page.locator('#tab-home .quick-checkin button').click();
  assert.equal(await page.locator('#dailyBtn').evaluate(el=>el===document.activeElement),true);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#dailyBtn').click();
  await page.waitForFunction(()=>document.getElementById('feedbackMessage').textContent.includes('coins added') && document.getElementById('toast').getAttribute('aria-hidden')==='false');
  assert.equal(await page.locator('.claim-particle').count(),0,'Reduced motion skips reward particles');
  assert.equal(await page.locator('#toast').getAttribute('aria-hidden'),'false');
  assert.match(await page.locator('#feedbackMessage').innerText(),/coins added/);
  assert.equal(await page.locator('#toast').evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.left+20,r.top+20));}),true,'Success feedback is visible above the native check-in dialog');
  await page.screenshot({path:path.join(root,'ui/preview','feedback-success.png')});
  await page.getByRole('button',{name:'Dismiss notification',exact:true}).click();
  await page.getByRole('button',{name:'Close daily check-in',exact:true}).click();
  await page.emulateMedia({reducedMotion:'no-preference'});
  assert.equal(await page.locator('#quickBonusBtn').isDisabled(),false);
  assert.equal(await page.locator('#tasksBonusBtn').isDisabled(),false,'Bonus codes are separate from daily check-in');
  await page.evaluate(()=>window.claimDaily());
  assert.equal(dailyRequests,1,'Check-in and daily bonus share one reward');
  await page.locator('#featuredGames button').first().click();
  await page.locator('#gameModal').waitFor({state:'visible'});
  assert.equal(await page.locator('#gameModal').evaluate(el=>getComputedStyle(el).visibility),'visible');
  await page.getByRole('button',{name:'Close game',exact:true}).click();
  assert.equal(await page.locator('#gameModal').isVisible(),false);
  await page.evaluate(()=>window.showTab('refer'));
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.getByRole('button',{name:'Copy',exact:true}).click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),fixtures.refLink);
  // Clipboard data can be available before its asynchronous feedback callback runs.
  await page.waitForFunction(()=>document.getElementById('feedbackMessage').textContent==='Referral link copied.' && document.getElementById('toast').getAttribute('aria-hidden')==='false');
  await page.locator('#toast').evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
  await page.getByRole('button',{name:'Dismiss notification',exact:true}).click();
  await page.evaluate(()=>{window.__clipboardWrite=navigator.clipboard.writeText; navigator.clipboard.writeText=()=>Promise.reject(new Error('Test clipboard failure'));});
  await page.getByRole('button',{name:'Copy',exact:true}).click();
  await page.waitForFunction(()=>document.getElementById('toast').classList.contains('error'));
  assert.equal(await page.locator('#toast').getAttribute('aria-live'),'assertive');
  await page.screenshot({path:path.join(root,'ui/preview','feedback-error.png')});
  await page.getByRole('button',{name:'Dismiss notification',exact:true}).focus();
  await page.clock.fastForward(8000);
  assert.equal(await page.locator('#toast').getAttribute('aria-hidden'),'false','Feedback stays while keyboard focus is inside');
  await page.getByRole('button',{name:'Copy',exact:true}).focus();
  await page.clock.fastForward(7000);
  assert.equal(await page.locator('#toast').getAttribute('aria-hidden'),'true','Feedback dismisses after focus leaves');
  await page.evaluate(()=>{navigator.clipboard.writeText=window.__clipboardWrite;});
  await page.evaluate(()=>window.showTab('wallet'));
  await page.getByRole('button',{name:'Notifications',exact:true}).click();
  await page.locator('#notifModal').waitFor({state:'visible'});
  assert.equal(await page.locator('#notifModal').evaluate(el=>getComputedStyle(el).position),'fixed');
  await page.locator('#notifModal > div').evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
  assert.equal(await page.locator('.app-viewport').evaluate(el=>el.inert),true,'Notification dialog blocks background actions');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#notifModal').evaluate(el=>el.contains(document.activeElement)),true,'Notification focus stays in the dialog');
  await page.screenshot({path:path.join(root,'ui/preview','notifications.png')});
  assert.deepEqual(errors,[]);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button',{name:'Notifications',exact:true}).evaluate(el=>el===document.activeElement),true,'Closing notifications restores focus');
  // Mock the rewarded-video SDK: processing feedback precedes server confirmation.
  fixtures.ads.blockId='test-video';
  await context.route('https://sad.adsgram.ai/js/sad.min.js',route=>route.fulfill({contentType:'application/javascript',body:'window.Adsgram={init:()=>({show:async()=>({done:true})})};'}));
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#adBtn').click();
  await page.waitForFunction(()=>document.getElementById('toast').classList.contains('info'));
  // Keep feedback present while the fixture confirms the reward asynchronously.
  await page.getByRole('button',{name:'Dismiss notification',exact:true}).focus();
  assert.match(await page.locator('#feedbackMessage').innerText(),/Confirming your reward/);
  await page.locator('#toast').evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
  await page.screenshot({path:path.join(root,'ui/preview','feedback-info.png')});
  fixtures.ads.watchedToday=1;
  await page.clock.fastForward(3000);
  await page.waitForFunction(()=>document.getElementById('toast').classList.contains('success'));
  assert.match(await page.locator('#feedbackMessage').innerText(),/Video reward received/);
  await page.getByRole('button',{name:'Dismiss notification',exact:true}).click();
  fixtures.ads.blockId='';
  const savedGames=fixtures.games;
  fixtures.games=fixtures.games.map(g=>({...g,title:'A very long game title that should wrap without breaking the layout',priceCoins:12500}));
  await page.reload({waitUntil:'networkidle'});
  await page.setViewportSize({width:320,height:568});
  assert.equal(await page.locator('#tab-home').evaluate(el=>el.scrollWidth>el.clientWidth),false,'Long titles do not overflow');
  assert.match(await page.locator('#featuredGames .game-price').first().innerText(),/12,500 coins/);
  fixtures.games=[];
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#featuredGames .games-empty-link').waitFor();
  assert.equal(await page.locator('#featuredGames').getAttribute('aria-busy'),'false');
  fixtures.games=savedGames;
  await context.route('**/api/me',route=>route.abort());
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.getElementById('featuredGames').getAttribute('aria-busy')==='false');
  assert.match(await page.locator('#featuredGames').innerText(),/check your connection/i);
  await page.evaluate(()=>window.showTab('games'));
  await page.getByRole('button',{name:'Try again',exact:true}).waitFor({state:'visible'});
  assert.match(await page.locator('#gamesGrid').innerText(),/Unable to load games/);
  await context.unroute('**/api/me');
  await page.getByRole('button',{name:'Try again',exact:true}).click();
  await page.locator('#gamesGrid .game-card').first().waitFor();
  assert.equal(await page.locator('#gamesGrid .game-card').count(),4,'Retry restores games after a connection failure');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:true,homeOnlyHeader:true,personalizedGreeting:true,headerNotifications:true,feedbackStates:true,feedbackAboveDialog:true,stableTaskAndPaymentPolling:true,taskLanding:true,taskCategoryNavigation:true,settingsEssentialActions:8,settingsSubpages:true,screens:7,homeSizes,taskStartAndVerify:true,search:true,filters:true,withdrawal:true,homeGameLaunch:true,dailyCheckin:true,copyReferral:true,notifications:true,stablePolling:true,emptyAndOffline:true,reducedMotion:true,brokenImages,errors},null,2));
  await browser.close();server.close();
}
run().catch(e=>{console.error(e);process.exit(1)});
