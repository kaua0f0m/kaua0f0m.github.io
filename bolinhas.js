/* =====================================================================
   bolinhas.js — as bolinhas do site num lugar só.
   A página inicial (index.html) e o Labs (labs.html) leem tudo daqui:
   os projetos, as formas, o motor das bolinhas, o monitor 8-bit e as
   configurações que o visitante escolhe no Labs.
   Mexeu aqui, as duas páginas mudam juntas.
   ===================================================================== */
(() => {
const N = 1500;

/* ---------- PROJETOS — edite aqui ----------
   shape: forma feita de bolinhas (veja SHAPES) · art: desenho 8-bit (veja ART)
   children: vira um menu que abre (ex.: Jackbox Games, com um pack por linha)
   soon: linha apagadinha no fim do menu, para o que ainda vai entrar */
const PROJETOS = [
  { title:'Traduções & mods', note:'GitHub', items:[
    { key:'jackbox', name:'Jackbox Games', desc:'Traduções PT-BR dos packs da Jackbox, com instalador', tags:['Python','instalador'], color:'#ffcc33', shape:'phone',
      soon:'Outros packs da Jackbox entram aqui', children:[
      { key:'jackbox8', name:'The Jackbox Party Pack 8', ai:'Claude Code', desc:'Tradução PT-BR não oficial, com instalador', tags:['Python','instalador'], color:'#ffcc33', shape:'phone',
        url:'jackbox-8.html' },
    ]},
    { key:'unbeatable', name:'UNBEATABLE', ai:'Claude Code', desc:'Tradução PT-BR (feita por IA) — mod BepInEx', tags:['C#','BepInEx'], color:'#ff4d6d', art:'proibido',
      url:'unbeatable.html' },
    { key:'katamari', name:'Katamari Damacy REROLL', ai:'Codex', desc:'Tradução PT-BR + Katamari Plus', tags:['C#','mod'], color:'#7ddc5a', shape:'katamari', spin:true,
      url:'katamari.html' },
    { key:'date', name:'Date Everything!', ai:'Codex', desc:'Tradução PT-BR (IA + curadoria), instalador sem arquivos do jogo', tags:['Python','instalador'], color:'#ff7eb6', shape:'heart',
      url:'date-everything.html' },
    { key:'hush', name:'Hush Hush', ai:'Claude Code', desc:'Tradução PT-BR (IA + curadoria em certas linhas)', tags:['Python','+18'], color:'#d0193a', shape:'clock',
      url:'hush-hush.html' },
    { key:'hunie2', name:'HuniePop 2', ai:'Gemini', desc:'Localização PT-BR — plugin BepInEx 5', tags:['C#','BepInEx','+18'], color:'#ffd23f', shape:'bell',
      url:'huniepop-2.html' },
  ]},
  { title:'Standalone', note:'apps', items:[
    { key:'voxstage', name:'VoxStage', ai:'Codex', desc:'Karaokê local para Windows, Android e Google TV', tags:['JavaScript','app'], color:'#d4fb69', shape:'vx',
      url:'voxstage.html' },
  ]},
  { title:'Legado & labs', note:'arquivo', items:[
    { key:'legado', name:'Traduções legado', ai:'sem IA', desc:'Todas as traduções antigas reunidas em uma página', tags:['10 jogos'], color:'#9aa4b2', shape:'floppy',
      url:'legado.html' },
    { key:'labs', name:'Configurações das bolinhas', ai:'Claude Code', desc:'Labs: escolha quais formas aparecem aqui, a ordem, o estilo e o monitor 8-bit', tags:['Labs'], color:'#5ce1e6', shape:'gear',
      url:'labs.html' },
  ]},
];

/* ---------- formas ---------- */
/* ---------- sprites de mini esfera (um por cor) ---------- */
const sprites = {};
function sprite(color){
  if (sprites[color]) return sprites[color];
  const SP = 64, c = document.createElement('canvas'); c.width = c.height = SP;
  const g = c.getContext('2d'), r = SP/2, grd = g.createRadialGradient(r*.65, r*.6, r*.05, r, r, r);
  const n = parseInt(color.slice(1), 16), R = n>>16, G = n>>8&255, B = n&255, sh = f => `rgb(${R*f|0},${G*f|0},${B*f|0})`;
  if (color === '#ffffff'){ grd.addColorStop(0,'#fff'); grd.addColorStop(.35,'#d9d9d9'); grd.addColorStop(.8,'#5a5a5a'); grd.addColorStop(1,'#1a1a1a'); }
  else { grd.addColorStop(0,'#fff'); grd.addColorStop(.3, color); grd.addColorStop(.8, sh(.35)); grd.addColorStop(1, '#070707'); }
  g.fillStyle = grd; g.beginPath(); g.arc(r, r, r-1, 0, Math.PI*2); g.fill();
  return sprites[color] = c;
}

/* ---------- formas ---------- */
const rnd = (a,b) => a + Math.random()*(b-a);
function sphere(n, R = 1){ const a = []; for (let i = 0; i < n; i++){ const y = 1 - 2*(i+.5)/n, r = Math.sqrt(1-y*y), t = i*2.399963; a.push({x:Math.cos(t)*r*R, y:y*R, z:Math.sin(t)*r*R}); } return a; }

// desenha uma forma 2D num canvas e transforma em "almofada" 3D de bolinhas
function fromDrawing(draw, n, depth = .3){
  const S = 400, U = 150, a = document.createElement('canvas'); a.width = a.height = S;
  const g = a.getContext('2d'); g.translate(S/2, S/2); g.scale(U, U); g.fillStyle = g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineJoin = 'round';
  draw(g);
  return fromCanvas(a, n, depth, U);
}
function fromCanvas(a, n, depth, U){
  const S = a.width, b = document.createElement('canvas'); b.width = b.height = S;
  const gb = b.getContext('2d'); gb.filter = 'blur(14px)'; gb.drawImage(a, 0, 0);
  const da = a.getContext('2d').getImageData(0,0,S,S).data, db = gb.getImageData(0,0,S,S).data, cand = [];
  for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2){ const i = (y*S+x)*4+3; if (da[i] > 128) cand.push([x, y, db[i]/255]); }
  const out = [];
  for (let i = 0; i < n; i++){
    const [x, y, bl] = cand[(Math.random()*cand.length)|0], d = Math.max(0, (bl - .45)/.55);
    out.push({x:(x - S/2)/U + rnd(-.008,.008), y:-(y - S/2)/U + rnd(-.008,.008), z:(Math.random() < .5 ? -1 : 1)*depth*Math.sqrt(d) + rnd(-.02,.02)});
  }
  return out;
}
function fromImage(src, n){
  return new Promise(res => { const img = new Image(); img.onload = () => {
    const S = 400, a = document.createElement('canvas'); a.width = a.height = S; const g = a.getContext('2d');
    const k = Math.min(360/img.width, 300/img.height); g.drawImage(img, (S - img.width*k)/2, (S - img.height*k)/2, img.width*k, img.height*k);
    res(fromCanvas(a, n, .18, 150)); }; img.onerror = () => res(null); img.src = src; });
}

function textPoints(word, n, maxW = 1.55, maxH = .68, dy = .04){
  const w = 640, h = 260, c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '800 170px "Inter Tight", "Noto Sans JP", "Noto Sans SC", system-ui, sans-serif'; g.fillText(word, w/2, h/2);
  const d = g.getImageData(0,0,w,h).data, cand = [];
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) if (d[(y*w+x)*4+3] > 128){ cand.push([x,y]); minX = Math.min(minX,x); maxX = Math.max(maxX,x); minY = Math.min(minY,y); maxY = Math.max(maxY,y); }
  const s = Math.min(maxW/(maxX-minX), maxH/(maxY-minY)), cx = (minX+maxX)/2, cy = (minY+maxY)/2, out = [];
  for (let i = 0; i < n; i++){ const [x,y] = cand[(Math.random()*cand.length)|0]; out.push({x:(x-cx)*s + rnd(-.006,.006), y:-(y-cy)*s + dy + rnd(-.006,.006), z:rnd(-.05,.05)}); }
  return out;
}

