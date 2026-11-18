# Cómo subir la etapa 1

1. **Subí todos estos archivos** a tu repositorio de GitHub (la carpeta `img` incluida).
   Reemplazá los que ya tenías con el mismo nombre. **No toques `config.js`**: no viene en este paquete.
2. **Reglas de Firebase**: abrí `firestore.rules`, cambiá `TU_EMAIL@gmail.com` por tu email,
   copiá todo y pegalo en Firestore → Reglas → Publicar.
3. **Ingreso con Google**: en Firebase → Authentication → Método de acceso, activá **Google**.
   En Authentication → Configuración → Dominios autorizados, agregá `TU_USUARIO.github.io`.
4. Entrá a `docente-cronograma.html` y tocá **Cargar el cronograma base**.
   Después, en `docente-contenidos.html`, tocá **Cargar las unidades y lecturas base**.
5. Pegá los enlaces de Drive de lecturas y presentaciones. En Drive, cada archivo tiene que estar
   compartido como “Cualquier persona con el enlace”.
6. Para ver la carpeta del curso en Materiales, poné su enlace en `curso.js` (`driveUrl`).

La asistencia por ahora sigue igual que antes (nombre y legajo). En la etapa 2 pasa a la cuenta de Google.
