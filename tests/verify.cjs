const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const server=require('node:http').createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(require('node:fs').readFileSync(path.resolve(__dirname,'../index.html')))});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));server.unref();
 const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:1100}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
 await page.goto(url);
 const result=await page.evaluate(()=>{
  let checks=0;const check=(ok,msg)=>{if(!ok)throw Error(msg);checks++};
  for(const difficulty of Object.keys(configs)){
   mode=difficulty;
   for(let n=0;n<300;n++){
    level=1+n%3;
    generate();const queue=[[1,1]],visited=new Set(['1,1']);
    for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let nx=x+dx,ny=y+dy,id=nx+','+ny;if(grid[ny]?.[nx]===0&&!visited.has(id)){visited.add(id);queue.push([nx,ny])}}}
    check(visited.size===grid.flat().filter(x=>x===0).length,'all floors reachable');
    check(visited.has(gate.x+','+gate.y),'gate reachable');
    check(items.size<=14+configs[mode].traps&&items.size>=14+shortcuts.length,'unique items and spike budget');
    check(shortcuts.length>0,'at least one shortcut');
    for(const id of shortcuts){const[x,y]=id.split(',').map(Number);check(items.get(id)==='trap','shortcut has spike');
     grid[y][x]=1;const horizontal=x%2===0,a=horizontal?[x-1,y]:[x,y-1],b=horizontal?[x+1,y]:[x,y+1];
     const blocked=[];for(const[tid,type]of items)if(type==='trap'&&tid!==id){const[tx,ty]=tid.split(',').map(Number);blocked.push([tx,ty]);grid[ty][tx]=1}
     check(routeBetween(a,b).length>=12,'longer spike-free detour');
     for(const[tx,ty]of blocked)grid[ty][tx]=0;grid[y][x]=0;
    }
    check([...items.values()].filter(x=>x==='coin').length===12,'12 coins');
    check([...items.values()].filter(x=>x==='key').length===1,'one key');
    const relics=[...items].filter(x=>x[1]==='relic');check(relics.length===1,'one relic');
    const keyCell=[...items].find(x=>x[1]==='key')[0].split(',').map(Number),rid=relics[0][0],ds=distancesFrom([1,1]),dk=distancesFrom(keyCell),dg=distancesFrom([gate.x,gate.y]);
    check(Math.min(ds.get(rid)+dk.get(rid)+dk.get(gate.x+','+gate.y),ds.get(keyCell.join(','))+dk.get(rid)+dg.get(rid))>ds.get(keyCell.join(','))+dk.get(gate.x+','+gate.y),'relic requires a detour');
    for(const id of items.keys())check(visited.has(id)&&id!=='1,1'&&id!==gate.x+','+gate.y,'valid item placement');
   }
  }
  start();check(radius()===configs[mode].radius*1.15,'intro wider light');level=3;check(radius()===configs[mode].radius*.85,'final narrower light');start();const initial=coins;
  function tick(dt){frame(last+dt*1000)}
  for(let i=0;i<11;i++)tick(.1);check(coins===initial-1,'lit burn');
  const fraction=burn;toggle();for(let i=0;i<20;i++)tick(.1);check(coins===initial-1&&burn===fraction,'dark preserves burn');
  pause();for(let i=0;i<20;i++)tick(.1);check(burn===fraction,'pause freezes');pause();toggle();
  function enter(id){const[x,y]=id.split(',').map(Number);for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(grid[y-dy]?.[x-dx]===0){player={x:x-dx,y:y-dy};cooldown=0;move(dx,dy);return}throw Error('no neighbor')}
  let id=[...items].find(x=>x[1]==='coin')[0],before=coins;enter(id);check(coins===before+8&&!items.has(id),'coin once');check(feedback.text==='+8 coins','pickup feedback');enter(id);check(coins===before+8,'no repeated pickup');
  id=[...items].find(x=>x[1]==='trap')[0];before=coins;enter(id);enter(id);check(coins===before-10,'spikes on reentry');
  enter(gate.x+','+gate.y);check(level===1,'locked gate');
  id=[...items].find(x=>x[1]==='key')[0];enter(id);check(key&&!items.has(id),'key pickup');
  before=coins;burn=.67;enter(gate.x+','+gate.y);check(level===2&&coins===before+10&&!key&&lit&&burn===.67,'chamber transition');
  key=true;enter(gate.x+','+gate.y);key=true;enter(gate.x+','+gate.y);check(state==='won'&&cleared===3&&best()===coins+60,'victory score');
  start();coins=5;enter([...items].find(x=>x[1]==='trap')[0]);check(state==='lost'&&coins===0,'spike defeat');
  start();coins=1;burn=.95;tick(.1);check(state==='lost','burn defeat');
  start();player={x:1,y:1};cooldown=0;move(-1,0);check(player.x===1,'wall blocks');
  coins=8;hud();check(!$('#warning').hidden,'low coins warning');pause();check($('#warning').hidden,'warning hidden while paused');pause();coins=20;hud();check($('#warning').hidden,'warning clears');
  start();const initialPurse=coins;
  enter([...items].find(x=>x[1]==='relic')[0]);check(carryingRelic&&coins===initialPurse&&bankedRelics===0,'pickup not spendable or banked');
  enter(gate.x+','+gate.y);check(carryingRelic&&bankedRelics===0&&level===1,'locked gate cannot bank');
  key=true;enter(gate.x+','+gate.y);check(bankedRelics===1&&!carryingRelic&&score()===coins+20+25,'relic banked once');
  check(recapChambers.length===1&&recapChambers[0].secured,'completed map saved');
  enter([...items].find(x=>x[1]==='relic')[0]);coins=3;enter([...items].find(x=>x[1]==='trap')[0]);
  check(state==='lost'&&score()===45&&bankedRelics===1,'unbanked relic lost, secured bonus retained');
  check(totals.damage===3,'actual damage clamped to purse');
  check(recapChambers.length===2&&!$('#recap').hidden&&$('#recap-map-select').options.length===2,'loss recap includes all visited chambers');
  check($('#recap-score').textContent.includes('was lost'),'loss explained');
  const previousMap=JSON.stringify(recapChambers[0]);grid[1][1]=1;check(JSON.stringify(recapChambers[0])===previousMap,'immutable recap map');
  finish(false);check(recapChambers.length===2,'finish idempotent');
  start();check(!carryingRelic&&bankedRelics===0&&recapChambers.length===0&&totals.steps===0&&$('#recap').hidden,'new run clears recap and metrics');
  for(let i=0;i<3;i++){enter([...items].find(x=>x[1]==='relic')[0]);key=true;enter(gate.x+','+gate.y)}
  check(state==='won'&&bankedRelics===3&&score()===coins+60+75&&recapChambers.length===3,'three relic victory');
  check(!carryingRelic&&!$('#recap-score').textContent.includes('was lost'),'victory never loses secured relic');
  start();for(let i=0;i<11;i++)tick(.1);check(totals.light===1,'light spending counter');
  pause();for(let i=0;i<20;i++)tick(.1);check(totals.light===1,'pause excludes spending');pause();toggle();for(let i=0;i<20;i++)tick(.1);check(totals.light===1,'dark excludes spending');
  const beforeSteps=totals.steps;cooldown=0;player={x:1,y:1};move(-1,0);check(totals.steps===beforeSteps,'wall attempt not a step');
  enter([...items].find(x=>x[1]==='coin')[0]);check(totals.pickups===8&&totals.steps===beforeSteps+1,'pickup and steps counted');
  const standardBest=best();mode='explorer';saveBest(999);check(best()===999,'explorer best');mode='standard';check(best()===standardBest,'separate best');
  const original=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('blocked')};saveBest(2000);Storage.prototype.setItem=original;
  return checks;
 });
 await page.close();
 const live=await browser.newPage({viewport:{width:1280,height:1100}});live.on('pageerror',e=>errors.push(e.message));
 await live.goto(url);
 await live.screenshot({path:path.resolve(__dirname,'../preview.png')});
 await live.selectOption('#difficulty','explorer');await live.click('#start');
 assert.equal(await live.locator('#coins').textContent(),'36');
 await live.keyboard.press('Space');assert.equal(await live.locator('#lamp').textContent(),'OFF');
 await live.keyboard.press('p');assert.equal(await live.evaluate(()=>state),'paused');
 await live.keyboard.press('p');assert.equal(await live.evaluate(()=>state),'playing');
 await live.click('#toggle');await live.keyboard.press('Space');assert.equal(await live.locator('#lamp').textContent(),'OFF');
 await live.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await live.evaluate(()=>state),'paused');
 await live.click('#start');
 // Most recent direction takes precedence; releasing restores the previous held direction.
 await live.keyboard.down('ArrowRight');await live.keyboard.down('ArrowDown');
 assert.deepEqual(await live.evaluate(()=>[...held]),['ArrowRight','ArrowDown']);await live.keyboard.up('ArrowDown');await live.keyboard.up('ArrowRight');
 await live.screenshot({path:path.resolve(__dirname,'../gameplay.png')});
 await live.setViewportSize({width:390,height:844});await live.click('#pause');
 assert.equal(await live.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.equal(await live.evaluate(()=>canvas.width),440);
 const padBounds=await live.locator('.pad').boundingBox();assert.ok(padBounds.y>=0&&padBounds.y+padBounds.height<=844,'mobile controls visible');
 await live.screenshot({path:path.resolve(__dirname,'../mobile-preview.png')});
 await live.click('#start');
 const setup=()=>{start();lit=false;const dir=grid[1][2]===0?[1,0]:[0,1];return dir};
 let dir=await live.evaluate(setup);await live.locator(`[data-dir="${dir}"]`).click();
 assert.deepEqual(await live.evaluate(()=>player),{x:1+dir[0],y:1+dir[1]});
 // Actual touch-emulated swipe through browser mouse pointer events.
 dir=await live.evaluate(setup);const box=await live.locator('#game').boundingBox();
 await live.mouse.move(box.x+100,box.y+100);await live.mouse.down();await live.mouse.move(box.x+100+dir[0]*25,box.y+100+dir[1]*25);await live.mouse.up();
 assert.deepEqual(await live.evaluate(()=>player),{x:1+dir[0],y:1+dir[1]});
 await live.evaluate(()=>{
   start();lit=false;
   for(const kind of ['relic','key']){
    const id=[...items].find(x=>x[1]===kind)?.[0];if(!id||state!=='playing')break;
    const route=routeBetween([player.x,player.y],id.split(',').map(Number));
    for(const cell of route){const[x,y]=cell.split(',').map(Number);cooldown=0;move(x-player.x,y-player.y);if(state!=='playing')break}
   }
   if(state==='playing'){pause();pause();coins=0;finish(false)}
  });
 await live.click('#recap-button');assert.equal(await live.locator('#recap-title').evaluate(e=>e===document.activeElement),true);
 assert.equal(await live.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await live.screenshot({path:path.resolve(__dirname,'../recap-mobile.png')});
 await live.setViewportSize({width:1280,height:1100});await live.screenshot({path:path.resolve(__dirname,'../recap-desktop.png')});
 await live.click('#new');assert.equal(await live.locator('#recap').isVisible(),false);
 assert.deepEqual(errors,[]);await browser.close();console.log(`PASS: ${result} mechanics assertions across 900 mazes; desktop/mobile controls, focus, swipe, layouts; no browser errors.`);
})().catch(e=>{console.error(e);process.exit(1)});