function bubbleOutline(){
  const W = 1.2, H = .66, R = .42, pts = [];
  const arc = (cx, cy, a0, a1) => { for (let i = 0; i <= 16; i++){ const a = a0 + (a1-a0)*i/16; pts.push([cx+Math.cos(a)*R, cy+Math.sin(a)*R]); } };
  pts.push([-.12,-H]); arc(W-R,-H+R,-Math.PI/2,0); arc(W-R,H-R,0,Math.PI/2); arc(-W+R,H-R,Math.PI/2,Math.PI); arc(-W+R,-H+R,Math.PI,Math.PI*1.5);
  pts.push([-.62,-H], [-.86,-1.08], [-.12,-H]);
  const seg = []; let L = 0;
  for (let i = 0; i < pts.length-1; i++){ const d = Math.hypot(pts[i+1][0]-pts[i][0], pts[i+1][1]-pts[i][1]); seg.push(d); L += d; }
  const M = 170, tube = [];
  for (let k = 0; k < M; k++){
    let s = k/M*L, i = 0; while (s > seg[i]) { s -= seg[i]; i++; }
    const [x0,y0] = pts[i], [x1,y1] = pts[i+1], f = s/seg[i], nx = (y1-y0)/seg[i], ny = -(x1-x0)/seg[i], x = x0+(x1-x0)*f, y = y0+(y1-y0)*f;
    for (let j = 0; j < 3; j++){ const a = j/3*Math.PI*2 + k*.7; tube.push({x:x+nx*Math.cos(a)*.055, y:y+ny*Math.cos(a)*.055, z:Math.sin(a)*.055}); }
  }
  return tube;
}
const OUTLINE = bubbleOutline();
const bubbleWith = word => OUTLINE.map(p => ({...p})).concat(textPoints(word, N - OUTLINE.length));

// formas originais de cada projeto (não são logos oficiais)
const SHAPES = {
  heart: n => fromDrawing(g => { g.beginPath(); for (let i = 0; i <= 120; i++){ const t = i/120*Math.PI*2, x = 16*Math.sin(t)**3, y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t); g.lineTo(x/14.5, -y/14.5 - .05); } g.fill(); }, n, .38),
  shh: n => OUTLINE.map(p => ({...p})).concat(textPoints('shh…', n - OUTLINE.length)),
  phone: n => fromDrawing(g => {
    g.beginPath(); g.roundRect(-.62,-1.08,1.24,2.16,.22); g.fill();
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.roundRect(-.5,-.86,1,1.6,.06); g.fill();
    g.globalCompositeOperation = 'source-over'; g.font = '800 1.15px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 0, -.02);
    g.beginPath(); g.arc(0,.92,.08,0,7); g.fill();
  }, n, .16),
  notes: n => fromDrawing(g => {
    g.save(); g.translate(-.55,.62); g.rotate(-.4); g.beginPath(); g.ellipse(0,0,.34,.24,0,0,7); g.fill(); g.restore();
    g.save(); g.translate(.62,.42); g.rotate(-.4); g.beginPath(); g.ellipse(0,0,.34,.24,0,0,7); g.fill(); g.restore();
    g.lineWidth = .13; g.beginPath(); g.moveTo(-.25,.55); g.lineTo(-.25,-.78); g.moveTo(.92,.35); g.lineTo(.92,-.98); g.stroke();
    g.beginPath(); g.moveTo(-.31,-.72); g.lineTo(.98,-.94); g.lineTo(.98,-.64); g.lineTo(-.31,-.42); g.closePath(); g.fill();
  }, n, .2),
  cassette: n => fromDrawing(g => {   // fita K7: corpo, etiqueta, bobinas, janelinha e a parte de baixo
    g.beginPath(); g.roundRect(-1.15, -.74, 2.3, 1.48, .12); g.fill();
    g.globalCompositeOperation = 'destination-out';
    g.lineWidth = .06; g.beginPath(); g.roundRect(-.96, -.6, 1.92, .92, .07); g.stroke();                    // borda da etiqueta
    g.beginPath(); g.arc(-.5, -.13, .21, 0, Math.PI*2); g.arc(.5, -.13, .21, 0, Math.PI*2); g.fill();          // bobinas
    g.beginPath(); g.roundRect(-.22, -.24, .44, .22, .04); g.fill();                                            // janelinha
    g.lineWidth = .07; g.beginPath(); g.moveTo(-.72, .74); g.lineTo(-.56, .44); g.lineTo(.56, .44); g.lineTo(.72, .74); g.stroke();
    g.globalCompositeOperation = 'source-over';
    for (const cx of [-.5, .5]){ for (let i = 0; i < 6; i++){ const a = i/6*Math.PI*2; g.beginPath(); g.arc(cx + Math.cos(a)*.1, -.13 + Math.sin(a)*.1, .035, 0, Math.PI*2); g.fill(); } }
  }, n, .2),
  clock: n => fromDrawing(g => {   // relógio de parede: aro, marcações, ponteiros e centro
    g.lineWidth = .17; g.beginPath(); g.arc(0, 0, .92, 0, Math.PI*2); g.stroke();
    g.lineWidth = .09;
    for (let i = 0; i < 12; i++){ const a = i/12*Math.PI*2, r0 = i % 3 ? .66 : .56; g.beginPath(); g.moveTo(Math.cos(a)*r0, Math.sin(a)*r0); g.lineTo(Math.cos(a)*.76, Math.sin(a)*.76); g.stroke(); }
    g.lineWidth = .12; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-2.1)*.42, Math.sin(-2.1)*.42); g.stroke();   // horas
    g.lineWidth = .08; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-.55)*.62, Math.sin(-.55)*.62); g.stroke();   // minutos
    g.beginPath(); g.arc(0, 0, .1, 0, Math.PI*2); g.fill();
  }, n, .18),
  vx: n => {   // logo do VoxStage: V e X + pontinho que pula entre eles, com rastro
    const DOT = [[80, 4.5, 0], [30, 2.8, .07], [20, 2.3, .14], [12, 1.8, .21]];   // [bolinhas, raio no SVG, atraso em s]
    const nd = DOT.reduce((a, d) => a + d[0], 0);
    const pts = fromDrawing(g => { g.scale(1/26, 1/26); g.translate(-55, -51); g.lineWidth = 8;
      g.beginPath(); g.moveTo(26, 49); g.lineTo(39, 78); g.lineTo(52, 49); g.moveTo(66, 49); g.lineTo(84, 78); g.moveTo(84, 49); g.lineTo(66, 78); g.stroke(); }, n - nd, .22);
    DOT.forEach(([q, r, lag], k) => { for (const o of sphere(q, r/26)) pts.push({x:o.x, y:o.y, z:o.z, dot:k, lag, ox:o.x, oy:o.y, oz:o.z}); });
    return pts;
  },
  mic: n => fromDrawing(g => {
    g.beginPath(); g.roundRect(-.4,-1.15,.8,1.2,.4); g.fill();
    g.globalCompositeOperation = 'destination-out'; g.lineWidth = .05; g.beginPath();
    for (const y of [-.75,-.55,-.35]){ g.moveTo(-.45,y); g.lineTo(.45,y); } g.stroke();
    g.globalCompositeOperation = 'source-over'; g.lineWidth = .12;
    g.beginPath(); g.arc(0,-.3,.66,.05,Math.PI-.05); g.stroke();
    g.beginPath(); g.moveTo(0,.36); g.lineTo(0,.88); g.moveTo(-.42,.92); g.lineTo(.42,.92); g.stroke();
  }, n, .3),
  bell: n => fromDrawing(g => {
    // sino: cúpula, aba larga embaixo, badalo e argola em cima
    g.beginPath(); g.moveTo(-.72,.55); g.quadraticCurveTo(-.7,-.95,0,-.95); g.quadraticCurveTo(.7,-.95,.72,.55);
    g.lineTo(.92,.66); g.lineTo(-.92,.66); g.closePath(); g.fill();
    g.beginPath(); g.arc(0,.84,.17,0,Math.PI*2); g.fill();
    g.lineWidth = .1; g.beginPath(); g.arc(0,-1.06,.13,0,Math.PI*2); g.stroke();
    g.globalCompositeOperation = 'destination-out'; g.lineWidth = .06;
    g.beginPath(); g.moveTo(-.66,.36); g.lineTo(.66,.36); g.stroke();
  }, n, .32),
  gem: n => fromDrawing(g => {
    g.beginPath(); g.moveTo(-.55,-.8); g.lineTo(.55,-.8); g.lineTo(1.05,-.25); g.lineTo(0,1.05); g.lineTo(-1.05,-.25); g.closePath(); g.fill();
    g.globalCompositeOperation = 'destination-out'; g.lineWidth = .06; g.beginPath();
    g.moveTo(-1.05,-.25); g.lineTo(1.05,-.25); g.moveTo(-.55,-.8); g.lineTo(-.3,-.25); g.lineTo(0,1.05); g.lineTo(.3,-.25); g.lineTo(.55,-.8);
    g.moveTo(0,-.8); g.lineTo(-.3,-.25); g.moveTo(0,-.8); g.lineTo(.3,-.25); g.stroke();
  }, n, .3),
  floppy: n => fromDrawing(g => {
    g.beginPath(); g.moveTo(-.95,-.95); g.lineTo(.7,-.95); g.lineTo(.95,-.7); g.lineTo(.95,.95); g.lineTo(-.95,.95); g.closePath(); g.fill();
    g.globalCompositeOperation = 'destination-out';
    g.fillRect(-.56,-.95,1.02,.66);                                  // vão em volta da tampa de metal
    g.beginPath(); g.roundRect(-.68,.06,1.36,.89,.08); g.fill();    // etiqueta
    g.globalCompositeOperation = 'source-over';
    g.fillRect(-.47,-.95,.84,.56);                                   // tampa de metal
    g.lineWidth = .08; g.beginPath(); g.moveTo(-.5,.36); g.lineTo(.5,.36); g.moveTo(-.5,.62); g.lineTo(.28,.62); g.stroke();
    g.globalCompositeOperation = 'destination-out'; g.fillRect(.1,-.88,.2,.4); // fenda
  }, n, .14),
  gear: n => fromDrawing(g => {   // engrenagem: 10 dentes e um furo no meio
    g.beginPath(); for (let i = 0; i < 40; i++){ const a = i/40*Math.PI*2 - Math.PI/2, r = i % 4 < 2 ? 1.02 : .8; g.lineTo(Math.cos(a)*r, Math.sin(a)*r); }
    g.closePath(); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(0, 0, .34, 0, Math.PI*2); g.fill();
  }, n, .2),
  katamari: n => { // bola 3D com objetos grudados
    const core = sphere(Math.floor(n*.55), .72), out = [...core]; let left = n - core.length;
    while (left > 0){
      const u = rnd(-1,1), t = rnd(0,Math.PI*2), r = Math.sqrt(1-u*u), dir = [Math.cos(t)*r, u, Math.sin(t)*r];
      if (Math.random() < .55){ const R = rnd(.1,.2), c = dir.map(v => v*(.72+R*.7)), k = Math.min(left, 40|0);
        for (const p of sphere(k, R)) out.push({x:c[0]+p.x, y:c[1]+p.y, z:c[2]+p.z}); left -= k; }
      else { const L = rnd(.35,.6), k = Math.min(left, 22);
        for (let i = 0; i < k; i++){ const s = .68 + L*i/k; out.push({x:dir[0]*s+rnd(-.02,.02), y:dir[1]*s+rnd(-.02,.02), z:dir[2]*s+rnd(-.02,.02)}); } left -= k; }
    }
    return out;
  },
};

