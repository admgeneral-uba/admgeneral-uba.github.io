import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig, CURSO } from "./config.js";

export const configurado = !String(firebaseConfig.apiKey).includes("PEGAR");
export const app = configurado ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

export function encabezado(){
  document.querySelectorAll("[data-curso]").forEach(e => e.textContent = CURSO.nombre);
  document.querySelectorAll("[data-subtitulo]").forEach(e => e.textContent = CURSO.subtitulo);
}
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function avisoSinConfig(el){
  el.innerHTML = `<div class="panel"><h2>Falta conectar la base de datos</h2>
  <p class="muted">Completá el archivo <b>config.js</b> con los datos de Firebase siguiendo la guía.</p></div>`;
}
