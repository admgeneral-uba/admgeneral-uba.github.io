// Formatos del Tercer tiempo y utilidades compartidas (juego y área docente).
export const normal = s => String(s || "").toUpperCase().normalize("NFD").replace(/Ñ/g, "Ñ").replace(/[̀-ͯ]/g, "").replace(/[^A-ZÑ]/g, "");

export const TIPOS = {
  palabra: { nombre: "Palabra", desc: "Adiviná la palabra de la clase en 6 intentos." },
  conexiones: { nombre: "Conexiones", desc: "Armá 4 grupos de 4 conceptos relacionados." },
  sopa: { nombre: "Sopa de letras", desc: "Encontrá las palabras escondidas." },
  crucigrama: { nombre: "Mini crucigrama", desc: "Completá el crucigrama de la clase." },
  pistas: { nombre: "Pista a pista", desc: "Adiviná el concepto con la menor cantidad de pistas." }
};
export const ORDEN_TIPOS = ["palabra", "conexiones", "sopa", "pistas", "crucigrama"];
export const tipoDe = j => (j && j.tipo) || "palabra";

// Generador pseudoaleatorio con semilla: todos ven el mismo tablero.
export function rng(seed){
  let h = 1779033703 ^ String(seed).length;
  for(const ch of String(seed)){ h = Math.imul(h ^ ch.charCodeAt(0), 3432918353); h = h << 13 | h >>> 19; }
  let a = h >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function barajar(arr, r){ const a = [...arr]; for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Sopa de letras: horizontal, vertical y diagonales hacia abajo, todas de izquierda a derecha o de arriba abajo.
export function armarSopa(palabras, seed){
  const ws = palabras.map(normal).filter(Boolean).sort((a, b) => b.length - a.length);
  const N = Math.max(9, Math.min(12, (ws[0] || "").length + 1));
  const D = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  for(let intento = 0; intento < 60; intento++){
    const r = rng(seed + ":" + intento), g = Array.from({ length: N }, () => Array(N).fill("")), pos = {};
    let ok = true;
    for(const w of ws){
      let puesto = false;
      for(let t = 0; t < 300 && !puesto; t++){
        const [dr, dc] = D[Math.floor(r() * D.length)];
        const r0 = Math.floor(r() * N), c0 = Math.floor(r() * N), r1 = r0 + dr * (w.length - 1), c1 = c0 + dc * (w.length - 1);
        if(r1 < 0 || r1 >= N || c1 >= N) continue;
        let cabe = true;
        for(let i = 0; i < w.length; i++){ const x = g[r0 + dr * i][c0 + dc * i]; if(x && x !== w[i]){ cabe = false; break; } }
        if(!cabe) continue;
        for(let i = 0; i < w.length; i++) g[r0 + dr * i][c0 + dc * i] = w[i];
        pos[w] = [r0, c0, r1, c1]; puesto = true;
      }
      if(!puesto){ ok = false; break; }
    }
    if(!ok) continue;
    const AB = "AAAABCDEEEEFGHIIIJLLMNNÑOOOOPQRRSSSTTUUVZ";
    for(let i = 0; i < N; i++) for(let j = 0; j < N; j++) if(!g[i][j]) g[i][j] = AB[Math.floor(r() * AB.length)];
    return { N, grilla: g.map(f => f.join("")), pos, palabras: ws };
  }
  return null;
}

// Mini crucigrama: ubica las palabras cruzándolas; devuelve grilla recortada, numeración y pistas.
export function armarCrucigrama(lista, max = 11){
  const base = lista.map(x => ({ w: normal(x.palabra), pista: String(x.pista || "").trim() })).filter(x => x.w.length >= 2).sort((a, b) => b.w.length - a.w.length);
  if(!base.length) return null;
  const r = rng(base.map(x => x.w).join("")); let mejor = null;
  for(let t = 0; t < 120; t++){
    const x = armarUna(t === 0 ? base : barajar(base, r), max);
    const area = x.filas * x.cols, sc = -x.faltan.length * 10000 - area - Math.abs(x.filas - x.cols) * 4;
    if(!mejor || sc > mejor.sc) mejor = { sc, x };
  }
  return mejor.x;
}
function armarUna(items, max){
  const M = new Map(), K = (r, c) => r + "," + c, at = (r, c) => M.get(K(r, c));
  const colocadas = [];
  const poner = (it, r, c, d) => { const [dr, dc] = d === "h" ? [0, 1] : [1, 0]; for(let i = 0; i < it.w.length; i++){ const k = K(r + dr * i, c + dc * i), x = M.get(k) || { ch: it.w[i] }; x[d] = true; M.set(k, x); } colocadas.push({ ...it, r, c, d }); };
  const caja = () => { let a = 1e9, b = -1e9, e = 1e9, f = -1e9; for(const k of M.keys()){ const [r, c] = k.split(",").map(Number); a = Math.min(a, r); b = Math.max(b, r); e = Math.min(e, c); f = Math.max(f, c); } return [a, b, e, f]; };
  function evaluar(w, r, c, d){
    const [dr, dc] = d === "h" ? [0, 1] : [1, 0], [pr, pc] = d === "h" ? [1, 0] : [0, 1];
    if(at(r - dr, c - dc) || at(r + dr * w.length, c + dc * w.length)) return -1;
    let cruces = 0;
    for(let i = 0; i < w.length; i++){
      const rr = r + dr * i, cc = c + dc * i, x = at(rr, cc);
      if(x){ if(x.ch !== w[i] || x[d]) return -1; cruces++; }
      else if(at(rr + pr, cc + pc) || at(rr - pr, cc - pc)) return -1;
    }
    if(!cruces) return -1;
    let [a, b, e, f] = caja(); a = Math.min(a, r); e = Math.min(e, c); b = Math.max(b, r + dr * (w.length - 1)); f = Math.max(f, c + dc * (w.length - 1));
    if(b - a + 1 > max || f - e + 1 > max) return -1;
    return cruces * 100 - (b - a + 1) * (f - e + 1) - Math.abs((b - a) - (f - e)) * 3;
  }
  poner(items[0], 0, 0, "h");
  let pend = items.slice(1);
  for(let vuelta = 0; vuelta < 3 && pend.length; vuelta++){
    const quedan = [];
    for(const it of pend){
      let mejor = null;
      for(const [k, x] of M){
        const [r, c] = k.split(",").map(Number);
        for(let i = 0; i < it.w.length; i++){
          if(it.w[i] !== x.ch) continue;
          for(const d of ["h", "v"]){
            const r0 = d === "h" ? r : r - i, c0 = d === "h" ? c - i : c, s = evaluar(it.w, r0, c0, d);
            if(s >= 0 && (!mejor || s > mejor.s)) mejor = { s, r: r0, c: c0, d };
          }
        }
      }
      if(mejor) poner(it, mejor.r, mejor.c, mejor.d); else quedan.push(it);
    }
    pend = quedan;
  }
  const [a, b, e, f] = caja(), F = b - a + 1, C = f - e + 1;
  const grilla = Array.from({ length: F }, () => Array(C).fill("#"));
  for(const [k, x] of M){ const [r, c] = k.split(",").map(Number); grilla[r - a][c - e] = x.ch; }
  const ws = colocadas.map(p => ({ ...p, r: p.r - a, c: p.c - e }));
  const inicios = [...new Set(ws.map(p => p.r * 100 + p.c))].sort((x, y) => x - y);
  ws.forEach(p => p.num = inicios.indexOf(p.r * 100 + p.c) + 1);
  ws.sort((x, y) => x.num - y.num);
  return { filas: F, cols: C, grilla: grilla.map(f => f.join("")), palabras: ws, faltan: pend.map(p => p.w) };
}