function fill(pts, n){ const out = pts.slice(0, n); while (out.length < n){ const q = pts[(Math.random()*pts.length)|0]; out.push({x:q.x + rnd(-.01,.01), y:q.y + rnd(-.01,.01), z:q.z + rnd(-.01,.01)}); } return out; }
const GEO = [
  { name:'cubo', color:'#4dd9ff', make(n){ const pts = [], m = Math.floor(Math.sqrt(n/6)), a = .72;
      for (let f = 0; f < 6; f++) for (let i = 0; i < m; i++) for (let j = 0; j < m; j++){
        const u = (i/(m-1)*2 - 1)*a, v = (j/(m-1)*2 - 1)*a, axis = f >> 1, sgn = f & 1 ? a : -a;
        pts.push(axis === 0 ? {x:sgn, y:u, z:v} : axis === 1 ? {x:u, y:sgn, z:v} : {x:u, y:v, z:sgn}); }
      return fill(pts, n); } },
  { name:'toro', color:'#ff9a3d', make(n){ const pts = [], A = 50, B = Math.ceil(n/50), R = .72, r = .3, t = .55;
      for (let i = 0; i < A; i++) for (let j = 0; j < B; j++){
        const u = i/A*Math.PI*2, v = j/B*Math.PI*2, x = (R + r*Math.cos(v))*Math.cos(u), y = r*Math.sin(v), z = (R + r*Math.cos(v))*Math.sin(u);
        pts.push({x, y:y*Math.cos(t) - z*Math.sin(t), z:y*Math.sin(t) + z*Math.cos(t)}); }
      return fill(pts, n); } },
  { name:'pirâmide', color:'#ffd23f', make(n){ const pts = [], b = .78, yb = -.62, top = {x:0, y:.98, z:0};
      const base = [{x:-b, y:yb, z:-b}, {x:b, y:yb, z:-b}, {x:b, y:yb, z:b}, {x:-b, y:yb, z:b}];
      const tri = (A, B, C) => { let u = Math.random(), v = Math.random(); if (u + v > 1){ u = 1 - u; v = 1 - v; }
        return {x:A.x + u*(B.x - A.x) + v*(C.x - A.x), y:A.y + u*(B.y - A.y) + v*(C.y - A.y), z:A.z + u*(B.z - A.z) + v*(C.z - A.z)}; };
      const edges = [...base.map((q, i) => [q, base[(i+1) % 4]]), ...base.map(q => [q, top])];
      for (let i = 0; i < n*.3; i++){ const [A, B] = edges[i % edges.length], k = Math.random(); pts.push({x:A.x + (B.x - A.x)*k, y:A.y + (B.y - A.y)*k, z:A.z + (B.z - A.z)*k}); }
      while (pts.length < n){ const f = (Math.random()*5)|0;
        pts.push(f < 4 ? tri(base[f], base[(f+1) % 4], top) : (Math.random() < .5 ? tri(base[0], base[1], base[2]) : tri(base[0], base[2], base[3]))); }
      return pts; } },
  { name:'hélice dupla', color:'#7dff9a', make(n){ const pts = [], strand = Math.floor(n*.36), R = .5;
      for (let s = 0; s < 2; s++) for (let i = 0; i < strand; i++){ const t = i/strand, ang = t*Math.PI*4 + s*Math.PI;
        pts.push({x:Math.cos(ang)*R + rnd(-.04,.04), y:-1.05 + t*2.1, z:Math.sin(ang)*R + rnd(-.04,.04)}); }
      const rungs = 16, per = Math.floor((n - pts.length)/rungs);
      for (let k = 0; k < rungs; k++){ const t = (k + .5)/rungs, ang = t*Math.PI*4, y = -1.05 + t*2.1;
        for (let i = 0; i < per; i++){ const q = i/(per - 1)*2 - 1; pts.push({x:Math.cos(ang)*R*q, y:y + rnd(-.015,.015), z:Math.sin(ang)*R*q}); } }
      return fill(pts, n); } },
  { name:'planeta', color:'#c89bff', make(n){ const pts = sphere(Math.floor(n*.58), .6), t = .42, ring = n - pts.length;
      for (let i = 0; i < ring; i++){ const a = Math.random()*Math.PI*2, r = .82 + Math.random()*.36, x = Math.cos(a)*r, z = Math.sin(a)*r, y = rnd(-.015,.015);
        pts.push({x, y:y*Math.cos(t) - z*Math.sin(t), z:y*Math.sin(t) + z*Math.cos(t)}); }
      return pts; } },
  { name:'estrela', color:'#ff6fb5', make(n){ return fromDrawing(g => { g.beginPath();
      for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, r = i % 2 ? .44 : 1.05; g.lineTo(Math.cos(a)*r, Math.sin(a)*r); }
      g.closePath(); g.fill(); }, n, .34); } },
  { name:'galáxia', color:'#9ad7ff', make(n){ const pts = [], arms = 3, t = .9, core = Math.floor(n*.18);
      for (const q of sphere(core, .2)) pts.push(q);
      for (let i = pts.length; i < n; i++){ const arm = i % arms, k = Math.random(), r = .18 + k*.95, a = arm/arms*Math.PI*2 + k*3.6 + rnd(-.18,.18)*(1 - k*.5);
        const x = Math.cos(a)*r, z = Math.sin(a)*r, y = rnd(-.05,.05)*(1 - k);
        pts.push({x, y:y*Math.cos(t) - z*Math.sin(t), z:y*Math.sin(t) + z*Math.cos(t)}); }
      return pts; } },
];
GEO.forEach(g => g.pts = g.make(N));

