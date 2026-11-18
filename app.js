// ─────────────────────────────────────────────────────────────
//  Módulo común del sitio: encabezado, ingreso con Google y utilidades.
//  No hace falta editarlo. Los datos del curso están en curso.js.
// ─────────────────────────────────────────────────────────────
import { db, auth, configurado } from "./firebase.js";
import * as F from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { CURSO_INFO } from "./curso.js";

export { db, auth, F, CURSO_INFO };

/* ---------- utilidades ---------- */
export const $ = s => document.querySelector(s);
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export function toast(m){ const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
export const UNIDADES = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
export const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const pad = n => String(n).padStart(2, "0");
export const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
export const hoyISO = () => iso(new Date());
export const aFecha = s => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1, 12); };
export const corta = s => { const d = aFecha(s); return DIAS[d.getDay()].slice(0, 3) + " " + d.getDate() + "/" + (d.getMonth() + 1); };
export const larga = s => { const d = aFecha(s); const t = DIAS[d.getDay()] + " " + d.getDate() + " de " + MESES[d.getMonth()]; return t.charAt(0).toUpperCase() + t.slice(1); };
export const esUrl = u => /^https?:\/\/\S+$/i.test(String(u || "").trim());
// La clase termina a la hora de fin del curso: después se habilitan las presentaciones.
export function claseTerminada(fechaISO){
  const [h, m] = (CURSO_INFO.horaFin || "09:00").split(":").map(Number);
  const fin = aFecha(fechaISO); fin.setHours(h, m, 0, 0);
  return Date.now() >= fin.getTime();
}
export const ICON = {
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
  circle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/></svg>',
  google: '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>'
};

/* ---------- encabezado y pie ---------- */
const NAV_EST = [["Cronograma", "cronograma.html"], ["Materiales", "materiales.html"]];
const NAV_DOC = [["Asistencia", "docente-asistencia.html"], ["Cronograma", "docente-cronograma.html"], ["Contenidos", "docente-contenidos.html"], ["Recursos", "recursos.html"]];

function iniciales(n){ return String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join(""); }
function headerHTML(o, user){
  const nav = (o.area === "docente" ? NAV_DOC : NAV_EST).map(([t, h]) => `<a href="${h}"${t === o.activo ? ' aria-current="page"' : ""}>${t}</a>`).join("");
  const me = user ? `<span class="me">${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : `<span class="ini">${esc(iniciales(user.displayName))}</span>`}<button class="out" id="salir" type="button">Salir</button></span>` : "";
  const extra = o.area === "docente" ? `<a href="index.html" class="small" style="color:var(--muted);text-decoration:underline">Ver como estudiante</a>` : "";
  const brand = o.area === "docente"
    ? `<a class="brand" href="docente.html"><img src="img/uba.png" alt="UBA"><span>Área docente</span></a>`
    : `<a class="brand" href="index.html" aria-label="Ir al inicio"><img src="img/uba.png" alt="UBA"></a>`;
  return `<header class="hero ${o.fondo || ""} ${o.grande ? "big" : ""}"><div class="in">
    <div class="top">${brand}<nav class="menu" aria-label="Secciones">${nav}${extra}${me}</nav></div>
    <div><h1>${esc(o.titulo)}</h1>${o.subtitulo ? `<span class="sub">${esc(o.subtitulo)}</span>` : ""}</div>
  </div></header>`;
}
function footerHTML(o){
  return `<footer class="pie"><div class="in"><span>${esc(CURSO_INFO.pie)}</span>${o.area === "docente" ? "" : '<a href="docente.html">Área docente</a>'}</div></footer>`;
}

/* ---------- ingreso ---------- */
let esDocenteCache = null;
export async function esDocente(){
  if(esDocenteCache !== null) return esDocenteCache;
  try{ await F.getDoc(F.doc(db, "sesiones", "__prueba__")); esDocenteCache = true; }
  catch(e){ esDocenteCache = false; }
  return esDocenteCache;
}

/**
 * Arma la página: encabezado, contenedor principal y pie, y pide el ingreso con Google.
 * opciones: { area: "estudiantes" | "docente", activo, titulo, subtitulo, fondo, grande }
 * alListo(user, main) se llama cuando hay sesión (y, en el área docente, si la cuenta es docente).
 */
export function iniciar(o, alListo){
  document.title = (o.titulo === CURSO_INFO.nombre ? "" : o.titulo + " · ") + CURSO_INFO.nombre;
  const pintar = user => {
    document.body.innerHTML = headerHTML(o, user) + '<main id="main"><p class="muted">Cargando…</p></main>' + footerHTML(o);
    const s = $("#salir"); if(s) s.onclick = () => signOut(auth);
    return $("#main");
  };
  if(!configurado){ const m = pintar(null); m.innerHTML = '<div class="card"><h2>Falta conectar la base de datos</h2><p class="muted" style="margin:0">Completá el archivo config.js con los datos de Firebase.</p></div>'; return; }
  onAuthStateChanged(auth, async user => {
    esDocenteCache = null;
    const main = pintar(user);
    if(!user){
      main.innerHTML = `<div class="card login"><h2 style="font-size:28px">Ingresá para continuar</h2>
        <p>Usá tu cuenta de Google. Es la misma que usás para Classroom.</p>
        <button class="gbtn" id="entrar" type="button">${ICON.google}Ingresar con Google</button><p id="loginErr" style="color:var(--bad)"></p></div>`;
      $("#entrar").onclick = async () => {
        try{ await signInWithPopup(auth, new GoogleAuthProvider()); }
        catch(e){ console.error(e); $("#loginErr").textContent = e.code === "auth/unauthorized-domain" ? "Falta autorizar este dominio en Firebase (Authentication → Configuración → Dominios autorizados)." : e.code === "auth/popup-closed-by-user" ? "" : "No se pudo ingresar. Probá de nuevo."; }
      };
      return;
    }
    if(o.area === "docente" && !(await esDocente())){
      main.innerHTML = `<div class="card"><h2>Esta sección es solo para docentes</h2><p class="muted">Ingresaste como <b>${esc(user.email)}</b>. Si sos docente del curso, revisá que tu email esté en las reglas de Firebase.</p><a class="btn" href="index.html">Ir al sitio del curso</a></div>`;
      return;
    }
    try{ await alListo(user, main); }
    catch(e){ console.error(e); main.innerHTML = `<div class="card"><h2>No se pudo cargar la página</h2><p class="muted" style="margin:0">${e.code === "permission-denied" ? "Faltan permisos en las reglas de Firebase." : "Revisá tu conexión y recargá la página."}</p></div>`; }
  });
}

/* ---------- datos ---------- */
export async function leerClases(){
  const s = await F.getDocs(F.collection(db, "clases"));
  return s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.n || 0) - (b.n || 0));
}
export async function leerUnidades(){
  const s = await F.getDocs(F.collection(db, "unidades"));
  const m = {}; s.docs.forEach(d => m[d.id] = { id: d.id, ...d.data() });
  return m;
}
export async function leerMiDoc(uid){
  const d = await F.getDoc(F.doc(db, "estudiantes", uid));
  return d.exists() ? d.data() : {};
}
export function botonToggle(label, on){
  return `<button class="toggle" type="button" aria-pressed="${on ? "true" : "false"}">${on ? ICON.check : ICON.circle}${label}</button>`;
}
