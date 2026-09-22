# Lab1 CRUD MD — Inventario de productos

## Objetivo

Especificar en Markdown la estructura de un proyecto React y sus funcionalidades esperadas, e implementar un CRUD organizado para administrar productos.

El proyecto es independiente de los demás ejercicios de `lab1`. Utiliza React, TypeScript y Vite. Como entidad de ejemplo se eligieron productos; los precios se expresan en pesos mexicanos (MXN).

## Ejecución

Requisitos: Node.js 22.13 o superior y npm. Se verificó con Node.js 22.23.1.

Desde la carpeta `lab1` que contiene este directorio:

```bash
cd "Lab1 CRUD MD"
npm install
npm run dev
```

Abrir la dirección local que indique Vite en la terminal. Para otras verificaciones:

```bash
npm run lint
npm test
npm run build
npm run preview
```

`build` valida TypeScript y genera la aplicación en `dist/`; `preview` sirve esa compilación. En este espacio de trabajo también se pueden reutilizar las dependencias ya instaladas en el directorio padre. Al copiar la carpeta a otro lugar se debe ejecutar `npm install`.

## Estructura del proyecto

```text
Lab1 CRUD MD/
├── README.md                    # Especificación y guía de uso
├── package.json                 # Dependencias y comandos
├── package-lock.json            # Versiones resueltas por npm
├── index.html                   # Documento de entrada en español
├── vite.config.ts               # Configuración de Vite y React
├── tsconfig.json                # Comprobación estricta de TypeScript
├── eslint.config.js             # Reglas de calidad de código
├── .gitignore                   # Archivos generados excluidos
├── src/
│   ├── main.tsx                 # Montaje de React
│   ├── App.tsx                  # Coordinación de vistas y acciones
│   ├── styles.css               # Diseño adaptable y estilos
│   ├── components/
│   │   ├── ProductForm.tsx      # Formulario de alta y edición
│   │   └── ProductTable.tsx     # Listado y acciones de cada registro
│   ├── hooks/
│   │   └── useProducts.ts       # Estado, operaciones CRUD y errores
│   ├── services/
│   │   └── productStorage.ts   # Lectura y escritura en localStorage
│   └── types/
│       └── product.ts          # Modelo de datos y validaciones
└── tests/
    └── products.test.ts        # Pruebas de validación y persistencia
```

### Responsabilidades y flujo

1. `main.tsx` monta `App` dentro de `StrictMode`.
2. `App` coordina el formulario, la búsqueda, el listado y la confirmación de eliminación.
3. `ProductForm` captura y valida los campos; comunica los datos a `App` mediante propiedades callback.
4. `useProducts` valida nuevamente las operaciones y construye el nuevo inventario sin mutar el estado anterior.
5. `productStorage` guarda los datos. Solo después de una escritura exitosa se actualiza el estado de React.
6. `ProductTable` recibe los productos filtrados y muestra sus acciones.

No se requiere un servidor, una API externa ni una base de datos. La capa de almacenamiento está separada para facilitar su futura sustitución por una API.

## Modelo de datos

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `string` | UUID generado al crear; no editable. |
| `name` | `string` | Obligatorio, de 1 a 80 caracteres tras quitar espacios exteriores. |
| `description` | `string` | Opcional, máximo 300 caracteres. |
| `price` | `number` | Obligatorio, de 0 a 999,999,999.99 MXN; máximo dos decimales. |
| `stock` | `number` | Obligatorio, entero de 0 a 999,999,999. |
| `createdAt` | `string` | Fecha ISO generada al crear; se conserva al editar. |

Un producto con cero existencias muestra la etiqueta **Agotado**. Nombre repetido está permitido: cada registro se identifica por su UUID.

## Funcionalidades esperadas e implementadas

| Operación | Comportamiento |
| --- | --- |
| Crear (Create) | Capturar datos válidos, generar ID y fecha, guardar y limpiar el formulario. |
| Consultar (Read) | Mostrar nombre, descripción, precio, existencias y acciones en una tabla. |
| Actualizar (Update) | Cargar un registro en el formulario y guardar sus cambios conservando su ID y fecha. |
| Eliminar (Delete) | Solicitar confirmación; cancelar conserva el registro y confirmar lo elimina. |
| Buscar | Filtrar por nombre o descripción sin distinguir mayúsculas. |
| Cancelar edición | Descartar cambios del formulario y regresar al modo de creación. |
| Resumen | Mostrar total de productos, unidades disponibles y productos agotados. |
| Persistencia | Restaurar los registros al recargar el mismo origen en el mismo navegador. |
| Retroalimentación | Mostrar mensajes de éxito, errores y estados vacíos. |
| Adaptación | Apilar paneles en pantallas pequeñas y permitir desplazamiento horizontal de la tabla. |

Los campos tienen etiquetas, foco visible y validación nativa del navegador complementada con validación de dominio. Los avisos de éxito usan `role="status"` y los errores `role="alert"`.

## Persistencia y alcance

- Se usa la clave `lab1-crud-products-v1` de `localStorage` y se inicia con un inventario vacío.
- Los registros pertenecen a ese navegador y origen (protocolo, host y puerto). Cambiar de puerto, de navegador o borrar los datos del sitio puede dar lugar a un inventario vacío.
- Es un ejercicio local para una pestaña de trabajo: no incluye autenticación, sincronización entre pestañas o dispositivos, ni acceso multiusuario.
- Si la lectura inicial falla o los datos están corruptos, se muestra un error y se bloquean las altas para evitar sobrescribirlos. Revisar permisos o respaldar/corregir la clave desde las herramientas del navegador y recargar.
- Si una escritura falla por permisos o falta de espacio, el estado anterior y los campos capturados se conservan para volver a intentarlo.
- La eliminación confirmada no tiene función de deshacer.
- Las fuentes de Google son opcionales: si no están disponibles se usan fuentes del sistema. El CRUD no depende de esa conexión.

## Criterios de aceptación y comprobación manual

1. Abrir la aplicación sin datos: aparece el mensaje de inventario vacío y los tres contadores en cero.
2. Crear `Cuaderno`, descripción `100 hojas`, precio `49.90` y existencias `8`: aparece una fila y los contadores se actualizan.
3. Recargar: el producto permanece.
4. Buscar `CUADERNO` o `hojas`: aparece el producto. Buscar algo inexistente muestra **Sin coincidencias**.
5. Editar el producto, cambiar precio a `59.90` y existencias a `0`, y guardar: la misma fila se actualiza y muestra **Agotado**.
6. Iniciar otra edición, cambiar el nombre y cancelar: el registro conserva su nombre anterior.
7. Intentar crear con nombre vacío o solo espacios, precio negativo, más de dos decimales o existencias fraccionarias: se impide el guardado.
8. Solicitar eliminar y cancelar: el registro permanece. Repetir y confirmar: desaparece y los contadores vuelven a cero.
9. Recargar después de eliminar: el registro sigue eliminado.
10. Revisar la interfaz en una pantalla estrecha y recorrer los controles con el teclado.

## Pruebas automáticas

`npm test` ejecuta seis pruebas con el ejecutor integrado de Node.js: inventario inicial, persistencia de altas/cambios/bajas, rechazo de datos corruptos e IDs duplicados, propagación de fallas de almacenamiento, aceptación de ceros y rechazo de campos inválidos. Son pruebas de dominio y almacenamiento; los flujos de la interfaz se comprueban por separado con la guía anterior.