/* ---------- desenhos 8-bit (os mesmos da página de traduções legado) ---------- */
const ART = {
  stop:{ pal:{W:'#f2f2f2',R:'#e3262f',r:'#b3141c',G:'#8a8f99'}, rows:[
    '.....WWWWWW.....','....WRRRRRRW....','...WRRRRRRRRW...','..WRRRRRRRRRRW..','.WRRRRRRRRRRRRW.','WRRRRRRRRRRRRRRW',
    'WRRWWWWWWWWWWRRW','WRRWWWWWWWWWWRRW','WRRWWWWWWWWWWRRW','WRRRRRRRRRRRRRRW','.WrRRRRRRRRRRrW.','..WrRRRRRRRRrW..',
    '...WrrRRRRrrW...','....WrrrrrrW....','.....WWWWWW.....','.......GG.......','.......GG.......','.......GG.......']},
  human:{ pal:{H:'#5b3a1e',S:'#f1c08b',K:'#111',M:'#c2604a',B:'#3d7bff',b:'#2a56b8',D:'#3a3f55',F:'#222'}, rows:[
    '......HHHH......','.....HHHHHH.....','....HHHHHHHH....','....HSSSSSSH....','....SKSSSSKS....','....SSSSSSSS....',
    '.....SSMMSS.....','......SSSS......','...BBBBBBBBBB...','..BBBBBBBBBBBB..','..SBBBBBBBBBBS..','..SBBbBBBBbBBS..',
    '..S.BBBBBBBB.S..','....BBBBBBBB....','....DDDD.DDD....','....DDD..DDD....','....DDD..DDD....','...FFFF..FFFF...']},
  paw:{ pal:{P:'#ff8fc7',p:'#ffc4e1',D:'#d1609a'}, rows:[
    '.....PPP...PPP.....','....PpPPP.PpPPP....','....PPPPP.PPPPP....','.PP..PPP...PPP..PP.','PpPP...........PpPP',
    'PPPP...........PPPP','.PPD....PPP....DPP.','.......PpPPP.......','.....PPpPPPPPP.....','....PPPPPPPPPPP....',
    '...PPPPPPPPPPPPP...','...PPPPPPPPPPPPP...','....PPPPPPPPPPP....','.....DPPP.PPPD.....']},
  progress:{ pal:{T:'#1a3fbf',t:'#5577e6',W:'#fff',X:'#c0c0c0',L:'#c0c0c0',K:'#404040',b:'#1a3fbf',H:'#ffffff'}, rows:[
    'TTTTTTTTTTTTTTTTTTTTTT','TtttttttttttttttXXXXXX','TTTTTTTTTTTTTTTTXKXXKX','LLLLLLLLLLLLLLLLLLLLLL','LHHHHHHHHHHHHHHHHHHHHL',
    'LH..................HL','LH.KKKKKKKKKKKKKKKK.HL','LH.Kbb.bb.bb.bb...K.HL','LH.Kbb.bb.bb.bb...K.HL','LH.KKKKKKKKKKKKKKKK.HL',
    'LH..................HL','LHHHHHHHHHHHHHHHHHHHHL','LLLLLLLLLLLLLLLLLLLLLL']},
  arrows:{ pal:{A:'#c77dff',B:'#4dd2ff',C:'#7dff6a',D:'#ff5c8a'}, rows:[
    '...A.......BBB..','..AA.......BBB..','.AAAAAA....BBB..','AAAAAAA..BBBBBBB','.AAAAAA...BBBBB.','..AA.......BBB..','...A........B...',
    '................',
    '...C........D...','..CCC.......DD..','.CCCCC..DDDDDD..','CCCCCCC.DDDDDDD.','..CCC...DDDDDD..','..CCC.......DD..','..CCC.......D...']},
  star:{ pal:{Y:'#ffe066',y:'#e0a800',W:'#fff8c4'}, rows:[
    '.......Y.......','.......Y.......','......YWY......','......YWY......','.....YYYYY.....','YYYYYYYYYYYYYYY',
    '.YYYYYYYYYYYYY.','..YYYYYYYYYYY..','...YYYYYYYYY...','...yYYYYYYYy...','..yYYYY.YYYYy..','..yYYy...yYYy..','.yYy.......yYy.','.yy.........yy.']},
  bomb:{ pal:{K:'#3c4058',k:'#262838',H:'#9aa3c7',F:'#ffe066',O:'#ff7a1a',W:'#c8a46e'}, rows:[
    '..........F.O.','.........FOF..','........W.F...','.......W......','......W.......','....KKKK......',
    '..KKKKKKKK....','.KKHHKKKKKK...','KKHHKKKKKKKK..','KKHKKKKKKKKK..','KKKKKKKKKKKk..','KKKKKKKKKKKk..',
    '.KKKKKKKKKk...','.kKKKKKKKkk...','..kkKKKKkk....','....kkkk......']},
  goop:{ pal:{G:'#5fe34a',L:'#c7ff9e',D:'#2f9e2a',K:'#0b1a0b',W:'#ffffff'}, rows:[
    '.......GG.......','......GGGG......','.....GGLGGG.....','....GGLLGGGG....','...GGGGGGGGGG...','..GGGGGGGGGGGG..',
    '..GGKKGGGGKKGG..','.GGGKWGGGGKWGGG.','.GGGKKGGGGKKGGG.','GGGGGGGGGGGGGGGG','GGGGGGDDDDGGGGGG','GGGGGGGDDGGGGGGG',
    '.GGGGGGGGGGGGGG.','DDGGDDGGGGDDGGDD','.D..DD.DD.DD..D.']},
  card:{ pal:{K:'#8a8f99',W:'#f4f4f4',R:'#e3262f',P:'#ff8fc7'}, rows:[
    '.KKKKKKKKKKKK....','KWWWWWWWWWWWWK...','KWRWWWWWWWWWWK...','KWWWWWWWWWWWWK...','KWWRRWWWRRWWWK...','KWRRRRWRRRRWWK...',
    'KWRRRRRRRRRWWK...','KWWRRRRRRRWWWK.PP','KWWWRRRRRWWWWKPPPP','KWWWWRRRWWWWWKPPPP','KWWWWWRWWWWWWK.PP.',
    'KWWWWWWWWWWRWK..P.','KWWWWWWWWWWWWK....','.KKKKKKKKKKKK.....']},
  floppy:{ pal:{B:'#3d4a6b',b:'#2a3450',M:'#b8bcc6',m:'#8a8f99',L:'#ecebe4',l:'#9aa4b2'}, rows:[
    'BBBMMMMMMMMMMBBB.','BBBMMMMmmMMMMBBBB','BBBMMMMmmMMMMBBBB','BBBMMMMmmMMMMBBBB','BBBMMMMMMMMMMBBBB','BBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBB','BBLLLLLLLLLLLLLBB','BBLlllllllllllLBB','BBLLLLLLLLLLLLLBB','BBLlllllllLLLLLBB','BBLLLLLLLLLLLLLBB','bbLLLLLLLLLLLLLbb']},
  adult:{ pal:{R:'#ff5555'}, rows:[
    '.R...RRR.......','RR..R...R...R..','.R..R...R...R..','.R...RRR..RRRRR','.R..R...R...R..','.R..R...R...R..','RRR..RRR.......']},
};
ART.narrator = { pal:{K:'#8a8f99',W:'#f4f4f4',Y:'#e0a800',H:'#5b3a1e',S:'#f1c08b',k:'#111',B:'#c0392b',D:'#3a3f55'}, rows:[
  '....KKKKKKKKKKKK....','...KWWWWWYYWWWWWK...','...KWWWWWYYWWWWWK...','...KWWWWWYYWWWWWK...','...KWWWWWWWWWWWWK...','...KWWWWWYYWWWWWK...',
  '....KKKKKWKKKKKK....','........KWK.........','........KK..........','.......HHHH.........','......HSSSSH........','......SkSSkS........',
  '......SSSSSS........','.......SSSS.........','.....BBBBBBBB.......','.....SBBBBBBS.......','......BBBBBB........','......DD..DD........']};
