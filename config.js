// ─────────────────────────────────────────────────────────────
//  CONFIGURACIÓN DEL SITIO — este es el único archivo que tenés que editar.
// ─────────────────────────────────────────────────────────────

// 1) Datos del curso (se muestran en el sitio)
export const CURSO = {
  nombre: "Administración General",
  subtitulo: "Sitio del curso",
};

// 2) Datos de Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyACi68xf3XviRJ58WEeKG8NVOpf1yi5ZHs",
  authDomain: "adm-general-uba.firebaseapp.com",
  projectId: "adm-general-uba",
  storageBucket: "adm-general-uba.firebasestorage.app",
  messagingSenderId: "226169557415",
  appId: "1:226169557415:web:f6639dd9ee66763195a682"
};

// 3) Cada cuántos segundos cambia el código de asistencia en pantalla.
//    El código anterior sigue valiendo un ciclo más, para no cortar a quien estaba escribiendo.
export const SEGUNDOS_POR_CODIGO = 30;
