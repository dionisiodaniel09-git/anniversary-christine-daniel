// Unlock My Heart — edit photos and captions below to personalize.
const $=id=>document.getElementById(id);
let current=1;
function show(n){
 current=n;
 document.querySelectorAll('main section').forEach((section,i)=>section.classList.toggle('active',i===n-1));
 $('progress').innerHTML=Array.from({length:6},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('');
 window.scrollTo({top:0,behavior:'smooth'});
}
show(1);

// 1. Eight-digit anniversary lock: MMDDYYYY.
const CORRECT_CODE='11182016';
let pin='';
function drawPin(){
 $('dots').innerHTML=Array.from({length:CORRECT_CODE.length},(_,i)=>`<span class="${i<pin.length?'filled':''}"></span>`).join('');
}
function pressKey(key){
 if(key==='⌫')pin=pin.slice(0,-1);
 else if(/^\d$/.test(key)&&pin.length<CORRECT_CODE.length)pin+=key;
 drawPin();
 if(pin.length===CORRECT_CODE.length){
  if(pin===CORRECT_CODE){$('lockMessage').textContent='♡ You remembered!';setTimeout(()=>show(2),650);}
  else {$('lockMessage').textContent='Not quite, love. Try again ♡';setTimeout(()=>{pin='';drawPin();$('lockMessage').textContent='';},900);}
 }
}
$('keypad').innerHTML=[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k=>k===''?'<span></span>':`<button type="button" data-key="${k}">${k}</button>`).join('');
$('keypad').addEventListener('click',e=>{const b=e.target.closest('[data-key]');if(b)pressKey(b.dataset.key);});
window.addEventListener('keydown',e=>{if(current===1&&(/^[0-9]$/.test(e.key)||e.key==='Backspace'))pressKey(e.key==='Backspace'?'⌫':e.key);});
drawPin();

// 2. Solvable 3x3 sliding picture puzzle, shuffled by legal moves.
let board=[];
const neighbors=(a,b)=>Math.abs(Math.floor(a/3)-Math.floor(b/3))+Math.abs(a%3-b%3)===1;
const solvedPuzzle=()=>board.every((v,i)=>v===(i+1)%9);
function renderPuzzle(){
 $('puzzle').innerHTML=board.map((v,i)=>v===0?'<button class="tile empty" aria-label="Empty slot" disabled></button>':`<button class="tile" data-index="${i}" aria-label="Move photo piece ${v}" style="background-position:${((v-1)%3)*50}% ${Math.floor((v-1)/3)*50}%"></button>`).join('');
 $('puzzle').classList.toggle('solved',solvedPuzzle());
}
function shufflePuzzle(){
 board=[1,2,3,4,5,6,7,8,0];
 let prev=-1;
 for(let step=0;step<85;step++){
  const zero=board.indexOf(0);
  const moves=board.map((_,i)=>i).filter(i=>neighbors(i,zero)&&i!==prev);
  const pick=moves[Math.floor(Math.random()*moves.length)];
  [board[zero],board[pick]]=[board[pick],board[zero]];
  prev=zero;
 }
 if(solvedPuzzle())return shufflePuzzle();
 $('next2').disabled=true;$('puzzleMessage').textContent='';renderPuzzle();
}
$('puzzle').addEventListener('click',e=>{
 const b=e.target.closest('[data-index]');if(!b)return;
 const index=Number(b.dataset.index),zero=board.indexOf(0);
 if(!neighbors(index,zero))return;
 [board[index],board[zero]]=[board[zero],board[index]];
 renderPuzzle();
 if(solvedPuzzle()){$('puzzleMessage').textContent='Perfect fit. Just like us! ♡';$('next2').disabled=false;}
});
$('reshuffle').onclick=shufflePuzzle;
$('next2').onclick=()=>show(3);
shufflePuzzle();

// 3. Wheel: every spin lands physically on "Date with me".
const prizes=['A kiss 💋','A hug 🤗','Free massage 💆','Date with me ❤️','Win the next argument 😘'];
const DATE_INDEX=3;
let wheelRotation=0,spinning=false;
prizes.forEach((prize,i)=>{
 const label=document.createElement('div');label.className='wheel-label';
 // Segment centers: -90 degrees (top) is the pointer, first center at -54 degrees.
 const angle=i*72+36-90;
 label.style.transform=`rotate(${angle}deg) translateX(15px)`;
 label.textContent=prize;$('wheel').appendChild(label);
});
$('spin').onclick=()=>{
 if(spinning)return;
 spinning=true;$('spin').disabled=true;
 $('wheelMessage').textContent='Spinning for our special surprise…';
 // Wheel segment 3 center is 252 degrees clockwise from the top reference.
 // Rotate so the chosen segment center meets the fixed top pointer.
 const desired=(360-(DATE_INDEX*72+36))%360;
 const extra=(desired-(wheelRotation%360)+360)%360;
 wheelRotation+=1440+extra;
 $('wheel').style.transform=`rotate(${wheelRotation}deg)`;
 setTimeout(()=>{
  $('wheelMessage').textContent='It’s a date! ❤️ You won: Date with me!';
  $('next3').disabled=false;spinning=false;
 },4100);
};
$('next3').onclick=()=>show(4);

// 4. Memory match: your uploaded photos (2nd through 5th).
const photos=['assets/memory1.jpg','assets/memory2.jpg','assets/memory3.jpg','assets/memory4.jpg'];
const captions=[
 'Back to where some of our sweetest memories began. ♡',
 'Even our adventures are better when we are together. ♡',
 'I will always choose you, in every season of life. ♡',
 'Silly moments, big smiles, and a love that keeps growing. ♡'
];
let cards=[0,0,1,1,2,2,3,3];
for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
let flipped=[],matched=new Set(),memoryBusy=false;
function renderCards(){
 $('memoryGrid').innerHTML=cards.map((id,i)=>{
  const faceUp=matched.has(id)||flipped.includes(i);
  return `<button type="button" class="memory-card ${matched.has(id)?'matched':faceUp?'revealed':''}" data-index="${i}" aria-label="${faceUp?'Memory photo '+(id+1):'Hidden memory card'}">${faceUp?`<img src="${photos[id]}" alt="Our memory ${id+1}">`:'♡'}</button>`;
 }).join('');
}
$('memoryGrid').addEventListener('click',e=>{
 const button=e.target.closest('[data-index]');if(!button||memoryBusy)return;
 const index=Number(button.dataset.index),id=cards[index];
 if(flipped.includes(index)||matched.has(id))return;
 flipped.push(index);renderCards();
 if(flipped.length!==2)return;
 memoryBusy=true;
 if(cards[flipped[0]]===cards[flipped[1]]){
  setTimeout(()=>{
   matched.add(id);
   const cap=document.createElement('div');cap.className='caption';cap.textContent='♡ '+captions[id];$('captions').appendChild(cap);
   flipped=[];memoryBusy=false;renderCards();
   if(matched.size===4){$('memoryMessage').textContent='All our memories, forever treasured ♡';$('next4').disabled=false;}
  },550);
 }else setTimeout(()=>{flipped=[];memoryBusy=false;renderCards();},1050);
});
$('next4').onclick=()=>show(5);
renderCards();

// 5. Real voice message extracted from the uploaded video.
const loveAudio=$('loveAudio');
const playAudioBtn=$('playAudio');
const seekAudio=$('audioSeek');
const cassette=$('cassette');
const formatTime=seconds=>{if(!Number.isFinite(seconds))return '0:00';const n=Math.floor(seconds);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;};
function syncAudioDisplay(){
 const duration=Number.isFinite(loveAudio.duration)?loveAudio.duration:43;
 seekAudio.value=duration?String(loveAudio.currentTime/duration*100):'0';
 seekAudio.style.setProperty('--progress',seekAudio.value+'%');
 $('audioTime').textContent=`${formatTime(loveAudio.currentTime)} / ${formatTime(duration)}`;
 const playing=!loveAudio.paused&&!loveAudio.ended;
 cassette.classList.toggle('playing',playing);
 playAudioBtn.textContent=playing?'Ⅱ':'▶';
 playAudioBtn.setAttribute('aria-label',playing?'Pause recording':'Play recording');
}
playAudioBtn.addEventListener('click',async()=>{
 if(!loveAudio.paused){loveAudio.pause();return;}
 try{await loveAudio.play();$('audioStatus').textContent='Playing your love message… ♡';}
 catch(error){$('audioStatus').textContent='Unable to play audio. Please check the recording file.';}
});
$('rewindAudio').addEventListener('click',()=>{loveAudio.currentTime=0;syncAudioDisplay();$('audioStatus').textContent=loveAudio.paused?'Rewound to the beginning ♡':'Playing from the beginning ♡';});
seekAudio.addEventListener('input',()=>{if(Number.isFinite(loveAudio.duration))loveAudio.currentTime=Number(seekAudio.value)/100*loveAudio.duration;syncAudioDisplay();});
loveAudio.addEventListener('timeupdate',syncAudioDisplay);
loveAudio.addEventListener('loadedmetadata',syncAudioDisplay);
loveAudio.addEventListener('play',()=>{$('audioStatus').textContent='Playing your love message… ♡';syncAudioDisplay();});
loveAudio.addEventListener('pause',()=>{if(!loveAudio.ended)$('audioStatus').textContent='Paused ♡';syncAudioDisplay();});
loveAudio.addEventListener('ended',()=>{$('audioStatus').textContent='Every word was meant for you. ♡';syncAudioDisplay();});
loveAudio.addEventListener('error',()=>{$('audioStatus').textContent='Audio could not load. Check assets/anniversary-message.mp3';});
$('next5').onclick=()=>{loveAudio.pause();show(6);};
syncAudioDisplay();

// 6. Word search: drag over letters or tap the first and last letter.
const gridSize=12;
const grid=Array.from({length:gridSize},()=>Array(gridSize).fill(''));
const placements=[['HAPPY',2,1,1,0],['ANNIVERSARY',0,0,0,1],['PRETTY',5,3,0,1],['WIFEY',7,10,1,0]];
const paths={};
placements.forEach(([word,r,c,dr,dc])=>{
 paths[word]=[];
 for(let k=0;k<word.length;k++){
  const rr=r+k*dr,cc=c+k*dc;
  grid[rr][cc]=word[k];paths[word].push(rr*gridSize+cc);
 }
});
let randomSeed=71;
function nextRandom(){randomSeed=(randomSeed*16807)%2147483647;return randomSeed/2147483647;}
for(let r=0;r<gridSize;r++)for(let c=0;c<gridSize;c++)if(!grid[r][c])grid[r][c]='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(nextRandom()*26)];
const found=new Set();let selectionStart=null,selectionDragged=false,pointerIsDown=false;
function selectedLine(a,b){
 const ar=Math.floor(a/gridSize),ac=a%gridSize,br=Math.floor(b/gridSize),bc=b%gridSize;
 const deltaR=br-ar,deltaC=bc-ac;
 if(!(ar===br||ac===bc||Math.abs(deltaR)===Math.abs(deltaC)))return [];
 const dr=Math.sign(deltaR),dc=Math.sign(deltaC),steps=Math.max(Math.abs(deltaR),Math.abs(deltaC));
 return Array.from({length:steps+1},(_,i)=>(ar+i*dr)*gridSize+ac+i*dc);
}
function renderWords(){
 $('words').innerHTML=placements.map(([word])=>`<span class="word ${found.has(word)?'done':''}">${word} ${found.has(word)?'✓':''}</span>`).join('');
 $('wordgrid').innerHTML=grid.flat().map((ch,i)=>`<div class="letter ${[...found].some(word=>paths[word].includes(i))?'found':''}" data-i="${i}">${ch}</div>`).join('');
}
function highlight(end){
 document.querySelectorAll('.letter.selected').forEach(el=>el.classList.remove('selected'));
 if(selectionStart===null)return;
 selectedLine(selectionStart,end).forEach(i=>$('wordgrid').querySelector(`[data-i="${i}"]`)?.classList.add('selected'));
}
function completeSelection(end){
 if(selectionStart===null)return;
 const chosen=selectedLine(selectionStart,end);
 const match=placements.find(([word])=>!found.has(word)&&(JSON.stringify(chosen)===JSON.stringify(paths[word])||JSON.stringify(chosen)===JSON.stringify([...paths[word]].reverse())));
 selectionStart=null;renderWords();
 if(!match)return;
 found.add(match[0]);renderWords();
 $('wordMessage').textContent=`You found ${match[0]}! ♡`;
 if(found.size===4){
  $('wordMessage').textContent='Every word found. Every piece of my heart is yours. ♡';
  $('finalLetter').hidden=false;
  setTimeout(()=>$('finalLetter').scrollIntoView({behavior:'smooth',block:'start'}),350);
 }
}
const wordBox=$('wordgrid');
const letterAt=(x,y)=>{const el=document.elementFromPoint(x,y)?.closest('[data-i]');return el&&wordBox.contains(el)?Number(el.dataset.i):null;};
wordBox.addEventListener('pointerdown',e=>{
 const tile=e.target.closest('[data-i]');if(!tile)return;
 // First tap starts a selection; next tap finishes it, and a drag works immediately.
 if(selectionStart===null)selectionStart=Number(tile.dataset.i);
 else if(selectionStart!==Number(tile.dataset.i)){
  completeSelection(Number(tile.dataset.i));pointerIsDown=false;return;
 }
 pointerIsDown=true;selectionDragged=false;highlight(Number(tile.dataset.i));
});
wordBox.addEventListener('pointermove',e=>{
 if(!pointerIsDown||selectionStart===null)return;
 const end=letterAt(e.clientX,e.clientY);
 if(end!==null&&end!==selectionStart){selectionDragged=true;highlight(end);}
});
window.addEventListener('pointerup',e=>{
 if(!pointerIsDown)return;pointerIsDown=false;
 const end=letterAt(e.clientX,e.clientY);
 if(selectionDragged&&end!==null)completeSelection(end);
 else if(selectionDragged&&end===null){selectionStart=null;renderWords();}
});
wordBox.addEventListener('keydown',e=>{
 if(e.key!=='Enter'&&e.key!==' ')return;
 const tile=e.target.closest('[data-i]');if(!tile)return;e.preventDefault();
 const index=Number(tile.dataset.i);
 if(selectionStart===null){selectionStart=index;highlight(index);}else completeSelection(index);
});
renderWords();
$('restart').onclick=()=>window.location.reload();