ART.gamepad = (() => {
  const rows = [
    '..........O.O.........','.........OFOFO........','..........FYF.........',
    '....KKKKKKKKKKKKKK....','..KKKKKKKKKKKKKKKKKK..','.KKKKGKKKKKKKKKKRKKKK.','KKKGGGKKKKKKKKKYKBKKKK','KKKKGKKKKMKKMKKKGKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKK','KKKKKKKKKKKKKKKKKKKKKK','KKKKKK..........KKKKKK','.KKKK............KKKK.','..KK..............KK..'].map(r => [...r]);
  [[3,11],[4,10],[5,11],[6,12],[7,11],[8,12],[9,11]].forEach(([y,x]) => rows[y][x] = '.');
  return { pal:{K:'#4a4f6a',G:'#c9cde0',M:'#8a8f99',R:'#e3262f',Y:'#ffd23f',B:'#4f7dff',O:'#ff7a1a',F:'#ffb000'}, rows:rows.map(r => r.join('')) };
})();
ART.goopring = (() => {
  const W = 20, H = 18, cx = 9.5, cy = 8.5, rows = [];
  for (let y = 0; y < H; y++){ let r = '';
    for (let x = 0; x < W; x++){
      const d = Math.hypot(x - cx, (y - cy)*1.05), a = Math.atan2(y - cy, x - cx);
      if (d <= 8.6 && d >= 4.6){ r += (d > 7.2 && a < -1.2 && a > -2.9) ? 'L' : (d < 5.8 && a > .2 && a < 2.6) ? 'D' : (a > .3 && a < 1.6 && d > 7.4) ? 'D' : 'G'; }
      else if ((x === 7 && y === 17) || (x === 12 && (y === 17)) || (x === 13 && y === 16)) r += 'G';
      else r += '.';
    } rows.push(r); }
  return { pal:{G:'#5fe34a',L:'#c7ff9e',D:'#2f9e2a'}, rows };
})();
ART.letter = (() => {
  const W = 25, H = 17, c = (W-1)/2, rows = [];
  const heart = ['.RR.RR.','RRRRRRR','RRRRRRR','.RRRRR.','..RRR..','...R...'];
  for (let y = 0; y < H; y++){ let r = '';
    for (let x = 0; x < W; x++){
      const hy = y - 7, hx = x - (c - 3);
      if (hy >= 0 && hy < heart.length && hx >= 0 && hx < 7 && heart[hy][hx] === 'R'){ r += (hy < 2 && (hx === 1 || hx === 4)) ? 'P' : 'R'; continue; }
      const edge = x === 0 || x === W-1 || y === 0 || y === H-1;
      const flap = y <= 9 && Math.abs(Math.abs(x - c) - (c - y*c/9)) < .75;
      const low = y >= 11 && Math.abs(Math.abs(x - c) - ((y - 11)*c/(H - 12)) - 2) < .6 && Math.abs(x - c) > 5;
      r += edge || flap ? 'w' : low ? 's' : 'W';
    } rows.push(r); }
  return { pal:{W:'#f3ead7', w:'#a8977a', s:'#d6c8ad', R:'#e3262f', P:'#ff8a8a'}, rows };
})();
// UNBEATABLE: placa de "proibido música" — no jogo, a música é proibida
ART.proibido = (() => {
  const S = 21, c = 10, rows = [];
  const note = ['...KKKKKKKK','...KKKKKKKK','...K......K','...K......K','...K......K','...K......K','...K......K','.KKK....KKK','KKKK...KKKK','KKKK...KKKK','.KK.....KK.'];
  for (let y = 0; y < S; y++){ let r = '';
    for (let x = 0; x < S; x++){
      const d = Math.hypot(x - c, y - c);
      if (d > 10.4) r += '.';
      else if (d > 8.6) r += (x + y > 2*c + 4) ? 'r' : 'R';                 // aro (sombra embaixo à direita)
      else if (d > 7.9) r += '.';
      else if (Math.abs(x - y) <= 1.2) r += 'R';                             // a faixa
      else { const ny = y - 5, nx = x - 5; r += (ny >= 0 && ny < note.length && nx >= 0 && nx < 11 && note[ny][nx] === 'K') ? 'W' : '.'; }
    } rows.push(r); }
  return { pal:{R:'#ff2d55', r:'#b3143a', W:'#f4f4f4'}, rows };
})();
const DEEP = 'data:image/png;base64,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';

const hex6 = c => c.length === 4 ? '#' + [...c.slice(1)].map(h => h + h).join('') : c;
const toHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const q32 = v => Math.min(255, Math.round(v/32)*32);
// cada pixel vira um montinho de bolinhas na cor dele
function cellsToPts(cells, w, h, n){
  const u = 2.15/Math.max(w, h), per = Math.floor(n/cells.length), out = [];
  for (let i = 0; i < n; i++){
    const [x, y, c] = i < cells.length*per ? cells[i % cells.length] : cells[(Math.random()*cells.length)|0];
    out.push({x:(x + .5 - w/2)*u + rnd(-.46,.46)*u, y:-(y + .5 - h/2)*u + rnd(-.46,.46)*u, z:rnd(-.3,.3)*u, c});
  }
  return out;
}
function artCells(a){
  const cells = [], h = a.rows.length, w = Math.max(...a.rows.map(r => r.length));
  a.rows.forEach((r, y) => [...r].forEach((ch, x) => { const c = a.pal[ch]; if (c) cells.push([x, y, hex6(c)]); }));
  return {cells, w, h};
}
const pixelPoints = (a, n) => { const {cells, w, h} = artCells(a); return cellsToPts(cells, w, h, n); };
const imgCells = {};
function imageCells(src){
  return imgCells[src] ??= new Promise(res => { const im = new Image(); im.onload = () => {
    const k = Math.min(1, 56/im.width, 36/im.height), w = Math.round(im.width*k), h = Math.round(im.height*k);
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(im, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data, cells = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){ const i = (y*w + x)*4; if (d[i+3] < 100) continue;
      cells.push([x, y, toHex(q32(d[i]), q32(d[i+1]), q32(d[i+2]))]); }
    res({cells, w, h}); }; im.onerror = () => res(null); im.src = src; });
}

/* ---------- catálogo: tudo o que as bolinhas sabem virar ---------- */
const CATS = {say:'Saudações', proj:'Projetos', old:'Descartados', geo:'Formas 3D', bit:'8-bit', new:'Novos'};
const ITEMS = [];
const add = (id, name, sub, cat, color, make, opt = {}) => ITEMS.push({id, name, sub, cat, color:hex6(color), make, front:true, ...opt});

