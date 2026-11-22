
import { db, F, esc, toast, leerClases, corta, hoyISO, descargarCSV, CURSO_INFO } from "./app.js";

const SEG = CURSO_INFO.segundosCodigo || 30;
const URL_A = new URL("asistencia.html", location.href).href.split("?")[0];
const horaTxt = ts => ts && ts.toDate ? ts.toDate().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "";
const nuevoCodigo = prev => { let c; do { c = String(Math.floor(1000 + Math.random() * 9000)); } while(c === prev); return c; };


const ESTILO = `
.asis{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:24px;align-items:start}
@media (max-width:900px){.asis{grid-template-columns:1fr}}
.asis .big{font-family:var(--serif);font-weight:700;font-size:44px;line-height:1}
.livetag{display:inline-flex;align-items:center;gap:8px;font-weight:700;color:var(--live-ink)}
.livetag i{width:10px;height:10px;border-radius:50%;background:var(--live);animation:p 1.4s infinite}
@keyframes p{50%{opacity:.35}}
.asis table{border-collapse:collapse;width:100%}
.asis th{text-align:left;font-size:14px;color:var(--muted);padding:8px 6px;border-bottom:1px solid var(--line)}
.asis td{padding:8px 6px;border-bottom:1px solid var(--line2)}
.asis .scroll{max-height:520px;overflow:auto}
.proj{position:fixed;inset:0;background:#fff url(img/fondo-intenso.jpg) center/cover;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px;text-align:center}
.proj .panel{background:rgba(255,255,255,.94);border-radius:24px;padding:28px 40px;display:flex;gap:44px;align-items:center;flex-wrap:wrap;justify-content:center}
.proj .qr{background:#fff;padding:14px;border-radius:12px;line-height:0}
.proj .codigo{font-family:var(--serif);font-size:clamp(64px,13vw,150px);font-weight:700;letter-spacing:.1em;line-height:1;font-variant-numeric:tabular-nums}
.proj .barra{height:8px;background:var(--line);border-radius:4px;overflow:hidden;width:min(320px,70vw);margin:12px auto 0}
.proj .barra i{display:block;height:100%;background:var(--live);transition:width 1s linear}
.proj h2{margin:0;font-size:clamp(24px,3vw,34px)}
.proj .cierra{position:absolute;top:16px;right:16px}
`;
// Bloque "Tomar asistencia" + "Registro" (se muestra en el inicio docente durante la clase).
export async function montarAsistencia(host, { clases, claseId }){
  if(!document.getElementById("estiloAsis")){ const st = document.createElement("style"); st.id = "estiloAsis"; st.textContent = ESTILO; document.head.appendChild(st); }
  const $ = s => host.querySelector(s);

  const nombreClase = id => { const c = clases.find(x => x.id === id); return c ? `#${c.n}: ${c.titulo}` : id; };
  let activa = null, presentes = [], rot = null, unsub = null, quedan = SEG;
  let tomadas = {};
  const pa = await F.getDoc(F.doc(db, "publico", "asistencia")); if(pa.exists()) tomadas = pa.data().tomadas || {};
  const pub = await F.getDoc(F.doc(db, "publico", "actual"));
  if(pub.exists() && pub.data().activa){
    const s = await F.getDoc(F.doc(db, "sesiones", pub.data().sesion));
    if(s.exists() && s.data().activa) activa = { sid: s.id, titulo: s.data().titulo, codigo: s.data().codigo };
  }

  host.innerHTML = `<div class="cols asis"><div class="card" id="tomar"></div>
    <div class="card"><div class="row between" style="margin-bottom:10px"><h2 style="margin:0">Registro</h2><button class="btn small" id="csv" type="button">Descargar planilla</button></div>
      <select id="sel" aria-label="Clase"></select><div id="lista" style="margin-top:14px"></div></div></div>
    <div id="proj" class="proj" hidden></div>`;
  $("#csv").onclick = planilla;

  function pintarTomar(){
    const t = $("#tomar");
    if(!activa){
      const hoy = hoyISO(), sug = clases.find(c => c.id === claseId) || clases.find(c => c.fecha >= hoy) || clases[clases.length - 1];
      t.innerHTML = `<h2>Tomar asistencia</h2>
        <label class="l" for="clase">Clase</label>
        <select id="clase">${clases.map(c => `<option value="${c.id}"${sug && c.id === sug.id ? " selected" : ""}>${c.n}. ${esc(corta(c.fecha))} · ${esc(c.titulo)}</option>`).join("")}</select>
        <div class="row" style="margin-top:16px"><button class="btn primary" id="abrir" type="button">Abrir asistencia</button></div>`;
      $("#abrir").onclick = abrir; return;
    }
    t.innerHTML = `<span class="livetag"><i></i>Abierta</span>
      <h2 style="margin:6px 0 14px">${esc(activa.titulo)}</h2>
      <div class="row" style="gap:28px;align-items:flex-end"><div><div class="big" id="n">${presentes.length}</div><span class="muted">presentes</span></div>
        <div><div class="big" id="cod" style="letter-spacing:.08em">${esc(activa.codigo)}</div><span class="muted">código</span></div></div>
      <div class="row" style="margin-top:18px"><button class="btn primary" id="mostrar" type="button">Proyectar QR</button><button class="btn" id="cerrar" type="button">Cerrar asistencia</button></div>`;
    $("#mostrar").onclick = proyectar; $("#cerrar").onclick = cerrar;
  }

  async function abrir(){
    const sid = $("#clase").value, titulo = nombreClase(sid), codigo = nuevoCodigo();
    $("#abrir").disabled = true;
    try{
      await F.setDoc(F.doc(db, "sesiones", sid), { titulo, activa: true, codigo, codigoAnterior: codigo, creada: F.serverTimestamp() }, { merge: true });
      await F.setDoc(F.doc(db, "publico", "actual"), { sesion: sid, titulo, activa: true });
      await F.setDoc(F.doc(db, "publico", "asistencia"), { tomadas: { [sid]: true } }, { merge: true });
      tomadas[sid] = true;
      activa = { sid, titulo, codigo };
      escuchar(); pintarTomar(); llenarSel(sid); proyectar();
    }catch(e){ console.error(e); toast("No se pudo abrir la asistencia."); $("#abrir").disabled = false; }
  }
  function escuchar(){
    clearInterval(rot); quedan = SEG;
    rot = setInterval(async () => {
      quedan--; const b = $("#barra"); if(b) b.style.width = (quedan / SEG * 100) + "%";
      if(quedan > 0) return; quedan = SEG;
      const ant = activa.codigo, codigo = nuevoCodigo(ant);
      try{ await F.updateDoc(F.doc(db, "sesiones", activa.sid), { codigo, codigoAnterior: ant }); activa.codigo = codigo; pintarCodigo(); }catch(e){ console.error(e); }
    }, 1000);
    if(unsub) unsub();
    unsub = F.onSnapshot(F.query(F.collection(db, "asistencias"), F.where("sesion", "==", activa.sid)), snap => {
      presentes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const n = $("#n"); if(n) n.textContent = presentes.length;
      const p = $("#projN"); if(p) p.textContent = presentes.length + " presentes";
      if($("#sel").value === activa.sid) pintarLista(activa.sid, presentes);
    });
  }
  function pintarCodigo(){
    const c = $("#cod"); if(c) c.textContent = activa.codigo;
    const g = $("#codG"); if(g) g.textContent = activa.codigo;
    const q = $("#qr"); if(q){ q.innerHTML = ""; if(window.QRCode) new QRCode(q, { text: URL_A + "?c=" + activa.codigo, width: 300, height: 300, correctLevel: QRCode.CorrectLevel.M }); }
    const b = $("#barra"); if(b){ b.style.transition = "none"; b.style.width = "100%"; b.offsetWidth; b.style.transition = ""; }
  }
  function proyectar(){
    const p = $("#proj"); p.hidden = false;
    p.innerHTML = `<button class="btn cierra" id="cp" type="button">Cerrar pantalla</button>
      <h2>${esc(activa.titulo)}</h2>
      <div class="panel"><div class="qr" id="qr"></div>
        <div><div class="codigo" id="codG"></div><div class="barra"><i id="barra" style="width:100%"></i></div>
        <p style="font-size:24px;font-weight:700;margin:14px 0 0" id="projN">${presentes.length} presentes</p></div></div>
      <div style="font-size:20px;background:rgba(255,255,255,.85);border-radius:10px;padding:6px 14px">${esc(URL_A.replace(/^https?:\/\//, ""))}</div>`;
    pintarCodigo();
    $("#cp").onclick = () => { p.hidden = true; if(document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
    if(document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }
  async function cerrar(){
    if(!confirm("¿Cerrar la asistencia?")) return;
    try{
      await F.updateDoc(F.doc(db, "sesiones", activa.sid), { activa: false });
      await F.setDoc(F.doc(db, "publico", "actual"), { sesion: activa.sid, titulo: activa.titulo, activa: false });
      clearInterval(rot); if(unsub) unsub(); unsub = null;
      const sid = activa.sid; activa = null; $("#proj").hidden = true;
      pintarTomar(); llenarSel(sid); toast("Asistencia cerrada");
    }catch(e){ console.error(e); toast("No se pudo cerrar."); }
  }

  function llenarSel(elegir){
    const ids = clases.filter(c => tomadas[c.id]).map(c => c.id);
    const sel = $("#sel");
    if(!ids.length){ sel.hidden = true; $("#lista").innerHTML = '<p class="empty">Todavía no se tomó asistencia.</p>'; return; }
    sel.hidden = false;
    sel.innerHTML = ids.slice().reverse().map(id => `<option value="${id}">${esc(nombreClase(id))}</option>`).join("");
    if(elegir) sel.value = elegir;
    sel.onchange = () => ver(sel.value); ver(sel.value);
  }
  async function ver(sid){
    if(activa && sid === activa.sid) return pintarLista(sid, presentes);
    const s = await F.getDocs(F.query(F.collection(db, "asistencias"), F.where("sesion", "==", sid)));
    pintarLista(sid, s.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  async function pintarLista(sid, regs){
    const orden = regs.slice().sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));
    const est = await F.getDocs(F.collection(db, "estudiantes"));
    const ya = new Set(orden.map(r => r.uid));
    const faltan = est.docs.filter(d => !ya.has(d.id)).map(d => ({ uid: d.id, nombre: [d.data().perfil?.nombre, d.data().perfil?.apellido].filter(Boolean).join(" ") || d.data().nombreGoogle || d.data().email || d.id, email: d.data().email || "" })).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    $("#lista").innerHTML = `<p style="margin:0 0 8px"><b>${orden.length}</b> presentes</p>
      ${orden.length ? `<div class="scroll"><table><tr><th>Estudiante</th><th>Hora</th><th></th></tr>${orden.map(r => `<tr><td>${esc(r.nombre)}</td><td>${horaTxt(r.hora)}</td><td style="text-align:right"><button class="btn link" type="button" data-q="${esc(r.id)}">Quitar</button></td></tr>`).join("")}</table></div>` : ""}
      ${faltan.length ? `<div class="row" style="margin-top:14px"><select id="add" aria-label="Agregar presente" style="flex:1;min-width:200px"><option value="">Agregar presente…</option>${faltan.map(f => `<option value="${esc(f.uid)}">${esc(f.nombre)}</option>`).join("")}</select><button class="btn small" id="addB" type="button">Agregar</button></div>` : ""}`;
    $("#lista").querySelectorAll("[data-q]").forEach(b => b.onclick = async () => {
      if(!confirm("¿Quitar este presente?")) return;
      try{ await F.deleteDoc(F.doc(db, "asistencias", b.dataset.q)); if(!(activa && sid === activa.sid)) ver(sid); }catch(e){ toast("No se pudo quitar."); }
    });
    const ab = $("#addB"); if(ab) ab.onclick = async () => {
      const f = faltan.find(x => x.uid === $("#add").value); if(!f) return;
      try{ await F.setDoc(F.doc(db, "asistencias", sid + "_" + f.uid), { sesion: sid, uid: f.uid, nombre: f.nombre, email: f.email, manual: true, hora: F.serverTimestamp() }); if(!(activa && sid === activa.sid)) ver(sid); toast("Presente agregado"); }
      catch(e){ console.error(e); toast("No se pudo agregar."); }
    };
  }
  async function planilla(){
    const ids = clases.filter(c => tomadas[c.id]);
    if(!ids.length){ toast("Todavía no se tomó asistencia."); return; }
    const [as, est] = await Promise.all([F.getDocs(F.collection(db, "asistencias")), F.getDocs(F.collection(db, "estudiantes"))]);
    const al = new Map();
    est.docs.forEach(d => { const p = d.data().perfil || {}; al.set(d.id, { ap: p.apellido || "", no: p.nombre || d.data().nombreGoogle || "", leg: p.legajo || "", email: d.data().email || "", cl: new Set() }); });
    as.docs.forEach(d => { const r = d.data(); if(!r.uid) return; if(!al.has(r.uid)) al.set(r.uid, { ap: "", no: r.nombre, leg: "", email: r.email || "", cl: new Set() }); al.get(r.uid).cl.add(r.sesion); });
    const filas = [["Apellido", "Nombre", "DNI", "Email", ...ids.map(c => `Clase ${c.n} (${corta(c.fecha)})`), "Presentes", "Asistencia"]];
    [...al.values()].sort((a, b) => (a.ap + a.no).localeCompare(b.ap + b.no, "es")).forEach(a => {
      const n = ids.filter(c => a.cl.has(c.id)).length;
      filas.push([a.ap, a.no, a.leg, a.email, ...ids.map(c => a.cl.has(c.id) ? "P" : "A"), n, Math.round(n / ids.length * 100) + " %"]);
    });
    descargarCSV("asistencia.csv", filas);
  }
  pintarTomar(); llenarSel(activa && activa.sid);
  if(activa) escuchar();
}
