# Lab2 CRUD Firebase — Catálogo de empleados

Aplicación en **Next.js, React, TypeScript y Cloud Firestore** basada en la actividad «Lab2: Firebase CRUD Catálogo» del material `TC3005B_CRUD_Next_Firebase.pdf` (diapositiva 8). Implementa las cuatro operaciones del catálogo de empleados mediante el SDK modular de Firebase.

## Ejecutar en local

Requisitos: Node.js **22.13 o superior**, npm y Java **21 o superior** para el emulador de Firestore. La primera ejecución necesita Internet para descargar dependencias y emuladores.

Desde la raíz del repositorio:

```bash
cd "Lab2 CRUD Firebase"
npm ci
cp .env.example .env.local
npm run dev:local
```

- Aplicación: <http://127.0.0.1:3002>
- Panel de Firebase Emulator Suite: <http://127.0.0.1:4002>
- Firestore: puerto `8085`. Authentication: puerto `9099`.

La configuración de ejemplo usa el proyecto local `demo-lab2-crud`. No necesita cuenta de Firebase ni credenciales reales. Las operaciones se ejecutan contra los **emuladores oficiales de Authentication y Firestore**; no se simulan con arreglos o localStorage.

Detén el proceso con **Ctrl+C** y espera a que termine la exportación. Los datos y usuarios se guardan en `.firebase-data/` y se importan al iniciar de nuevo. Un cierre forzado puede impedir la exportación. Ese directorio queda excluido de Git.

## Funcionalidades

| Operación  | Implementación                                                           |
| ---------- | ------------------------------------------------------------------------ |
| Crear      | Formulario obligatorio y `addDoc`, con ID generado por Firestore.        |
| Consultar  | `getDocsFromServer`, orden alfabético y botón Actualizar.                |
| Actualizar | Formulario precargado y `updateDoc`, conservando ID y fecha de creación. |
| Eliminar   | Confirmación explícita en un diálogo y `deleteDoc`.                      |

Incluye búsqueda por nombre, correo o puesto; filtros por departamento y estado; indicadores de empleados, activos y departamentos; mensajes de carga, éxito y error; y diseño adaptable con desplazamiento horizontal de la tabla en pantallas pequeñas.

Los nombres y puestos se recortan; el correo se guarda en minúsculas. Se validan campos vacíos, longitudes máximas, formato de correo, departamento y estado tanto en la aplicación como en las reglas de Firestore. Los correos no tienen restricción de unicidad.

## Datos y acceso

Cada sesión inicia automáticamente con **Firebase Authentication anónimo**. La identidad persiste en el mismo navegador. El catálogo pertenece a ese usuario, en:

```text
users/{uid}/employees/{employeeId}
```

| Campo        | Tipo / restricciones                                                |
| ------------ | ------------------------------------------------------------------- |
| `name`       | Texto, de 1 a 100 caracteres.                                       |
| `email`      | Correo, máximo 254 caracteres.                                      |
| `position`   | Texto, de 1 a 80 caracteres.                                        |
| `department` | Tecnología, Operaciones, Administración, Ventas o Recursos humanos. |
| `status`     | `active` o `inactive`.                                              |
| `createdAt`  | Timestamp del servidor al crear; inmutable.                         |
| `updatedAt`  | Timestamp del servidor al crear y editar.                           |

`firestore.rules` permite operar únicamente sobre el catálogo del UID autenticado, rechaza campos adicionales y valida las fechas. El acceso restante está denegado. Los documentos padre `users/{uid}` no necesitan crearse para usar su subcolección.

**Alcance de la sesión anónima:** otro navegador o dispositivo obtiene un catálogo distinto. Borrar los datos del navegador puede hacer perder el acceso a esa identidad. Este laboratorio no incluye cuentas recuperables ni un directorio compartido entre usuarios.

## Conectar un proyecto Firebase en la nube

El repositorio está configurado y probado con emuladores. Para usar una instancia real:

1. Crea o selecciona tu proyecto en la [consola de Firebase](https://console.firebase.google.com/) y registra una aplicación web.
2. Crea una base **Cloud Firestore** predeterminada (`(default)`).
3. En **Authentication → Sign-in method**, habilita **Anónimo**. Revisa los dominios autorizados para el dominio desde el que usarás la aplicación.
4. Copia los valores de la configuración web de tu proyecto a `.env.local` y cambia el modo:

   ```dotenv
   NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
   NEXT_PUBLIC_FIREBASE_API_KEY=valor-de-tu-proyecto
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
   NEXT_PUBLIC_FIREBASE_APP_ID=valor-de-tu-aplicacion-web
   ```

5. Autentica la CLI y publica las reglas e índices en **tu** proyecto:

   ```bash
   npx firebase login
   npx firebase deploy --only firestore:rules,firestore:indexes --project TU_PROJECT_ID
   ```

6. Ejecuta `npm run dev`. Al cambiar variables, reinicia Next.js. Para producción, configúralas antes de `npm run build`, ya que las variables `NEXT_PUBLIC_` se incorporan a la compilación.

No se requieren claves privadas ni cuentas de servicio en el navegador. `.env.local` está excluido de Git; `.env.example` contiene solamente valores ficticios para emuladores. La autorización de datos depende de Authentication y las reglas publicadas.

## Estructura

```text
firebase/firebase.config.ts       Inicialización, sesión y emuladores
src/app/                         Página, layout y estilos
src/components/EmployeeCatalog.tsx  Catálogo y coordinación del CRUD
src/components/EmployeeForm.tsx   Alta y edición
src/components/DeleteDialog.tsx   Confirmación de eliminación
src/lib/employee.ts               Tipos, normalización y validaciones
src/lib/employees.ts              Operaciones reales de Firestore
firestore.rules                  Autorización y validación en Firebase
firebase.json                    Emuladores de desarrollo
firebase.test.json               Emulador aislado de pruebas
scripts/emulators.mjs            Inicio, importación y exportación local
tests/                           Pruebas de dominio, integración y reglas
```

## Validación

```bash
npm test
npm run test:firebase
npm run lint
npm run build
```

- **3 pruebas de dominio:** normalización sin mutación, datos inválidos y caracteres acentuados.
- **5 pruebas de integración y seguridad:** CRUD contra Firestore, rechazo sin autenticación, aislamiento entre usuarios, rechazo de datos inválidos y protección de `createdAt`.
- Las pruebas Firebase usan `demo-lab2-tests` y el puerto `8188`, independiente del catálogo de desarrollo. Los mensajes `PERMISSION_DENIED` en estas pruebas son esperados al comprobar operaciones prohibidas.
- Verificación manual en navegador: creación, edición, persistencia al recargar, búsqueda, filtros, cancelación y eliminación; revisión de escritorio y móvil.

Para comprobar una compilación local de producción, mantén `npm run emulators` en otra terminal, ejecuta `npm run build` y después `npm start`. Detén previamente `npm run dev:local` para liberar los puertos.

La conexión con un proyecto Firebase en la nube y el despliegue web requieren configuración propia y no forman parte de las verificaciones locales realizadas.

## Referencias

- [SDK web de Firebase](https://firebase.google.com/docs/web/setup)
- [Agregar datos a Firestore](https://firebase.google.com/docs/firestore/manage-data/add-data)
- [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Autenticación anónima](https://firebase.google.com/docs/auth/web/anonymous-auth)

El alcance de esta entrega es el CRUD con Firebase de la diapositiva 8. La sección posterior del PDF dedicada a Supabase corresponde a otra tecnología.
