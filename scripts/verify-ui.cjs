const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const { chromium } = require(process.env.PAISO_PLAYWRIGHT || 'playwright');
const express = require('express');
const app = express();
app.use(express.static(path.join(root,'public')));
const fixtures = {
  user:{id:'12345',first_name:'Aarav',username:'paiso_user',coins:12500,totalEarned:12500,referrals:125,lastDaily:'',dailyStreak:3},
  tasks:[
    {id:'app',title:'Install & Open App',description:'Install new app and open',type:'app_task',reward:200,waitSeconds:1},
    {id:'game',title:'Play Gaming App',description:'Play and reach level 5',type:'play_game',reward:500,waitSeconds:30},
    {id:'survey',title:'Complete Survey',description:'Share your opinion',type:'social_visit',reward:300,waitSeconds:15},
    {id:'web',title:'Visit Website',description:'Visit and stay for 30 seconds',type:'social_visit',reward:80,waitSeconds:30},
    {id:'channel',title:'Join Channel',description:'Join and stay',type:'telegram_join',reward:100},
    {id:'quiz',title:'Daily Quiz',description:'Answer 5 questions',type:'social_visit',reward:50,waitSeconds:15},
  ].map(t=>({...t,url:'https://example.com',target:'',icon:''})),
  games:[{id:'fruit',title:'Fruit Master'},{id:'racer',title:'Car Racing'},{id:'puzzle',title:'Puzzle Match'},{id:'bubble',title:'Bubble Pop'}].map(g=>({...g,description:'Play for fun',priceCoins:0,enabled:true,plays:0,coinsCollected:0})),
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


  // Reference Tasks landing and real category lists.
  const taskSizes=[{width:320,height:568},{width:390,height:844},{width:768,height:1024},{width:844,height:390}];
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
  const settingsLinks=[['Profile & Verification','sub-verify'],['Withdraw Rewards','sub-withdraw'],['Withdrawal History','sub-history'],['Help Center','sub-faq'],['Contact Support','sub-support'],['Privacy Information','sub-privacy'],['Terms of Service','sub-terms']];
  for(const width of [320,390,768]) {
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
        quickColumns:getComputedStyle(document.querySelector('.quick-grid')).gridTemplateColumns.split(' ').length,
        earnColumns:getComputedStyle(document.querySelector('.explore-grid')).gridTemplateColumns.split(' ').length,
        heroWidth:document.querySelector('.home-hero').getBoundingClientRect().width,
        overlaps:childRects.some((a,i)=>childRects.some((b,j)=>i!==j&&a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1)),
      };
    });
    assert.equal(layout.overflow,false,'Home overflow '+JSON.stringify(size));
    assert.equal(layout.overlaps,false,'Home section overlap '+JSON.stringify(size));
    assert.equal(layout.tapTargets,true,'Home touch targets');
    assert.ok(layout.lastCardBottom<=layout.dockTop-12,'Last game clears dock '+JSON.stringify(size));
    assert.equal(layout.quickColumns,3,'Three quick tasks');
    assert.equal(layout.earnColumns,2,'Two earn columns');
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
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#dailyCheckinModal').isVisible(),false);
  await page.getByRole('button',{name:'Spin Now',exact:true}).click();
  assert.match(await page.locator('#toast').innerText(),/isn't available yet/);
  assert.equal(await page.locator('#toast').getAttribute('aria-live'),'polite');
  assert.equal(await page.locator('#toast').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await page.screenshot({path:path.join(root,'ui/preview','feedback-warning.png')});
  await page.getByRole('button',{name:'Dismiss notification',exact:true}).click();
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
  await page.getByRole('button',{name:'Claim daily reward',exact:true}).click();
  assert.equal(await page.locator('#dailyBtn').evaluate(el=>el===document.activeElement),true);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#dailyBtn').click();
  await page.waitForFunction(()=>document.getElementById('dailyBtn').disabled);
  await page.waitForFunction(()=>document.getElementById('quickBonusText').textContent==='Claimed');
  assert.equal(await page.locator('.claim-particle').count(),0,'Reduced motion skips reward particles');
  assert.equal(await page.locator('#toast').getAttribute('aria-hidden'),'false');
  assert.match(await page.locator('#feedbackMessage').innerText(),/coins added/);
  assert.equal(await page.locator('#toast').evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.left+20,r.top+20));}),true,'Success feedback is visible above the native check-in dialog');
  await page.screenshot({path:path.join(root,'ui/preview','feedback-success.png')});
  await page.getByRole('button',{name:'Dismiss notification',exact:true}).click();
  await page.getByRole('button',{name:'Close daily check-in',exact:true}).click();
  await page.emulateMedia({reducedMotion:'no-preference'});
  assert.equal(await page.locator('#quickBonusBtn').isDisabled(),true);
  assert.equal(await page.locator('#tasksBonusBtn').isDisabled(),true,'Both screens share the claimed daily bonus state');
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
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:true,homeOnlyHeader:true,personalizedGreeting:true,headerNotifications:true,feedbackStates:true,feedbackAboveDialog:true,stableTaskAndPaymentPolling:true,taskLanding:true,taskCategoryNavigation:true,settingsEssentialActions:8,settingsSubpages:true,screens:7,homeSizes,taskStartAndVerify:true,search:true,filters:true,withdrawal:true,homeGameLaunch:true,dailyCheckin:true,copyReferral:true,notifications:true,stablePolling:true,emptyAndOffline:true,reducedMotion:true,brokenImages,errors},null,2));
  await browser.close();server.close();
}
run().catch(e=>{console.error(e);process.exit(1)});
