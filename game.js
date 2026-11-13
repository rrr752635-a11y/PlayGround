'use strict';
(()=>{
const $=s=>document.querySelector(s), canvas=$('#scene');
if(!window.THREE){$('#startBtn').textContent='GAGAL MEMUAT 3D';$('#startBtn').disabled=true;return}
const T=THREE, scene=new T.Scene();scene.background=new T.Color(0x89918a);scene.fog=new T.FogExp2(0x89918a,.012);
const camera=new T.PerspectiveCamera(73,innerWidth/innerHeight,.1,180);camera.position.set(0,1.72,10);scene.add(camera);
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
scene.add(new T.HemisphereLight(0xdce5df,0x514537,2.1));const sun=new T.DirectionalLight(0xffdfae,3.2);sun.position.set(-28,42,-20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-38;sun.shadow.camera.right=38;sun.shadow.camera.top=40;sun.shadow.camera.bottom=-40;sun.shadow.bias=-.00025;scene.add(sun);
const mat=(color,rough=.85,metal=0)=>new T.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const mats={sand:mat(0x948267),sand2:mat(0x75684f),olive:mat(0x4d5544),darkOlive:mat(0x343b32),cloth:mat(0x71694f),khaki:mat(0x938265),skin:mat(0xb39472),metal:mat(0x343a35,.62,.48),rust:mat(0x684d3c),wood:mat(0x594d38),black:mat(0x202522,.55,.3),enemy:mat(0x5b5949),enemyDark:mat(0x34372f),glow:new T.MeshBasicMaterial({color:0xffa43a}),white:new T.MeshBasicMaterial({color:0xffe6aa})};
const geo={box:new T.BoxGeometry(1,1,1),sphere:new T.SphereGeometry(1,12,8),cyl:new T.CylinderGeometry(1,1,1,10),cone:new T.ConeGeometry(1,1,8)};
function mesh(g,m,parent,x=0,y=0,z=0,sx=1,sy=1,sz=1){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(parent,m,x,y,z,sx,sy,sz){return mesh(geo.box,m,parent,x,y,z,sx,sy,sz)}
// Dawn battlefield ground and distant horizon
const ground=mesh(new T.PlaneGeometry(200,190),mats.sand,scene,0,-.18,-55);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
const seaMat=mat(0x4c6768,.42);box(scene,seaMat,0,-.25,36,200,.25,28);
const water=new T.Mesh(new T.PlaneGeometry(200,28,40,8),new T.MeshStandardMaterial({color:0x567475,roughness:.36,metalness:.1,wireframe:false}));water.rotation.x=-Math.PI/2;water.position.set(0,-.08,36);scene.add(water);
const hillMat=mat(0x626e5e);for(let i=0;i<8;i++){const hill=mesh(geo.sphere,hillMat,scene,-52+i*15,1,-101-(i%3)*7,13,9+(i%3)*3,5);hill.castShadow=false}
// Weathered concrete bunker with firing slit
const bunker=new T.Group();scene.add(bunker);bunker.position.set(0,0,-46);box(bunker,mat(0x5a5a4c),0,1.35,0,10,2.7,4);box(bunker,mat(0x474a40),0,2.82,0,10.8,.35,4.7);box(bunker,mat(0x1d2422),0,1.8,2.02,3,.34,.06);box(bunker,mat(0x292f2c),-3.8,1.75,2.05,.13,.8,.08);box(bunker,mat(0x292f2c),3.8,1.75,2.05,.13,.8,.08);
// Protective sandbags around bunker
function sandbag(x,y,z,rot=0){const b=mesh(geo.box,mat(0x887b5d),scene,x,y,z,1.35,.42,.66);b.rotation.y=rot;const seam=mesh(geo.box,mat(0x655b46),scene,x,y+.08,z,1.16,.025,.02);seam.rotation.y=rot}
for(let i=0;i<11;i++){let x=-8+i*1.6;sandbag(x,.24,-37+(i>5?1.1:0),i%2?.04:0);if(i<5)sandbag(-8+i*1.6,.67,-37,.02)}
// Procedural battlefield clutter: crates, fuel drums, barbed-wire hedgehogs, broken stakes
const props=[];
function crate(x,z,size=1){const g=new T.Group();scene.add(g);g.position.set(x,0,z);box(g,mats.wood,0,.52*size,0,.95*size,1.04*size,.9*size);for(let s of [-1,1]){const plank=box(g,mat(0x756044),s*.25*size,.53*size,.46*size,.08*size,.96*size,.04);plank.rotation.z=s*.08}box(g,mat(0x342f25),0,.53*size,.48*size,.045*size,.95*size,.025);props.push(g)}
function barrel(x,z){const g=new T.Group();scene.add(g);g.position.set(x,0,z);mesh(geo.cyl,mat(0x4c5349,.55,.42),g,0,.65,0,.47,1.3,.47);for(let y of [.3,1])mesh(new T.TorusGeometry(.44,.035,6,16),mats.metal,g,0,y,0);props.push(g)}
function hedge(x,z,rot=0){const g=new T.Group();scene.add(g);g.position.set(x,.85,z);g.rotation.y=rot;for(let a of [-.65,.65]){const beam=box(g,mat(0x3c4139,.8,.38),a,0,0,.18,2.5,.18);beam.rotation.z=a*.55}box(g,mat(0x3c4139,.8,.4),0,0,0,2.3,.18,.18);props.push(g)}
for(let i=0;i<14;i++){const x=((i*17)%47)-23,z=-8-(i*13)%57;if(i%3===0)crate(x,z,.75+(i%2)*.3);else if(i%3===1)barrel(x,z);else hedge(x,z,(i%4)*.35)}
// Rubble, crater lips, timber stakes, scattered debris
for(let i=0;i<36;i++){const x=((i*29)%61)-30,z=-5-(i*19)%72;const rock=mesh(geo.sphere,mat(i%2?0x665d4b:0x82745b),scene,x,.08,z,.35+(i%3)*.16,.13+(i%4)*.05,.27);rock.rotation.y=i*1.7;rock.castShadow=false}
for(let i=0;i<9;i++){const x=-24+i*6;const post=box(scene,mats.wood,x,.7,-19-(i%2)*5,.16,1.4,.16);post.rotation.z=(i%2?.18:-.14)}
// Smoke plumes as animated translucent particle clouds
const smokes=[];const smokeMat=new T.MeshStandardMaterial({color:0x4b504a,transparent:true,opacity:.22,roughness:1,depthWrite:false});
for(let i=0;i<8;i++){const group=new T.Group();group.position.set(-25+i*7,0,-20-(i%4)*18);scene.add(group);for(let j=0;j<12;j++){const puff=new T.Mesh(geo.sphere,smokeMat);puff.position.set(Math.sin(j*12.7)*1.4,j*1.15,Math.cos(j*8.3)*1.2);const size=.7+(j%4)*.28;puff.scale.set(size,size*1.2,size);group.add(puff)}smokes.push({group,phase:i*1.5})}
// Enemy riflemen are fully articulated low-poly NPCs with patrol, pursuit, firing and hit reactions.
const enemies=[], enemyMat=mat(0x575746), enemyCloth=mat(0x67634f), enemySkin=mat(0xa78868), enemyMetal=mat(0x282e2a,.56,.45);
function makeEnemy(x,z,heavy=false){
 const root=new T.Group();root.position.set(x,0,z);scene.add(root);const body=new T.Group();root.add(body);
 const torso=mesh(geo.box,heavy?mats.darkOlive:enemyMat,body,0,1.08,0,.62,.78,.36);torso.material=torso.material.clone();
 box(body,enemyCloth,0,1.38,0,.66,.13,.39);mesh(geo.sphere,enemySkin,body,0,1.72,.02,.22,.24,.22);
 const helmet=mesh(geo.sphere,mats.darkOlive,body,0,1.91,0,.31,.16,.3);box(body,mats.darkOlive,0,1.83,.18,.48,.055,.32);
 box(body,mats.wood,-.23,1.04,.23,.15,.39,.12);box(body,mats.wood,.23,1.04,.23,.15,.39,.12);
 const legs=[];for(const side of [-1,1]){const pivot=new T.Group();pivot.position.set(side*.18,.76,0);body.add(pivot);mesh(geo.cyl,mats.darkOlive,pivot,0,-.25,0,.105,.55,.105);box(pivot,mats.black,0,-.55,.045,.24,.14,.38);legs.push(pivot)}
 const arms=[];for(const side of [-1,1]){const p=new T.Group();p.position.set(side*.37,1.34,.02);body.add(p);mesh(geo.cyl,enemyCloth,p,0,-.22,.04,.11,.48,.12);mesh(geo.sphere,enemySkin,p,0,-.43,.2,.1,.095,.1);arms.push(p)}
 const rifle=new T.Group();body.add(rifle);box(rifle,mats.wood,0,1.2,.43,.12,.13,.7);box(rifle,enemyMetal,0,1.22,.76,.065,.065,.68);box(rifle,mats.wood,-.035,1.04,.34,.1,.24,.18);box(rifle,enemyMetal,0,1.12,.52,.035,.16,.18);rifle.rotation.x=-.04;
 arms[0].rotation.x=-.9;arms[1].rotation.x=-.66;
 const bar=new T.Group();bar.position.set(0,2.25,0);body.add(bar);box(bar,new T.MeshBasicMaterial({color:0x261d17}),0,0,0,.75,.07,.07);box(bar,new T.MeshBasicMaterial({color:0x72a75f}),0,0,.045,.72,.045,.025);
 const enemy={root,body,legs,arms,bar,hp:heavy?140:100,maxHp:heavy?140:100,heavy,fire:1+Math.random()*2,phase:Math.random()*6,alive:true,speed:heavy?1.15:1.55,hit:0};enemies.push(enemy);return enemy
}
function spawnEnemy(){const side=Math.random()<.5?-1:1;const x=side*(8+Math.random()*14),z=-15-Math.random()*42;makeEnemy(x,z,Math.random()<.22)}
// First-person Garand and alternate WWII weapons sit directly on the camera.
const viewWeapon=new T.Group();camera.add(viewWeapon);viewWeapon.position.set(.36,-.31,-.62);
function buildWeapon(type=0){while(viewWeapon.children.length)viewWeapon.remove(viewWeapon.children[0]);const base=type===1?mats.darkOlive:type===2?mats.wood:mats.wood;
 box(viewWeapon,base,0,0,0,.16,.16,.67);box(viewWeapon,mats.metal,0,.012,-.42,.075,.075,.68);box(viewWeapon,base,0,-.14,.11,.13,.26,.18);box(viewWeapon,mats.black,0,.082,-.08,.04,.035,.18);box(viewWeapon,base,-.01,-.17,-.18,.1,.3,.11);
 // Sleeve and gloved support hand add depth to the first-person view model.
 const sleeve=mesh(geo.cyl,mats.olive,viewWeapon,-.17,-.17,.23,.15,.45,.15);sleeve.rotation.z=-.42;mesh(geo.sphere,mats.skin,viewWeapon,-.08,-.13,-.02,.105,.07,.13);
 const flash=new T.Group();flash.position.set(0,.01,-.82);flash.visible=false;viewWeapon.add(flash);const flare=mesh(geo.cone,mats.glow,flash,0,0,-.11,.095,.32,.095);flare.rotation.x=Math.PI/2;const lamp=new T.PointLight(0xffa33b,0,4);lamp.position.set(0,.01,-.77);viewWeapon.add(lamp);viewWeapon.userData={flash,lamp};}
buildWeapon();
const player={pos:new T.Vector3(0,1.72,10),yaw:0,pitch:-.025,health:100};camera.position.copy(player.pos);
let state='title',paused=false,elapsed=0,kills=0,ammo=8,reserve=64,reload=0,cooldown=0,damageTimer=0,spawnTimer=1.5,shake=0,hitTimer=0,toastTimer=0,moveBob=0,weaponType=0,fireHeld=false,walkSway=0;
const weapons=[{name:'M1 GARAND',mag:8,reserve:64,rate:.34,damage:55},{name:'THOMPSON',mag:30,reserve:120,rate:.105,damage:27},{name:'M1918 BAR',mag:20,reserve:80,rate:.15,damage:38}];
const keys={};const raycaster=new T.Raycaster();raycaster.far=95;const center=new T.Vector2(0,0);
const effects=[];let tracerTimer=0,flashTimer=0;
function makeTracer(from,to,color=0xffd787){const points=[from.clone(),to.clone()];const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color,transparent:true,opacity:.88}));scene.add(line);effects.push({object:line,life:.09,max:.09,type:'line'})}
function burst(pos,color=0xd9b363,count=9){for(let i=0;i<count;i++){const p=mesh(geo.sphere,new T.MeshBasicMaterial({color,transparent:true}),scene,pos.x,pos.y,pos.z,.035,.035,.035);p.userData.vel=new T.Vector3((Math.random()-.5)*3,Math.random()*3,(Math.random()-.5)*3);effects.push({object:p,life:.3+Math.random()*.42,max:.72,type:'particle'})}}
function explosion(pos){const glow=new T.PointLight(0xff9b3d,7,9);glow.position.copy(pos);scene.add(glow);effects.push({object:glow,life:.24,max:.24,type:'light'});burst(pos,0xe7a94b,20);burst(pos,0x514b3c,12)}
function showToast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');toastTimer=2}
function updateHUD(){
 $('#healthFill').style.width=player.health+'%';$('#killsText').textContent=String(kills).padStart(2,'0')+' / 12';
 $('#progressFill').style.width=(kills/12*100)+'%';$('#ammoText').textContent=`${String(ammo).padStart(2,'0')} / ${reserve}  •  ${reload>0?'ISI ULANG…':'SIAP'}`;
 $('.weapon').textContent=weapons[weaponType].name;$('#objectiveText').textContent=kills>=9?'Hancurkan sisa pertahanan musuh':'Lumpuhkan pertahanan pantai ('+Math.min(kills,12)+' / 12)';
}
function showHit(){const el=$('#hitmarker'),cross=$('#crosshair');el.classList.add('show');cross.classList.add('hit');hitTimer=.16}
function fire(){if(state!=='play'||paused||cooldown>0||reload>0)return;if(ammo<=0){reloadWeapon();return}ammo--;cooldown=weapons[weaponType].rate;shake=.035;flashTimer=.075;viewWeapon.userData.flash.visible=true;viewWeapon.userData.lamp.intensity=8;
 const origin=camera.position.clone();raycaster.setFromCamera(center,camera);const targets=[];for(const e of enemies)if(e.alive)e.root.traverse(o=>{if(o.isMesh){o.userData.owner=e;targets.push(o)}});const hits=raycaster.intersectObjects(targets,false);let end=origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(68));
 if(hits.length){const hit=hits[0],enemy=hit.object.userData.owner;end.copy(hit.point);if(enemy&&enemy.alive){let damage=weapons[weaponType].damage*(hit.point.y>1.65?1.7:1);enemy.hp-=damage;enemy.hit=.16;showHit();burst(hit.point,0xd5bb83,5);if(enemy.hp<=0){enemy.alive=false;enemy.death=.8;kills++;explosion(enemy.root.position.clone().add(new T.Vector3(0,1,0)));showToast(enemy.heavy?'PASUKAN BERAT DILUMPUHKAN':'TARGET DILUMPUHKAN');updateHUD();if(kills>=12){setTimeout(()=>finish(true),700)}}}}
 const muzzle=new T.Vector3(0,.01,-.8).applyMatrix4(viewWeapon.matrixWorld);makeTracer(muzzle,end,weaponType===1?0xffd985:0xffe6b2);updateHUD();if(ammo===0&&reserve>0)setTimeout(()=>{if(state==='play'&&!reload)reloadWeapon()},300);
}
function reloadWeapon(){if(reload>0||ammo===weapons[weaponType].mag||reserve<=0)return;reload=weaponType===0?1.45:1.75;showToast('ISI ULANG');updateHUD()}
function switchWeapon(){weaponType=(weaponType+1)%weapons.length;ammo=weapons[weaponType].mag;reserve=weapons[weaponType].reserve;reload=0;buildWeapon();showToast('SENJATA: '+weapons[weaponType].name);updateHUD()}
function hurt(amount){if(state!=='play'||paused)return;player.health=Math.max(0,player.health-amount);$('#damageFlash').classList.add('show');setTimeout(()=>$('#damageFlash').classList.remove('show'),130);shake=.09;updateHUD();if(player.health<=0)finish(false)}
function finish(win){if(state!=='play')return;state='end';document.exitPointerLock?.();$('#hud').classList.remove('active');$('#pauseBtn').style.display='none';$('#mobileControls').classList.remove('active');$('#endKicker').textContent=win?'MISI SELESAI • 06:42':'MISI GAGAL • REGU ECHO';$('#endTitle').innerHTML=win?'PANTAI<br><span>AMAN</span>':'KITA AKAN<br><span>KEMBALI</span>';$('#endStory').textContent=win?'Pertahanan pantai berhasil dilumpuhkan. Regu Echo membuka jalur bagi pasukan Sekutu untuk bergerak ke pedalaman. Hari-H baru saja dimulai.':'Regu Echo terpaksa mundur dari pantai. Bertahan lebih lama, gunakan perlindungan, dan bidik dengan cermat.';$('#endStats').innerHTML=`MUSUH DILUMPUHKAN &nbsp; ${kills} / 12<br>KONDISI AKHIR &nbsp; ${Math.ceil(player.health)}%<br><span style="color:#a49c88">Normandia, 6 Juni 1944. Tokoh & peristiwa permainan difiksikan.</span>`;$('#endScreen').classList.remove('hidden')}
function begin(){state='play';paused=false;$('#startScreen').classList.add('hidden');$('#hud').classList.add('active');$('#pauseBtn').style.display='block';if(('ontouchstart'in window)||innerWidth<800)$('#mobileControls').classList.add('active');for(let i=0;i<5;i++)spawnEnemy();updateHUD();canvas.requestPointerLock?.()}
function reset(){for(const e of enemies)scene.remove(e.root);enemies.length=0;for(const fx of effects)scene.remove(fx.object);effects.length=0;player.pos.set(0,1.72,10);player.yaw=0;player.pitch=-.025;player.health=100;kills=0;ammo=8;reserve=64;reload=0;cooldown=0;weaponType=0;buildWeapon();camera.position.copy(player.pos);camera.rotation.set(player.pitch,player.yaw,0,'YXZ');$('#endScreen').classList.add('hidden');$('#hud').classList.remove('active');$('#pauseBtn').style.display='none';$('#startScreen').classList.remove('hidden');state='title';paused=false;updateHUD()}
function togglePause(){if(state!=='play')return;paused=!paused;$('#pauseBtn').textContent=paused?'▶':'Ⅱ';if(paused)document.exitPointerLock?.();else canvas.requestPointerLock?.();showToast(paused?'MISI DIJEDA':'LANJUTKAN MISI')}
function update(dt){elapsed+=dt;for(const smoke of smokes){smoke.group.position.y=Math.sin(elapsed*.42+smoke.phase)*.24;smoke.group.rotation.y=Math.sin(elapsed*.17+smoke.phase)*.08}
 if(state!=='play'||paused)return;
 cooldown=Math.max(0,cooldown-dt);if(reload>0){reload-=dt;if(reload<=0){const weap=weapons[weaponType],take=Math.min(weap.mag-ammo,reserve);ammo+=take;reserve-=take;showToast('SIAP MENEMBAK');updateHUD()}}
 if(fireHeld&&cooldown<=0)fire();if(flashTimer>0){flashTimer-=dt;if(flashTimer<=0){viewWeapon.userData.flash.visible=false;viewWeapon.userData.lamp.intensity=0}}
 if(hitTimer>0){hitTimer-=dt;if(hitTimer<=0){$('#hitmarker').classList.remove('show');$('#crosshair').classList.remove('hit')}}
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('#toast').classList.remove('show')}
 const fwd=new T.Vector3(Math.sin(player.yaw),0,-Math.cos(player.yaw)),right=new T.Vector3(Math.cos(player.yaw),0,Math.sin(player.yaw));let dx=0,dz=0;
 if(keys.w||keys.arrowup) {dx+=fwd.x;dz+=fwd.z}if(keys.s||keys.arrowdown){dx-=fwd.x;dz-=fwd.z}if(keys.d||keys.arrowright){dx+=right.x;dz+=right.z}if(keys.a||keys.arrowleft){dx-=right.x;dz-=right.z}
 const moving=dx*dx+dz*dz>0;if(moving){const norm=1/Math.hypot(dx,dz),speed=(keys.shift?8:4.7)*dt;player.pos.x+=dx*norm*speed;player.pos.z+=dz*norm*speed;moveBob+=dt*(keys.shift?13:9)}else moveBob*=.86;
 player.pos.x=T.MathUtils.clamp(player.pos.x,-27,27);player.pos.z=T.MathUtils.clamp(player.pos.z,-1,18);camera.position.copy(player.pos);camera.position.y+=Math.sin(moveBob)*.025*(moving?1:0);camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
 viewWeapon.position.y=-.31+Math.sin(moveBob)*.012*(moving?1:0);viewWeapon.rotation.z=Math.sin(moveBob*.5)*.015*(moving?1:0);viewWeapon.position.z=-.62+shake;shake=Math.max(0,shake-dt*.3);
 for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(!e.alive){e.death-=dt;e.body.rotation.x=Math.min(1.3,(.8-e.death)*1.8);if(e.death<=0){scene.remove(e.root);enemies.splice(i,1)}continue}
 const ex=e.root.position.x,ez=e.root.position.z,dxp=player.pos.x-ex,dzp=player.pos.z-ez,dist=Math.hypot(dxp,dzp);e.root.lookAt(player.pos.x,0,player.pos.z);e.phase+=dt*(dist>8?8:4);e.legs[0].rotation.x=Math.sin(e.phase)*.48;e.legs[1].rotation.x=-Math.sin(e.phase)*.48;e.arms[0].rotation.x=-.8+Math.sin(e.phase)*.05;e.arms[1].rotation.x=-.65-Math.sin(e.phase)*.05;
 if(e.hit>0){e.hit-=dt;e.body.position.y=.045}else e.body.position.y=Math.sin(e.phase*.5)*.018;
 if(dist>7.5){e.root.position.x+=dxp/dist*e.speed*dt;e.root.position.z+=dzp/dist*e.speed*dt}else{e.root.position.x+=Math.sin(elapsed*1.1+e.phase)*.32*dt;e.root.position.z+=Math.cos(elapsed*1.3+e.phase)*.28*dt}
 e.bar.children[1].scale.x=Math.max(.02,e.hp/e.maxHp*.72);e.bar.visible=dist<35;
 e.fire-=dt;if(e.fire<=0&&dist<31){e.fire=(e.heavy?1.25:1.75)+Math.random()*1.25;const muzzle=e.root.position.clone().add(new T.Vector3(0,1.22,0));const aim=player.pos.clone().add(new T.Vector3(0,-.2,0));makeTracer(muzzle,aim,0xf6a653);if(dist<25&&Math.random()<(dist<13?.26:.15))hurt(e.heavy?9:6)}
 }
 spawnTimer-=dt;if(spawnTimer<=0&&enemies.filter(e=>e.alive).length<5&&kills<12){spawnEnemy();spawnTimer=2.1+Math.random()*1.7}
 for(let i=effects.length-1;i>=0;i--){const fx=effects[i];fx.life-=dt;if(fx.type==='particle'){fx.object.position.addScaledVector(fx.object.userData.vel,dt);fx.object.userData.vel.y-=5*dt;fx.object.material.opacity=Math.max(0,fx.life/fx.max)}if(fx.type==='line')fx.object.material.opacity=Math.max(0,fx.life/fx.max);if(fx.type==='light')fx.object.intensity=7*Math.max(0,fx.life/fx.max);if(fx.life<=0){scene.remove(fx.object);fx.object.geometry?.dispose();fx.object.material?.dispose();effects.splice(i,1)}}
}
function animate(){requestAnimationFrame(animate);const now=performance.now(),dt=Math.min(.04,(now-(animate.last||now))/1000);animate.last=now;update(dt);renderer.render(scene,camera)}
let drag=false,lastPointer={x:0,y:0};
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();keys[k]=true;if(k==='r'&&!e.repeat)reloadWeapon();if(k==='q'&&!e.repeat)switchWeapon();if(k==='escape'&&state==='play'&&!e.repeat)togglePause()});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
document.addEventListener('mousemove',e=>{if(state!=='play'||paused)return;if(document.pointerLockElement===canvas){player.yaw-=e.movementX*.0022;player.pitch=T.MathUtils.clamp(player.pitch-e.movementY*.0019,-1.15,1.05)}else if(drag){player.yaw-=(e.clientX-lastPointer.x)*.004;player.pitch=T.MathUtils.clamp(player.pitch-(e.clientY-lastPointer.y)*.003,-1.15,1.05)}lastPointer={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointerdown',e=>{if(state!=='play')return;drag=true;lastPointer={x:e.clientX,y:e.clientY};if(e.pointerType==='mouse'){fireHeld=true;fire();canvas.requestPointerLock?.()}else{canvas.setPointerCapture?.(e.pointerId)}});
canvas.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'||!drag||state!=='play'||paused)return;player.yaw-=(e.clientX-lastPointer.x)*.004;player.pitch=T.MathUtils.clamp(player.pitch-(e.clientY-lastPointer.y)*.003,-1.15,1.05);lastPointer={x:e.clientX,y:e.clientY}});
addEventListener('pointerup',()=>{drag=false;fireHeld=false});canvas.addEventListener('contextmenu',e=>e.preventDefault());
document.querySelectorAll('.touch-btn').forEach(button=>{const k=button.dataset.key;const on=e=>{e.preventDefault();e.stopPropagation();if(k==='fire'){fireHeld=true;fire()}else keys[k]=true};const off=e=>{e.preventDefault();if(k==='fire')fireHeld=false;else keys[k]=false};button.addEventListener('pointerdown',on);button.addEventListener('pointerup',off);button.addEventListener('pointerleave',off);button.addEventListener('pointercancel',off)});
$('#startBtn').addEventListener('click',begin);$('#restartBtn').addEventListener('click',reset);$('#howBtn').addEventListener('click',()=>showToast('WASD bergerak • MOUSE membidik • KLIK menembak • R isi ulang • SHIFT lari'));
$('#pauseBtn').addEventListener('click',togglePause);addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setSize(innerWidth,innerHeight)});
updateHUD();animate();
})();