[['oi','Oi!','português'],['hello','Hello!','english'],['ja','こんにちは','日本語'],['zh','你好!','中文'],['kaua','Kauã!','o site'],
 ['hola','¡Hola!','español'],['ciao','Ciao!','italiano'],['salut','Salut!','français'],['hallo','Hallo!','deutsch']]
  .forEach(([id, w, l]) => add('say-' + id, w, 'balão · ' + l, id === 'oi' ? 'say' : 'old', '#ffffff', () => bubbleWith(w)));

// projetos: cada linha da lista (sem os menus) vira uma forma
const LEAVES = [];
PROJETOS.forEach(g => g.items.forEach(p => (p.children || [p]).forEach(c => LEAVES.push(c))));
const SUBS = {phone:'celular com o 8', proibido:'placa de proibido música', katamari:'bola com tralhas', heart:'coração', clock:'relógio', bell:'sino', vx:'logo VX com o pontinho', floppy:'disquete', gear:'engrenagem'};
LEAVES.forEach(p => add('p-' + p.key, p.name, SUBS[p.art || p.shape] || '', 'proj', p.color,
  p.art ? n => pixelPoints(ART[p.art], n) : n => SHAPES[p.shape](n), {art:p.art, front:!p.spin, spin:!!p.spin, project:p}));

[['cassette','UNBEATABLE','fita K7 (antes da placa)','#ff4d6d'], ['notes','UNBEATABLE','notas musicais (a primeira)','#ff4d6d'],
 ['shh','Hush Hush','balão “shh…” (antes do relógio)','#a78bfa'], ['gem','HuniePop 2','diamante (antes do sino)','#ffd23f'],
 ['mic','VoxStage','microfone (antes do VX)','#d4fb69']]
  .forEach(([s, name, sub, c]) => add('old-' + s, name, sub, 'old', c, n => SHAPES[s](n)));

GEO.forEach(g => add('geo-' + g.name, g.name[0].toUpperCase() + g.name.slice(1), 'gira sozinha', 'geo', g.color, () => g.pts, {front:false}));

add('new-esfera', 'Esfera', 'a bolona do começo', 'new', '#ffffff', n => sphere(n), {front:false});
add('new-mobius', 'Fita de Möbius', 'um lado só', 'new', '#ffa8e0', n => { const pts = [];
  for (let i = 0; i < n; i++){ const u = i/n*Math.PI*2, v = rnd(-.32,.32), r = .78 + v*Math.cos(u/2);
    pts.push({x:r*Math.cos(u), y:v*Math.sin(u/2) + rnd(-.01,.01), z:r*Math.sin(u)}); }
  return pts.map(p => ({x:p.x, y:p.y*Math.cos(.5) - p.z*Math.sin(.5), z:p.y*Math.sin(.5) + p.z*Math.cos(.5)})); }, {front:false});
add('new-onda', 'Onda', 'uma folha balançando', 'new', '#5ce1e6', n => { const pts = [], m = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < m; i++) for (let j = 0; j < m; j++){ const x = (i/(m-1)*2 - 1)*.95, z = (j/(m-1)*2 - 1)*.95, y = Math.sin(x*3.2)*Math.cos(z*3.2)*.22 - .1;
    pts.push({x, y:y*Math.cos(.55) - z*Math.sin(.55), z:y*Math.sin(.55) + z*Math.cos(.55)}); }
  return fill(pts, n); }, {front:false});
add('new-dado', 'Dado', 'cubo com as bolinhas do 5', 'new', '#f4f4f4', () => { const pts = GEO[0].pts.map(p => ({...p, c:'#f4f4f4'})), a = .72;
  const pips = [[0,0],[-.38,-.38],[.38,.38],[-.38,.38],[.38,-.38]];
  for (const p of pts) for (const [u, v] of pips) if (Math.abs(p.z - a) < .02 && Math.hypot(p.x - u, p.y - v) < .14) p.c = '#e3262f';
  return pts; }, {front:false});

[['stop','Dude, Stop','placa de pare','#e3262f'], ['human','Human Simulator','pessoinha','#3d7bff'], ['paw','Mosaique Neko Waifus','patinha','#ff8fc7'],
 ['progress','Progressbar95','janela de progresso','#4f7dff'], ['arrows','Old School Musical','setas de ritmo','#c77dff'], ['narrator','Protagonism','o narrador falando','#ffe066'],
 ['gamepad','Indiecalypse','controle pegando fogo','#ff8a3d'], ['goopring','Goop Loop','anel de gosma','#5fe34a'], ['goop','Goop Loop','gosminha (rascunho)','#5fe34a'],
 ['card','AURA: Hentai Cards','carta','#ff4d6d'], ['bomb','Legado','bomba (rascunho)','#ff7a1a'], ['star','Legado','estrela (rascunho)','#ffe066'],
 ['floppy','Legado','disquete 8-bit','#3d4a6b'], ['letter','Legado','a cartinha do LEIA-ME','#e3262f'], ['adult','Legado','o 18 da censura','#ff5555']]
  .forEach(([a, name, sub, c]) => add('bit-' + a, name, sub, 'bit', c, n => pixelPoints(ART[a], n), {art:a}));
add('bit-deep', 'Deep Space Waifu', 'ícone do jogo, em pixels', 'bit', '#ffd23f', n => imageCells(DEEP).then(r => r ? cellsToPts(r.cells, r.w, r.h, n) : sphere(n)), {img:DEEP});

const byId = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const ptsCache = new Map();
const ptsOf = it => { if (!ptsCache.has(it.id)) ptsCache.set(it.id, Promise.resolve(it.make(N))); return ptsCache.get(it.id); };

/* ---------- configurações (escolhidas no Labs, valem para a inicial também) ---------- */
// rotação padrão: saudação/forma, projeto, saudação/forma, projeto...
const DEF = ['say-oi','p-jackbox8','geo-cubo','p-unbeatable','geo-toro','p-katamari','geo-pirâmide','p-date','geo-hélice dupla','p-hush',
             'geo-planeta','p-hunie2','geo-estrela','p-voxstage','geo-galáxia','p-legado','p-labs'];
const KEY = 'bolinhas-config-v2';
const STYLES = {esferas:'Esferas', pixels:'Pixels', neon:'Neon'};
const VIEWS = {bolinhas:'Bolinhas', monitor:'Monitor 8-bit'};
const defaults = () => ({order:[...DEF, ...ITEMS.map(i => i.id).filter(id => !DEF.includes(id))], on:[...DEF], speed:3.4, style:'esferas', view:'bolinhas'});
function loadConfig(){
  let c = null; try { c = JSON.parse(localStorage.getItem(KEY)); } catch(e){}
  const d = defaults();
  if (!c || !Array.isArray(c.order)) return d;
  c.order = c.order.filter(id => byId[id]); ITEMS.forEach(i => { if (!c.order.includes(i.id)) c.order.push(i.id); });
  c.on = (Array.isArray(c.on) ? c.on : d.on).filter(id => byId[id]);
  if (!(c.speed >= 1.2 && c.speed <= 8)) c.speed = d.speed;
  if (!STYLES[c.style]) c.style = d.style;
  if (!VIEWS[c.view]) c.view = d.view;
  return c;
}
const saveConfig = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch(e){} };
const rotationList = c => c.order.filter(id => c.on.includes(id)).map(id => byId[id]);

/* ---------- motor das bolinhas ---------- */
const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
function vxDot(t){   // pontinho do logo VX: mesmo caminho e tempo da animação do app
  const T = 2.6, u = (((t % T) + T) % T)/T;
  const k = u < .38 ? ease(u/.38)*.5 : u < .5 ? .5 : u < .88 ? .5 + ease((u - .5)/.38)*.5 : 1;
  const [A, B, s] = k <= .5 ? [39, 75, k*2] : [75, 39, (k - .5)*2];
  const x = (1-s)*(1-s)*A + 2*(1-s)*s*57 + s*s*B, y = (1-s)*(1-s)*35 + 2*(1-s)*s*5 + s*s*35;
  return [(x - 55)/26, -(y - 51)/26];
}
const glows = {};
function glowSprite(color){
  if (glows[color]) return glows[color];
  const SP = 64, c = document.createElement('canvas'); c.width = c.height = SP; const g = c.getContext('2d'), r = SP/2;
  const n = parseInt(color.slice(1), 16), rgb = `${n>>16},${n>>8&255},${n&255}`, grd = g.createRadialGradient(r, r, 0, r, r, r);
  grd.addColorStop(0, '#fff'); grd.addColorStop(.18, `rgba(${rgb},1)`); grd.addColorStop(.5, `rgba(${rgb},.25)`); grd.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grd; g.fillRect(0, 0, SP, SP); return glows[color] = c;
}

