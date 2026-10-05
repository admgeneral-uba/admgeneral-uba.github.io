# Cómo poner en línea el sitio del curso

Lleva unos 20 minutos y se hace una sola vez. No hace falta programar: todo se hace desde el navegador. Los nombres de los menús pueden variar un poco si Google o GitHub cambian sus pantallas.

## Qué hay en la carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Página de inicio del curso |
| `asistencia.html` | Página que abren los estudiantes al escanear el QR |
| `docente.html` | Tu panel: abrir la asistencia, proyectar el QR y descargar planillas |
| `config.js` | **El único archivo que tenés que editar** (datos de Firebase y nombre del curso) |
| `firestore.rules` | Reglas de seguridad para pegar en Firebase |
| `firebase.js`, `estilos.css` | Funcionamiento interno y diseño |

## Paso 1 · Crear la base de datos en Firebase

1. Entrá a <https://console.firebase.google.com> con tu cuenta de Google y tocá **Crear un proyecto**. Ponele un nombre (por ejemplo `admin-general`). Podés desactivar Google Analytics.
2. En el menú de la izquierda: **Compilación → Firestore Database → Crear base de datos**.
   - Ubicación: `southamerica-east1 (São Paulo)`, la más cercana a Argentina.
   - Elegí **modo de producción**.
3. En Firestore, abrí la pestaña **Reglas**. Borrá lo que haya, pegá todo el contenido de `firestore.rules`, **reemplazá `TU_EMAIL@gmail.com` por tu email de Google** y tocá **Publicar**.
4. En el menú: **Compilación → Authentication → Comenzar**. En **Método de acceso**, activá **Google** y guardá.
5. Tocá el engranaje ⚙️ (arriba a la izquierda) → **Configuración del proyecto**. Abajo, en **Tus apps**, tocá el ícono **`</>`** (Web). Ponele un nombre y registrala (no hace falta Hosting).
6. Firebase te muestra un bloque `const firebaseConfig = { ... }`. Copiá esos valores dentro de `config.js`, en el lugar de cada `PEGAR_AQUI`. En ese mismo archivo podés cambiar el nombre y el subtítulo del curso.

> Esos datos de configuración **no son una contraseña**: Firebase está pensado para que queden visibles en la página. Lo que protege la información son las reglas del punto 3.

## Paso 2 · Publicar el sitio en GitHub Pages

1. Creá una cuenta en <https://github.com> si no tenés. El nombre de usuario va a formar parte de la dirección del sitio.
2. Tocá **+ → New repository**. Ponele un nombre corto (por ejemplo `admin-general`), dejalo **Public** y creálo.
3. En el repositorio vacío, tocá **uploading an existing file**, arrastrá **todos los archivos** de la carpeta (con `config.js` ya completado) y tocá **Commit changes**.
4. Andá a **Settings → Pages**. En *Branch* elegí `main` y la carpeta `/ (root)`, y guardá.
5. Esperá uno o dos minutos. Tu sitio va a estar en `https://TU-USUARIO.github.io/admin-general/`.

## Paso 3 · Autorizar tu sitio para ingresar como docente

En Firebase: **Authentication → Configuración → Dominios autorizados → Agregar dominio**, y escribí `TU-USUARIO.github.io` (sin `https://` ni la parte del final).

## Paso 4 · Probar

1. Entrá a `.../docente.html`, ingresá con Google y tocá **Abrir asistencia**.
2. Con el celular, escaneá el QR y registrate con un nombre y un legajo de prueba. Tenés que aparecer en la lista.
3. Probá también entrar a la página de inicio desde otro dispositivo y escribir el código a mano.
4. Tocá **Cerrar asistencia**. Desde **Registro** podés quitar el registro de prueba.

## Cómo funciona en clase

- Al abrir la asistencia, se proyecta un QR y un código de 4 números que **cambia cada 30 segundos**. El QR ya lleva el código adentro, así que al escanear solo completan nombre y legajo.
- Quien no puede escanear entra a la página del curso, toca **Registrar mi asistencia** y escribe el código.
- Una foto del QR reenviada por WhatsApp deja de servir en uno o dos minutos. El mismo legajo no puede registrarse dos veces en una clase, y el celular recuerda nombre y legajo para las clases siguientes.
- **Mantené abierta la pantalla del panel docente mientras dure la asistencia**: es la que va cambiando el código. Si recargás la página, retoma sola.
- Las planillas se descargan en CSV y se abren con Excel o Google Sheets.

## Límites que conviene conocer

- Nada impide que un estudiante presente registre a un compañero ausente escribiendo otro legajo. Es el límite de no pedir cuentas. Si pasa, podés quitar registros desde el panel.
- El plan gratuito de Firebase permite unas 20.000 escrituras y 50.000 lecturas por día. Un curso de 100 estudiantes usa una fracción mínima de eso.

## Para cambiar algo más adelante

Editá el archivo en GitHub (abrilo y tocá el lápiz ✏️) o volvé a subirlo. Los cambios aparecen en uno o dos minutos. Las reglas de seguridad se cambian siempre desde Firebase, no desde GitHub.
