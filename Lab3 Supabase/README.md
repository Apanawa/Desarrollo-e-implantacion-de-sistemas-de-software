# Lab3 CRUD Supabase - Gestor de pendientes

Aplicación web en React, TypeScript y Vite que implementa el CRUD solicitado en la actividad **Lab3 CRUD Supabase**, tomando como base las diapositivas 9 a 15 de `TC3005B_CRUD_Next_Firebase (1).pdf`.

La aplicación consulta, crea, edita, completa, reabre y elimina tareas de la tabla `pendientes` mediante `@supabase/supabase-js`. También incluye búsqueda, filtros, prioridades, estados de carga, mensajes de resultado y diseño adaptable.

## Requisitos

- Node.js 22.12 o superior.
- Un proyecto de Supabase.
- Una aplicación web habilitada para usar sesiones anónimas.

## Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard).
2. Abre **Authentication > Sign In / Providers > Anonymous** y activa los inicios de sesión anónimos.
3. Abre **SQL Editor**, pega el contenido de [`supabase/migrations/20261005000000_create_pendientes.sql`](supabase/migrations/20261005000000_create_pendientes.sql) y ejecútalo.
4. En el diálogo **Connect** del proyecto, copia la Project URL y la publishable key. No uses una secret key en el navegador.
5. Prepara las variables del proyecto:

   ```bash
   cp .env.example .env.local
   ```

6. Sustituye los valores de `.env.local`:

   ```dotenv
   VITE_SUPABASE_URL=https://TU_REFERENCIA.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
   ```

La variable heredada `VITE_SUPABASE_KEY` también se acepta para proyectos que todavía muestran una `anon key`, aunque se recomienda usar la publishable key actual.

## Ejecutar

```bash
npm ci
npm run dev
```

Abre <http://127.0.0.1:3003>. La aplicación muestra una guía de configuración si faltan las variables.

## Operaciones implementadas

| Operación | Acción de Supabase |
| --- | --- |
| Consultar | `select('*').order('created_at')` |
| Crear | `insert(...).select().single()` |
| Editar | `update(...).eq('id', id).select().single()` |
| Completar/reabrir | `update({ is_completed }).eq('id', id)` |
| Eliminar | `delete().eq('id', id)` |

Los campos del catálogo son `title`, `description`, `priority`, `is_completed`, `user_id`, `created_at` y `updated_at`. El ID es UUID y se genera en PostgreSQL.

## Seguridad

La diapositiva 12 propone desactivar RLS. Esta implementación mantiene **Row Level Security habilitado** y crea una política independiente para `select`, `insert`, `update` y `delete`.

Cada navegador obtiene una sesión anónima persistente. La columna `user_id` se vincula a `auth.users`, y las políticas permiten acceder únicamente a las filas cuyo `user_id` coincide con `auth.uid()`. La migración también:

- revoca los permisos originales de `anon` y `authenticated`;
- concede al rol `authenticated` solo `select`, `insert`, `update` y `delete`;
- valida título, descripción y prioridad en PostgreSQL;
- actualiza `updated_at` mediante un trigger;
- crea un índice para las consultas por usuario y fecha.

Una sesión anónima no es una cuenta recuperable. Si se eliminan los datos del navegador, se pierde la identidad que da acceso a esas tareas.

## Estructura

```text
src/App.tsx                         Conexión y sesión anónima
src/components/TaskBoard.tsx        Interfaz y coordinación del CRUD
src/components/TaskForm.tsx         Alta y edición
src/components/DeleteDialog.tsx     Confirmación de eliminación
src/lib/supabase.ts                 Cliente de Supabase
src/lib/todoRepository.ts           Consultas y mutaciones
src/lib/todo.ts                     Tipos y validaciones
src/lib/database.types.ts           Tipos de la tabla
supabase/migrations/*.sql           Tabla, permisos, políticas e índice
```

## Validación

```bash
npm test
npm run lint
npm run build
```

Las pruebas cubren normalización y validaciones, además del flujo de interfaz completo: consultar, crear, editar, completar, buscar y eliminar mediante un repositorio de prueba con el mismo contrato que Supabase.

La conexión contra un proyecto remoto requiere la URL y publishable key de ese proyecto; esas credenciales no se incluyen en Git.

## Referencias

- [Cliente JavaScript de Supabase](https://supabase.com/docs/reference/javascript/initializing)
- [Operaciones `select`](https://supabase.com/docs/reference/javascript/select)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Claves de API](https://supabase.com/docs/guides/getting-started/api-keys)