function particles(canvas){
  const ctx = canvas.getContext('2d'), WHITE = '#ffffff', SPHERE = sphere(N);
  const P = SPHERE.map(p => ({fx:p.x, fy:p.y, fz:p.z, tx:p.x, ty:p.y, tz:p.z, x:p.x, y:p.y, z:p.z, d:0, ph:Math.random()*6.28, sa:WHITE, sb:WHITE}));
  let morphT = 1, morphDur = 1.7, faceFront = false, spin = false, glowColor = WHITE, idle = true, cur = null;
  let ry = 0, rz = 0, vxActive = false;
  const api = {style:'esferas', active:true};

  function morphTo(target, color, dur){
    const key = p => p.x + p.y*.25;
    const cp = P.slice().sort((a,b) => key(a) - key(b)), tg = target.slice().sort((a,b) => key(a) - key(b));
    const spread = dur < 1.5 ? .2 : .3;
    cp.forEach((p,i) => { p.sa = p.k > .5 ? p.sb : p.sa; p.fx = p.x; p.fy = p.y; p.fz = p.z;
      p.tx = tg[i].x; p.ty = tg[i].y; p.tz = tg[i].z; p.sb = tg[i].c || color; p.d = (i/N)*spread + Math.random()*.1; p.k = 0;
      p.dot = tg[i].dot ?? -1; p.lag = tg[i].lag || 0; p.ox = tg[i].ox; p.oy = tg[i].oy; p.oz = tg[i].oz; });
    vxActive = target.some(q => q.dot != null);
    morphT = 0; morphDur = dur;
  }
  api.show = async (it, dur = 1.5) => {
    cur = it; const pts = await ptsOf(it); if (cur !== it) return;
    idle = false; faceFront = it.front; spin = !!it.spin; glowColor = it.color; morphTo(pts, it.color, dur);
  };
  api.sphere = (dur = 1.3) => { cur = null; idle = true; faceFront = false; spin = false; glowColor = WHITE; morphTo(SPHERE, WHITE, dur); };

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); if (!r.width) return;
    tmx = Math.max(-1, Math.min(1, ((e.clientX - r.left)/r.width - .5)*2)); tmy = Math.max(-1, Math.min(1, ((e.clientY - r.top)/r.height - .5)*2)); });
  let W = 0, H = 0;
  function resize(){ const dpr = Math.min(devicePixelRatio || 1, 2); W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W*dpr; canvas.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
  addEventListener('resize', resize); api.resize = resize;

  const order = new Array(N), TAU = Math.PI*2, nearest = v => Math.round(v/TAU)*TAU;
  let last = 0, time = 0;
  function frame(now){
    requestAnimationFrame(frame);
    const dt = Math.min((now - last)/1000, .05); last = now; time += dt;
    if (!api.active) return;
    if (canvas.clientWidth !== W || canvas.clientHeight !== H) resize();
    mx += (tmx - mx)*.05; my += (tmy - my)*.05;
    if (morphT < 1) morphT = Math.min(1, morphT + dt/morphDur);

    if (!faceFront) ry += dt*(spin ? .9 : .45); else ry += (nearest(ry) - ry)*Math.min(1, dt*2.6);
    if (spin) rz += dt*.6; else rz += (nearest(rz) - rz)*Math.min(1, dt*2);
    const wob = faceFront ? Math.sin(time*1.3)*.1 : 0;
    const a = ry + wob + mx*.35, b = -.18 + my*.25 + (faceFront ? Math.sin(time*.9)*.05 : 0);
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cz = Math.cos(rz), sz = Math.sin(rz);

    const S = Math.min(W, H) * (W < 600 ? .3 : .33), cx = W/2, cy = H/2 - H*.04;
    const spread = morphDur < 1.5 ? .2 : .3, win = 1 - spread - .1;
    if (vxActive) for (const p of P) if (p.dot >= 0){ const c = vxDot(time - p.lag); p.tx = c[0] + p.ox; p.ty = c[1] + p.oy; p.tz = p.oz; }
    for (let i = 0; i < N; i++){
      const p = P[i];
      const k = p.k = ease(Math.max(0, Math.min(1, (morphT - p.d)/win)));
      const burst = Math.sin(k*Math.PI) * .3;
      p.x = p.fx + (p.tx - p.fx)*k; p.y = p.fy + (p.ty - p.fy)*k; p.z = p.fz + (p.tz - p.fz)*k;
      const br = 1 + burst*.6 + (idle && morphT >= 1 ? Math.sin(time*2 + p.ph)*.012 : 0);
      let x = p.x*br, y = p.y*br, z = p.z*br + burst*Math.sin(p.ph)*.4;
      const x0 = x*cz - y*sz, y0 = x*sz + y*cz;
      const x1 = x0*ca - z*sa, z1 = x0*sa + z*ca;
      const y1 = y0*cb - z1*sb, z2 = y0*sb + z1*cb;
      const f = 3.4/(3.4 - z2);
      p.sx = cx + x1*S*f; p.sy = cy - y1*S*f; p.sz = z2; p.sf = f;
      order[i] = i;
    }
    order.sort((i,j) => P[i].sz - P[j].sz);

    ctx.clearRect(0,0,W,H);
    const n = parseInt(glowColor.slice(1),16);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, S*1.6);
    glow.addColorStop(0, `rgba(${n>>16},${n>>8&255},${n&255},${glowColor !== WHITE ? .1 : .06})`); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);

    const base = S*.055, small = !idle && morphT > .6 ? .82 : 1, sty = api.style;
    if (sty === 'neon') ctx.globalCompositeOperation = 'lighter';
    for (let j = 0; j < N; j++){
      const p = P[order[j]], s = base*p.sf*small, col = p.k > .5 ? p.sb : p.sa;
      const al = Math.max(.12, Math.min(1, .55 + p.sz*.5));
      if (sty === 'pixels'){ ctx.globalAlpha = al; ctx.fillStyle = col; const q2 = Math.max(2, Math.round(s*.82)); ctx.fillRect(Math.round(p.sx - q2/2), Math.round(p.sy - q2/2), q2, q2); }
      else if (sty === 'neon'){ ctx.globalAlpha = al*.55; const s2 = s*1.9; ctx.drawImage(glowSprite(col), p.sx - s2/2, p.sy - s2/2, s2, s2); }
      else { ctx.globalAlpha = al; ctx.drawImage(sprite(col), p.sx - s/2, p.sy - s/2, s, s); }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  resize(); requestAnimationFrame(t => { last = t; frame(t); });
  return api;
}

