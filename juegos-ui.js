// Interfaz de los juegos del Tercer tiempo. Se usa en el inicio y en tercer-tiempo.html.
import { normal, TIPOS, tipoDe, rng, barajar, armarSopa, armarCrucigrama } from "./juegos.js";

export async function montarJuego(root, o){
  const { juego, jid, user, db, F, esc } = o;
  const $ = s => root.querySelector(s);
  const ESTILO = new URL("./juegos.css?v=4", import.meta.url).href;
  if(!document.querySelector(`link[href="${ESTILO}"]`)){ const l = document.createElement("link"); l.rel = "stylesheet"; l.href = ESTILO; document.head.appendChild(l); }
  const tipo = tipoDe(juego), rid = jid + "_" + user.uid;
  const S = { intentos: [], terminado: false, gano: false };
  try{ const d = await F.getDoc(F.doc(db, "jugadas", rid)); if(d.exists()) Object.assign(S, { intentos: d.data().intentos || [], terminado: d.data().terminado, gano: d.data().gano }); }catch(e){}

  root.classList.add("tj");
  root.innerHTML = `${o.titulo ? `<h2 style="margin:0;text-align:center">#${juego.n}: ${esc(juego.titulo)}</h2>` : ""}${o.titulo ? `<p class="tipo" style="margin:0;text-align:center"><b>${TIPOS[tipo].nombre}.</b> ${esc(juego.tema && tipo === "sopa" ? "Tema: " + juego.tema : TIPOS[tipo].desc)}</p>` : tipo === "sopa" ? "" : `<p class="tipo" style="margin:0;text-align:center">${TIPOS[tipo].desc}</p>`}<div class="zona" id="zona"></div><div class="msg" id="msg" role="status"></div><div id="fin" style="width:100%"></div>`;
  const Z = $("#zona"), msg = t => $("#msg").textContent = t || "";
  const sacudir = el => { el.classList.remove("shake"); el.offsetWidth; el.classList.add("shake"); };
  let onKey = null;
  // El teclado físico solo se usa cuando el juego está activo (al tocarlo, o siempre en su propia página).
  let activo = !!o.titulo;
  document.addEventListener("pointerdown", e => { activo = root.contains(e.target); });
  document.addEventListener("keydown", e => {
    if(!onKey || !activo || e.ctrlKey || e.metaKey || e.altKey || e.target.matches("input,textarea,select")) return;
    if(e.key === "Enter") { onKey("ENTER"); e.preventDefault(); } else if(e.key === "Backspace") onKey("DEL");
    else if(e.key.startsWith("Arrow")) { if(tipo === "crucigrama"){ onKey(e.key); e.preventDefault(); } }
    else { const k = e.key.toUpperCase() === "Ñ" ? "Ñ" : normal(e.key); if(k.length === 1) onKey(k); }
  });
  async function guardar(){
    try{ await F.setDoc(F.doc(db, "jugadas", rid), { juego: jid, uid: user.uid, intentos: S.intentos, gano: S.gano, terminado: S.terminado, hora: F.serverTimestamp() }); }
    catch(e){ console.error(e); msg("No se pudo guardar el avance."); }
  }
  function fin(html){
    const nota = juego.pista && tipo === "palabra" ? `<p style="margin:10px 0 0">${esc(juego.pista)}</p>` : "";
    $("#fin").innerHTML = `<div class="fin">${html}${nota}${o.titulo ? '<div class="row" style="justify-content:center;margin-top:14px"><a class="btn" href="index.html">Volver al inicio</a></div>' : ""}</div>`;
  }
  const FILAS = ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"];
  const teclado = () => `<div class="kb" id="kb">${FILAS.map((f, i) => `<div>${i === 2 ? '<button class="w" data-k="ENTER" type="button">Enviar</button>' : ""}${[...f].map(k => `<button data-k="${k}" type="button">${k}</button>`).join("")}${i === 2 ? '<button class="w" data-k="DEL" type="button" aria-label="Borrar">⌫</button>' : ""}</div>`).join("")}</div>`;

  // ---------- Palabra ----------
  function palabra(){
    const P = juego.palabra, L = P.length; let actual = "";
    const evaluar = g => { const r = Array(L).fill("g"), resto = {}; for(let i = 0; i < L; i++){ if(g[i] === P[i]) r[i] = "v"; else resto[P[i]] = (resto[P[i]] || 0) + 1; } for(let i = 0; i < L; i++){ if(r[i] !== "v" && resto[g[i]]){ r[i] = "a"; resto[g[i]]--; } } return r; };
    Z.innerHTML = `<div class="grid6" id="g"></div>${teclado()}`;
    function pintar(anim){
      const est = {};
      $("#g").innerHTML = Array.from({ length: 6 }, (_, f) => {
        const g = S.intentos[f], ev = g ? evaluar(g) : null, txt = g || (f === S.intentos.length && !S.terminado ? actual : "");
        if(ev) [...g].forEach((ch, i) => { const o = { v: 3, a: 2, g: 1 }; if(!est[ch] || o[ev[i]] > o[est[ch]]) est[ch] = ev[i]; });
        return `<div class="fila" id="f${f}" style="grid-template-columns:repeat(${L},minmax(0,1fr));max-width:${L * 62}px">${Array.from({ length: L }, (_, i) => `<span class="cel ${ev ? ev[i] : txt[i] ? "lleno" : ""}${ev && anim === f ? " flip" : ""}"${ev && anim === f ? ` style="animation-delay:${i * .12}s"` : ""}>${txt[i] || ""}</span>`).join("")}</div>`;
      }).join("");
      $("#kb").querySelectorAll("[data-k]").forEach(b => { b.className = (b.classList.contains("w") ? "w " : "") + (est[b.dataset.k] || ""); });
      if(S.terminado){ $("#kb").hidden = true; fin(S.gano ? `<p style="margin:0;font-size:20px;font-weight:700">¡Bien! La adivinaste en ${S.intentos.length} ${S.intentos.length === 1 ? "intento" : "intentos"}.</p>` : `<p style="margin:0 0 6px">La palabra era</p><b class="sol">${esc(P)}</b>`); }
    }
    onKey = async k => {
      if(S.terminado) return; msg();
      if(k === "DEL"){ actual = actual.slice(0, -1); return pintar(); }
      if(k === "ENTER"){
        if(actual.length < L){ msg(`La palabra tiene ${L} letras.`); return sacudir($("#f" + S.intentos.length)); }
        S.intentos.push(actual); actual = ""; S.gano = S.intentos[S.intentos.length - 1] === P; S.terminado = S.gano || S.intentos.length >= 6;
        pintar(S.intentos.length - 1); return guardar();
      }
      if(/^[A-ZÑ]$/.test(k) && actual.length < L){ actual += k; pintar(); }
    };
    $("#kb").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if(b) onKey(b.dataset.k); });
    pintar();
  }

  // ---------- Conexiones ----------
  function conexiones(){
    const G = juego.grupos, clave = it => G.findIndex(g => g.items.includes(it));
    const todos = barajar(G.flatMap(g => g.items), rng(jid));
    let sel = [];
    const resueltos = () => S.intentos.map(s => s.split("|")).filter(a => new Set(a.map(clave)).size === 1).map(a => clave(a[0]));
    const errores = () => S.intentos.length - resueltos().length;
    function pintar(){
      const R = resueltos(), libres = todos.filter(t => !R.includes(clave(t)) && !(S.terminado && !S.gano));
      const orden = S.terminado && !S.gano ? [...R, ...[0, 1, 2, 3].filter(i => !R.includes(i))] : R;
      Z.innerHTML = `<div class="cx" id="cx">${orden.map(i => `<div class="gr g${i}"><b>${esc(G[i].nombre)}</b><span>${G[i].items.map(esc).join(" · ")}</span></div>`).join("")}${libres.map(t => `<button type="button" class="${sel.includes(t) ? "sel" : ""}" data-t="${esc(t)}">${esc(t)}</button>`).join("")}</div>
        ${S.terminado ? "" : `<div class="vidas">Errores disponibles: ${[0, 1, 2, 3].map(i => `<i class="${i < 4 - errores() ? "" : "off"}"></i>`).join("")}</div>
        <div class="botones"><button class="btn" type="button" id="mez">Mezclar</button><button class="btn" type="button" id="des"${sel.length ? "" : " disabled"}>Deseleccionar</button><button class="btn primary" type="button" id="env"${sel.length === 4 ? "" : " disabled"}>Enviar</button></div>`}`;
      Z.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { if(S.terminado) return; const t = b.dataset.t; sel = sel.includes(t) ? sel.filter(x => x !== t) : sel.length < 4 ? [...sel, t] : sel; msg(); pintar(); });
      if(S.terminado){ fin(S.gano ? `<p style="margin:0;font-size:20px;font-weight:700">¡Bien! Armaste los 4 grupos${errores() ? ` con ${errores()} ${errores() === 1 ? "error" : "errores"}` : " sin errores"}.</p>` : `<p style="margin:0;font-size:18px;font-weight:700">Esta vez no salió. Arriba están los 4 grupos.</p>`); return; }
      $("#mez").onclick = () => { todos.splice(0, todos.length, ...barajar(todos, Math.random)); pintar(); };
      $("#des").onclick = () => { sel = []; pintar(); };
      $("#env").onclick = async () => {
        const s = [...sel].sort().join("|");
        if(S.intentos.includes(s)){ msg("Ya probaste esa combinación."); return; }
        S.intentos.push(s);
        const cuenta = {}; sel.forEach(t => cuenta[clave(t)] = (cuenta[clave(t)] || 0) + 1);
        const max = Math.max(...Object.values(cuenta));
        sel = [];
        if(max === 4) msg("¡Grupo encontrado!"); else msg(max === 3 ? "¡Casi! Te falta uno." : "No es un grupo.");
        S.gano = resueltos().length === 4; S.terminado = S.gano || errores() >= 4;
        pintar(); if(max < 4 && !S.terminado) sacudir($("#cx"));
        await guardar();
      };
    }
    pintar();
  }

  // ---------- Sopa de letras ----------
  function sopa(){
    const T = armarSopa(juego.palabras, jid);
    if(!T){ Z.innerHTML = '<p class="empty">No se pudo armar la sopa de letras.</p>'; return; }
    let ini = null;
    const celdas = w => { const [r0, c0, r1, c1] = T.pos[w], dr = Math.sign(r1 - r0), dc = Math.sign(c1 - c0), out = []; for(let i = 0; i < w.length; i++) out.push((r0 + dr * i) * T.N + c0 + dc * i); return out; };
    function pintar(){
      const ok = new Set((S.terminado ? T.palabras : S.intentos).flatMap(celdas));
      Z.innerHTML = `<div class="sopa" id="sp" style="grid-template-columns:repeat(${T.N},1fr)">${T.grilla.join("").split("").map((ch, i) => `<span data-i="${i}" class="${ok.has(i) ? "ok" : ""}${ini === i ? " ini" : ""}">${ch}</span>`).join("")}</div>
        <div class="lista">${T.palabras.map(w => `<span class="${S.intentos.includes(w) ? "ok" : ""}">${w}</span>`).join("")}</div>
        ${S.terminado ? "" : `<p class="muted" style="margin:0;text-align:center">Tocá la primera letra y después la última de cada palabra.</p><button class="btn" type="button" id="rend">Me rindo</button>`}`;
      Z.querySelectorAll("[data-i]").forEach(s => s.onclick = () => tocar(+s.dataset.i));
      if(S.terminado){ fin(S.gano ? `<p style="margin:0;font-size:20px;font-weight:700">¡Bien! Encontraste las ${T.palabras.length} palabras.</p>` : `<p style="margin:0;font-size:18px;font-weight:700">Encontraste ${S.intentos.length} de ${T.palabras.length}. Arriba están todas marcadas.</p>`); return; }
      $("#rend").onclick = async () => { S.terminado = true; S.gano = false; pintar(); await guardar(); };
    }
    async function tocar(i){
      if(S.terminado) return; msg();
      if(ini === null || ini === i){ ini = ini === i ? null : i; return pintar(); }
      const a = [Math.floor(ini / T.N), ini % T.N], b = [Math.floor(i / T.N), i % T.N]; ini = null;
      const w = T.palabras.find(w => { const [r0, c0, r1, c1] = T.pos[w]; return (r0 === a[0] && c0 === a[1] && r1 === b[0] && c1 === b[1]) || (r0 === b[0] && c0 === b[1] && r1 === a[0] && c1 === a[1]); });
      if(!w){ msg("Ahí no hay ninguna palabra."); pintar(); return; }
      if(S.intentos.includes(w)){ pintar(); return; }
      S.intentos.push(w); S.gano = S.intentos.length === T.palabras.length; S.terminado = S.gano;
      msg(S.gano ? "" : `¡${w}!`); pintar(); await guardar();
    }
    pintar();
  }

  // ---------- Mini crucigrama ----------
  function crucigrama(){
    const X = armarCrucigrama(juego.palabras);
    if(!X){ Z.innerHTML = '<p class="empty">No se pudo armar el crucigrama.</p>'; return; }
    const sol = X.grilla.join(""), C = X.cols;
    let val = (S.intentos[0] && S.intentos[0].length === sol.length ? S.intentos[0] : sol.replace(/[^#]/g, " ")).split("");
    let cur = X.palabras[0], pos = cur.r * C + cur.c, revisar = false;
    const celdas = p => Array.from({ length: p.w.length }, (_, i) => (p.r + (p.d === "v" ? i : 0)) * C + p.c + (p.d === "h" ? i : 0));
    const numDe = {}; X.palabras.forEach(p => numDe[p.r * C + p.c] = p.num);
    const enCelda = (i, d) => X.palabras.find(p => p.d === d && celdas(p).includes(i));
    function pintar(){
      if(S.terminado) val = sol.split("");
      const cs = new Set(celdas(cur));
      Z.innerHTML = `<div class="cru" style="grid-template-columns:repeat(${C},1fr)">${sol.split("").map((ch, i) => ch === "#" ? '<span class="x"></span>' : `<span data-i="${i}" class="${i === pos && !S.terminado ? "cur" : cs.has(i) && !S.terminado ? "pal" : ""}${(revisar || S.terminado) && val[i] !== " " ? (val[i] === ch ? " bien" : " mal") : ""}">${numDe[i] ? `<i>${numDe[i]}</i>` : ""}${val[i] === " " ? "" : val[i]}</span>`).join("")}</div>
        ${S.terminado ? "" : `<div class="clue"><span style="flex:1">${cur.num} ${cur.d === "h" ? "horizontal" : "vertical"}: ${esc(cur.pista)}</span></div>${teclado()}<div class="botones"><button class="btn" type="button" id="rev">Revisar</button><button class="btn" type="button" id="rend">Ver la solución</button></div>`}
        <div class="pls">${["h", "v"].map(d => `<div><h3>${d === "h" ? "Horizontales" : "Verticales"}</h3>${X.palabras.filter(p => p.d === d).map(p => `<p data-p="${X.palabras.indexOf(p)}" class="${p === cur && !S.terminado ? "cur" : ""}"><b>${p.num}.</b> ${esc(p.pista)}</p>`).join("")}</div>`).join("")}</div>`;
      Z.querySelectorAll("[data-i]").forEach(s => s.onclick = () => { const i = +s.dataset.i; if(S.terminado) return; if(i === pos){ const otra = enCelda(i, cur.d === "h" ? "v" : "h"); if(otra) cur = otra; } else { pos = i; cur = enCelda(i, cur.d) || enCelda(i, cur.d === "h" ? "v" : "h"); } pintar(); });
      Z.querySelectorAll("[data-p]").forEach(p => p.onclick = () => { if(S.terminado) return; cur = X.palabras[+p.dataset.p]; pos = celdas(cur).find(i => val[i] === " ") ?? celdas(cur)[0]; pintar(); });
      if(S.terminado){ fin(S.gano ? `<p style="margin:0;font-size:20px;font-weight:700">¡Bien! Completaste el crucigrama.</p>` : `<p style="margin:0;font-size:18px;font-weight:700">Arriba está la solución.</p>`); return; }
      $("#kb").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if(b) onKey(b.dataset.k); });
      $("#rev").onclick = () => { revisar = true; pintar(); };
      $("#rend").onclick = async () => { S.terminado = true; S.gano = false; S.intentos = [val.join("")]; pintar(); await guardar(); };
    }
    let timer = null;
    const guardarLuego = () => { clearTimeout(timer); timer = setTimeout(() => { S.intentos = [val.join("")]; guardar(); }, 1200); };
    onKey = async k => {
      if(S.terminado) return; msg(); revisar = false;
      const cs = celdas(cur), j = cs.indexOf(pos);
      if(k.startsWith("Arrow")){
        const d = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[k];
        let r = Math.floor(pos / C) + d[0], c = pos % C + d[1];
        while(r >= 0 && r < X.filas && c >= 0 && c < C && sol[r * C + c] === "#"){ r += d[0]; c += d[1]; }
        if(r >= 0 && r < X.filas && c >= 0 && c < C){ pos = r * C + c; cur = enCelda(pos, d[0] ? "v" : "h") || enCelda(pos, d[0] ? "h" : "v"); }
        return pintar();
      }
      if(k === "DEL"){ if(val[pos] === " " && j > 0) pos = cs[j - 1]; val[pos] = " "; pintar(); return guardarLuego(); }
      if(k === "ENTER"){ const i = (X.palabras.indexOf(cur) + 1) % X.palabras.length; cur = X.palabras[i]; pos = celdas(cur)[0]; return pintar(); }
      if(!/^[A-ZÑ]$/.test(k)) return;
      val[pos] = k;
      if(j < cs.length - 1) pos = cs[j + 1];
      else { const sig = X.palabras.slice(X.palabras.indexOf(cur) + 1).find(p => celdas(p).some(i => val[i] === " ")); if(sig){ cur = sig; pos = celdas(sig).find(i => val[i] === " "); } }
      if(val.join("") === sol){ S.gano = true; S.terminado = true; S.intentos = [sol]; pintar(); clearTimeout(timer); return guardar(); }
      pintar(); guardarLuego();
    };
    pintar();
  }

  // ---------- Pista a pista ----------
  function pistas(){
    const nr = s => String(s || "").toUpperCase().normalize("NFD").replace(/N\u0303/g, "Ñ").replace(/[\u0300-\u036f]/g, "").replace(/[^A-ZÑ0-9]/g, "");
    const P = juego.pistas, ok = [juego.respuesta, ...(juego.aceptadas || [])].map(nr);
    function pintar(){
      const ver = S.terminado ? P.length : Math.min(P.length, S.intentos.length + 1);
      const malos = S.intentos.filter(g => !ok.includes(nr(g)));
      Z.innerHTML = `<div class="pp">${P.map((p, i) => `<div class="${i < ver ? "" : "off"}"><b>${i + 1}</b>${i < ver ? esc(p) : "…"}</div>`).join("")}</div>
        ${malos.length ? `<div class="errs">${malos.map(g => `<span>${esc(g)}</span>`).join("")}</div>` : ""}
        ${S.terminado ? "" : `<form class="adiv" id="fa"><input type="text" id="gu" placeholder="Tu respuesta" aria-label="Tu respuesta" autocomplete="off" maxlength="60"><button class="btn primary" type="submit">Adivinar</button></form>`}`;
      if(S.terminado){ fin(S.gano ? `<p style="margin:0;font-size:20px;font-weight:700">¡Bien! Lo adivinaste con ${S.intentos.length} ${S.intentos.length === 1 ? "pista" : "pistas"}.</p><p style="margin:8px 0 0">Era <b>${esc(juego.respuesta)}</b>.</p>` : `<p style="margin:0 0 6px">La respuesta era</p><b class="sol">${esc(juego.respuesta)}</b>`); return; }
      $("#fa").onsubmit = async e => {
        e.preventDefault(); const g = $("#gu").value.trim(); if(!g) return;
        if(S.intentos.some(x => nr(x) === nr(g))){ msg("Ya probaste esa respuesta."); return; }
        S.intentos.push(g); S.gano = ok.includes(nr(g)); S.terminado = S.gano || S.intentos.length >= P.length;
        msg(S.gano || S.terminado ? "" : "No es eso. Ahí va otra pista."); pintar(); if(!S.terminado) $("#gu").focus(); await guardar();
      };
      if(o.titulo) $("#gu").focus();
    }
    pintar();
  }

  ({ palabra, conexiones, sopa, crucigrama, pistas })[tipo]();
}
