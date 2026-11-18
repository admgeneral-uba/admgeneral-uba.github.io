// Datos iniciales para cargar con un clic desde el área docente.
// Después se editan desde el sitio; este archivo no se vuelve a usar.

const P = "Presencial", V = "Virtual";
export const CLASES_BASE = [
  [1, "2027-04-06", P, "I", "Las organizaciones como sistemas abiertos", "Presentación de la materia, expectativas y normas.\nLas organizaciones como el objeto de estudio de la administración.\nLa organización como sistema abierto: entradas, transformación y salidas."],
  [2, "2027-04-09", V, "I", "Sistemas, elementos y tipologías", "Conceptos básicos de la teoría de sistemas.\nElementos y tipologías de organizaciones."],
  [3, "2027-04-13", P, "II", "Administración, eficiencia y eficacia", "Concepto de administración. Los gerentes y sus niveles.\nEficiencia y eficacia: el uso óptimo de los recursos y el logro de los objetivos.\nLas funciones de la administración: planeación, organización, dirección y control."],
  [4, "2027-04-16", V, "II", "¿Ciencia, tecnología o persuasión?", "La administración como ciencia, tecnología o persuasión.\nLa administración como sociotecnología: objeto, medios y metas."],
  [5, "2027-04-20", P, "III", "Los orígenes de la administración", "Los antecedentes: la revolución industrial y los sistemas de producción.\nEl surgimiento de la enseñanza de la administración: de las escuelas de comercio a Wharton y a la Licenciatura en Administración en la Argentina."],
  [6, "2027-04-23", V, "III", "De las escuelas clásicas al enfoque sistémico", "Las escuelas clásicas: administración científica (Taylor), administración industrial y general (Fayol) y modelo burocrático (Weber).\nLas ciencias de la conducta: la escuela de las relaciones humanas. El estructuralismo, la escuela neoclásica, la teoría de la organización y el enfoque sistémico."],
  [7, "2027-04-27", P, "IV", "Ética y responsabilidad social", ""],
  [8, "2027-04-30", V, "IV", "Inteligencia artificial y trabajo", ""],
  [9, "2027-05-04", P, "IV", "Violencia y acoso laboral", ""],
  [10, "2027-05-07", V, "", "Repaso e integración", ""],
  [11, "2027-05-11", P, "", "Exposiciones del TP 1", ""],
  [12, "2027-05-14", P, "", "Exposiciones del TP 1", ""],
  [13, "2027-05-18", P, "", "Primer parcial", "Unidades I a IV."],
  [14, "2027-05-21", V, "V", "Estructura", ""],
  [15, "2027-05-28", V, "V", "Estructura, poder y cultura", ""],
  [16, "2027-06-01", P, "VI", "Teoría de las decisiones", ""],
  [17, "2027-06-04", V, "VI", "Teoría de las decisiones", ""],
  [18, "2027-06-08", P, "VII", "Proceso administrativo", ""],
  [19, "2027-06-11", V, "VII", "Proceso administrativo", ""],
  [20, "2027-06-15", P, "VIII", "Competencias del administrador", ""],
  [21, "2027-06-18", V, "VIII", "Competencias del administrador", ""],
  [22, "2027-06-22", P, "VIII", "Taller de habilidades", ""],
  [23, "2027-06-25", P, "", "Exposiciones del TP 2", ""],
  [24, "2027-06-29", P, "", "Segundo parcial", "Unidades V a VIII."],
  [25, "2027-07-02", P, "", "Cierre de la materia", "Lectura de notas, reconocimientos y cierre."],
  [26, "2027-07-06", P, "", "Recuperatorio", ""]
].map(([n, fecha, modalidad, unidad, titulo, temas]) => ({ n, fecha, modalidad, unidad, titulo, temas }));

const MANUAL = "En Vicente, M. Á. y Ayala, J. C. (coords.), Principios fundamentales para la administración de organizaciones. Pearson.";
const L = (cita, tipo = "Obligatoria") => ({ tipo, cita, url: "" });
export const UNIDADES_BASE = {
  I: { nombre: "Las organizaciones", lecturas: [
    L("Schulman, D. R. y Vicente, M. Á. (2008). «El rol del administrador» (cap. I, sección 2). " + MANUAL),
    L("Kast, F. E. y Rosenzweig, J. E. (1987). Administración en las organizaciones. Enfoque de sistemas y de contingencias (2.ª ed.). McGraw-Hill. Extracto del cap. 5.")] },
  II: { nombre: "La administración", lecturas: [
    L("Scarano, E. R. (2008). «La administración: ¿ciencia y tecnología o persuasión?» (cap. I, sección 1). " + MANUAL),
    L("Bunge, M. (1986). «Status epistemológico de la administración». Ponencia en las Primeras Jornadas Nacionales de Administración, Buenos Aires."),
    L("Robbins, S. P. y Coulter, M. (2014). Administración (12.ª ed.). Pearson. Extracto del cap. 1.")] },
  III: { nombre: "Evolución del pensamiento administrativo", lecturas: [
    L("Franco, J. A. y de Mendonça, Á. H. (2008). «Evolución del pensamiento en administración» (cap. II, sección 4). " + MANUAL),
    L("George, C. S. y Álvarez, L. (2005). Historia del pensamiento administrativo (2.ª ed.). Pearson. Extracto de los caps. 3 y 4."),
    L("Cátedra de Administración General. «El surgimiento de la enseñanza de la administración». Ficha de cátedra.")] },
  IV: { nombre: "Desafíos de la administración", lecturas: [
    L("Cátedra de Administración General. Apunte de cátedra sobre los desafíos de la administración."),
    L("Kliksberg, B. (2013). Ética para empresarios. Extracto de la introducción y el cap. 2."),
    L("Consejo Profesional de Ciencias Económicas de la CABA. Código de Ética Profesional (Res. C.D. 46/2024)."),
    L("Sigman, M. y Bilinkis, S. (2023). Artificial. Debate. Extracto del cap. 7, «El trabajo y la deriva del sentido»."),
    L("ELA (2023). Guía para el abordaje de la violencia y el acoso en el mundo del trabajo en organizaciones.")] },
  V: { nombre: "Estructura", lecturas: [] },
  VI: { nombre: "Teoría de las decisiones", lecturas: [] },
  VII: { nombre: "Proceso administrativo", lecturas: [] },
  VIII: { nombre: "Competencias del administrador", lecturas: [] }
};