/* ---------- monitor 8-bit (o mesmo da página legado) ---------- */
const GW = 60, GH = 40;
// forma de bolinhas -> grade de pixels: projeta de frente e guarda a bolinha mais próxima de cada pixel
function ptsGrid(pts, it){
  const g = new Array(GW*GH).fill(null), zb = new Float32Array(GW*GH).fill(-9), sc = (GH - 9)/2.3;
  const ya = it.front ? 0 : .55, pa = it.front ? 0 : -.32, cy = Math.cos(ya), sy = Math.sin(ya), cp = Math.cos(pa), sp = Math.sin(pa);
  for (const p of pts){
    const x1 = p.x*cy - p.z*sy, z1 = p.x*sy + p.z*cy, y1 = p.y*cp - z1*sp, z2 = p.y*sp + z1*cp;
    const gx = Math.round(GW/2 + x1*sc - .5), gy = Math.round(GH/2 - 3 - y1*sc);
    if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) continue;
    const i = gy*GW + gx; if (z2 <= zb[i]) continue;
    zb[i] = z2; const n = parseInt((p.c || it.color).slice(1), 16), k = Math.max(.35, Math.min(1, .72 + z2*.35));
    g[i] = toHex((n>>16)*k, (n>>8&255)*k, (n&255)*k);
  }
  // tapa os buraquinhos entre bolinhas
  const out = g.slice();
  for (let y = 1; y < GH-1; y++) for (let x = 1; x < GW-1; x++){ const i = y*GW + x; if (g[i]) continue;
    const nb = [g[i-1], g[i+1], g[i-GW], g[i+GW]].filter(Boolean); if (nb.length >= 3) out[i] = nb[0]; }
  return out;
}
function cellsGrid({cells, w, h}){
  const s = Math.max(1, Math.floor(Math.min((GW-4)/w, (GH-4)/h))), ox = Math.floor((GW - w*s)/2), oy = Math.max(0, Math.floor((GH - h*s)/2) - 2);
  const g = new Array(GW*GH).fill(null);
  for (const [x, y, c] of cells) for (let yy = 0; yy < s; yy++) for (let xx = 0; xx < s; xx++) g[(oy + y*s + yy)*GW + ox + x*s + xx] = c;
  return g;
}
const gridCache = new Map();
function gridOf(it){
  if (!gridCache.has(it.id)) gridCache.set(it.id,
    it.art ? Promise.resolve(cellsGrid(artCells(ART[it.art]))) :
    it.img ? imageCells(it.img).then(r => r ? cellsGrid(r) : cellsGrid(artCells(ART.floppy))) :
    ptsOf(it).then(pts => ptsGrid(pts, it)));
  return gridCache.get(it.id);
}

const MONITOR_HTML = `<div class="crt"><div class="glow"></div><div class="bezel">
  <div class="inset"><div class="screen"><canvas class="scr"></canvas><div class="status"></div></div></div>
  <span class="brand"><b>KAUÃ</b>-TRON 95</span><span class="knobs"><i></i><i></i><i class="led"></i></span></div></div>`;
function monitor(root){
  root.classList.add('bmon'); root.innerHTML = MONITOR_HTML;
  const scr = root.querySelector('.scr'), sx = scr.getContext('2d'), statusEl = root.querySelector('.status'), glowEl = root.querySelector('.glow');
  const NC = GW*GH, cur = new Array(NC).fill(null), tgt = new Array(NC).fill(null), dly = new Float32Array(NC);
  const SCR = '#%&@$?!*+=<>/\\|{}[]01ABCDEFXYZ▓▒░';
  let t0 = 0, animating = false, cell = 8, shown = null;
  const lumCache = {};
  const L = c => lumCache[c] ??= (() => { const n = parseInt(c.slice(1),16); return ((n>>16)*.3 + (n>>8&255)*.59 + (n&255)*.11)/255; })();

  function resize(){
    const r = scr.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); if (!r.width) return;
    scr.width = r.width*dpr; scr.height = r.height*dpr; sx.setTransform(dpr,0,0,dpr,0,0);
    cell = Math.min(r.width/GW, r.height/GH); draw(performance.now());
  }
  function draw(now){
    const r = scr.getBoundingClientRect(), W = r.width, H = r.height;
    const ox = (W - cell*GW)/2, oy = (H - cell*GH)/2, t = (now - t0)/1000;
    sx.clearRect(0,0,W,H);
    sx.font = `${cell*1.35}px VT323, monospace`; sx.textAlign = 'center'; sx.textBaseline = 'middle';
    let busy = false;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++){
      const i = y*GW + x, px = ox + x*cell, py = oy + y*cell;
      let c = cur[i], scramble = false;
      if (animating){ const d = dly[i]; if (t < d){ c = cur[i]; busy = true; } else if (t < d + .14){ c = tgt[i] || cur[i]; scramble = !!c; busy = true; } else c = tgt[i]; }
      if (!c){ sx.fillStyle = '#16301c'; sx.fillRect(px + cell*.45, py + cell*.45, Math.max(1, cell*.12), Math.max(1, cell*.12)); continue; }
      sx.shadowColor = c; sx.shadowBlur = cell*.6;
      if (scramble){ sx.fillStyle = c; sx.fillText(SCR[Math.random()*SCR.length|0], px + cell/2, py + cell/2); sx.shadowBlur = 0; continue; }
      sx.fillStyle = c; sx.fillRect(px + .5, py + .5, cell - 1, cell - 1);
      sx.shadowBlur = 0;
      const l = L(c);   // textura de "caractere" ▓ ▒ nas cores mais escuras
      if (l < .55){ sx.fillStyle = 'rgba(0,0,0,.28)'; const q = cell/4; for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) if ((a + b) % 2 === (l < .3 ? 0 : (a % 2))) sx.fillRect(px + a*q + .5, py + b*q + .5, q*.6, q*.6); }
    }
    sx.shadowBlur = 0;
    if (animating && !busy){ animating = false; for (let i = 0; i < NC; i++) cur[i] = tgt[i]; }
    if (animating) requestAnimationFrame(draw);
  }
  let typeTimer = 0;
  function typeStatus(text){
    clearInterval(typeTimer); let k = 0; const base = 'C:\\BOLINHAS&gt; ';
    statusEl.innerHTML = base + '<span class="c"></span>';
    typeTimer = setInterval(() => { k++; statusEl.innerHTML = base + text.slice(0, k) + '<span class="c"></span>'; if (k >= text.length) clearInterval(typeTimer); }, 28);
  }
  const api = {};
  api.show = async it => {
    shown = it; const grid = await gridOf(it); if (shown !== it) return;
    for (let i = 0; i < NC; i++){ tgt[i] = grid[i]; dly[i] = ((i / GW)|0)*.012 + Math.random()*.12; }
    t0 = performance.now(); const wasIdle = !animating; animating = true;
    glowEl.style.setProperty('--g', it.color + '33');
    typeStatus(it.name.toUpperCase().replace(/[<>&]/g, ''));
    if (wasIdle) requestAnimationFrame(draw);
  };
  api.resize = resize;
  addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(scr); else resize();
  return api;
}

/* ---------- rotação automática ---------- */
// passa pelos itens marcados na ordem escolhida; "hold" segura enquanto o mouse está num projeto
function rotation(getList, onShow, opts = {}){
  let idx = -1, t = 0, held = false, playing = opts.autoplay !== false, cur = null;
  const api = {};
  const wait = () => (opts.speed ? opts.speed() : 3.4) + (opts.extra ? opts.extra() : 1.5);
  api.next = () => { const list = getList(); if (!list.length) return;
    const i = cur ? list.indexOf(cur) : -1; idx = i >= 0 ? (i + 1) % list.length : Math.min(idx + 1, list.length - 1) % list.length;
    api.go(list[idx]); };
  api.go = it => { cur = it; t = 0; const list = getList(); const i = list.indexOf(it); if (i >= 0) idx = i; onShow(it, Math.max(0, list.indexOf(it))); };
  api.hold = v => { held = v; t = 0; };
  api.play = v => { playing = v; t = 0; };
  Object.defineProperty(api, 'cur', {get:() => cur});
  Object.defineProperty(api, 'playing', {get:() => playing});
  t = wait() - (opts.firstDelay ?? 1.6);
  setInterval(() => { if (!playing || held) return; t += .1; if (t > wait()) api.next(); }, 100);
  return api;
}

window.Bolinhas = { N, PROJETOS, LEAVES, ITEMS, byId, CATS, DEF, STYLES, VIEWS, KEY,
  loadConfig, saveConfig, defaults, rotationList, particles, monitor, rotation, ptsOf };

// as fontes do japonês e do chinês só entram se alguém usar essas saudações
const cjkReady = document.fonts ? Promise.all([document.fonts.load('800 170px "Noto Sans JP"', 'こんにちは'), document.fonts.load('800 170px "Noto Sans SC"', '你好')]).catch(() => {}) : Promise.resolve();
Bolinhas.ready = (document.fonts ? Promise.all([document.fonts.ready, cjkReady]) : Promise.resolve()).then(() => {});
})();
