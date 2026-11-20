// Recursos preparados de antemano (nube, encuesta, mural): se guardan para una clase
// y aparecen como opciones rápidas en la herramienta y en el panel "Clase de hoy".
import { db, auth } from "./firebase.js";
import * as F from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { leerClases, hoyISO, esc } from "./app.js";

export const TIPOS_PREP = { nube: "Nube de palabras", encuesta: "Encuesta", mural: "Mural de ideas" };

export async function montarPreparados({ tipo, leer, aplicar }){
  const user = await new Promise(r => { const u = onAuthStateChanged(auth, x => { u(); r(x); }); });
  if(!user || user.isAnonymous) return;
  let lista = [];
  try{ lista = (await F.getDocs(F.query(F.collection(db, "preparados"), F.where("tipo", "==", tipo)))).docs.map(d => ({ id: d.id, ...d.data() })); }catch(e){ return; }
  const clases = await leerClases(), hoy = hoyISO();
  const prox = clases.find(c => c.fecha >= hoy) || clases[clases.length - 1];
  const nClase = id => { const c = clases.find(x => x.id === id); return c ? "Clase " + c.n : ""; };

  const ideas = document.querySelector(".ideas"); if(!ideas) return;
  const box = document.createElement("div"); box.className = "prepbox";
  box.innerHTML = `<span class="label">Preparados</span><div class="ideas" id="prepList"></div>
    <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn link" id="prepSave" type="button">Guardar para usar en clase</button>
    <select id="prepClase" aria-label="Clase" style="width:auto">${clases.map(c => `<option value="${c.id}"${prox && c.id === prox.id ? " selected" : ""}>#${c.n}: ${esc(c.titulo)}</option>`).join("")}</select></div>
    <p id="prepMsg" style="margin:6px 0 0;min-height:1.2em;color:var(--ok, #2E7D4F);font-weight:700"></p>`;
  ideas.after(box);
  const st = document.createElement("style");
  st.textContent = ".prepbox{margin:4px 0 14px}.prepbox .ideas button .x{margin-left:8px;opacity:.55;font-weight:700}.prepbox .ideas button small{display:block;font-size:12px;opacity:.7}";
  document.head.appendChild(st);
  const pintar = () => {
    box.querySelector("#prepList").innerHTML = lista.length ? lista.map(p => `<button type="button" data-id="${p.id}"><small>${esc(nClase(p.clase))}</small>${esc(p.titulo)}<span class="x" data-del="${p.id}" title="Borrar">×</span></button>`).join("") : '<span style="color:var(--muted, #6B6F85)">Todavía no hay preparados.</span>';
  };
  box.querySelector("#prepList").addEventListener("click", async e => {
    const del = e.target.closest("[data-del]");
    if(del){ e.stopPropagation(); if(!confirm("¿Borrar este preparado?")) return; await F.deleteDoc(F.doc(db, "preparados", del.dataset.del)); lista = lista.filter(p => p.id !== del.dataset.del); pintar(); return; }
    const b = e.target.closest("[data-id]"); if(!b) return;
    const p = lista.find(x => x.id === b.dataset.id); if(p) aplicar(p.datos);
  });
  box.querySelector("#prepSave").onclick = async () => {
    const datos = leer(); if(!datos.q){ box.querySelector("#prepMsg").textContent = "Escribí la consigna primero."; return; }
    const clase = box.querySelector("#prepClase").value;
    const r = await F.addDoc(F.collection(db, "preparados"), { tipo, titulo: datos.q, datos, clase, creado: F.serverTimestamp() });
    lista.push({ id: r.id, tipo, titulo: datos.q, datos, clase }); pintar();
    box.querySelector("#prepMsg").textContent = `Guardado para la ${nClase(clase).toLowerCase()}.`;
  };
  pintar();
  // ?p=ID → cargar el preparado y lanzarlo
  const pid = new URLSearchParams(location.search).get("p");
  const p = pid && lista.find(x => x.id === pid);
  if(p){
    aplicar(p.datos);
    const btn = document.getElementById("launch");
    for(let i = 0; i < 40 && btn && btn.disabled; i++) await new Promise(r => setTimeout(r, 250));
    if(btn && !btn.disabled) btn.click();
  }
}
