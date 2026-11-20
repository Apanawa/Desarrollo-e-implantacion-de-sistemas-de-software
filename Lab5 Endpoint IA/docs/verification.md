# Verificación de AdanGPT

Validación local del laboratorio, realizada el 19 de noviembre de 2026 con Node.js 22.23.1 y npm 10.9.8.

## Comandos ejecutados

`npm run check` terminó con código 0. Extracto de la salida real:

```text
# tests 18
# suites 0
# pass 18
# fail 0
# cancelled 0
# skipped 0
# todo 0

> lab5-adangpt@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
✓ 2473 modules transformed.
```

`npm audit --omit=dev`:

```text
found 0 vulnerabilities
```

`npx prettier --check .`:

```text
All matched files use Prettier code style!
```

## Recorridos observados en navegador

| Recorrido                                             | Resultado observado                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Abrir la app sin `.env` ni API key                    | Indicador de modo demo y tres documentos de ejemplo.                           |
| Presionar Encender la chispa                          | Brasa activa la animación de fuego; la capa de fuego alcanza opacidad visible. |
| Preguntar qué es RAG                                  | Respuesta con un extracto de la guía y una cita verificable.                   |
| Abrir los fragmentos consultados                      | Se muestran títulos y texto original de las fuentes.                           |
| Importar `sample-library.md`                          | El archivo aparece en la biblioteca y queda activo.                            |
| Preguntar dónde vive Zephyr y el color de sus escamas | Se recuperan la montaña de obsidiana y las escamas azules del archivo propio.  |
| Desactivar el archivo y preguntar qué come Zephyr     | Informa que no hay información suficiente, sin usar el documento desactivado.  |
| Recargar la página                                    | Conversación y documento importado conservados.                                |
| Buscar un texto inexistente en el historial           | Se muestra el estado sin coincidencias.                                        |
| Copiar una respuesta                                  | Indicador Copiado y texto comprobado en el portapapeles del navegador.         |
| Descargar la conversación                             | Se crea `AdanGPT-conversacion.md`.                                             |
| Intentar importar un SVG                              | Se rechaza con un mensaje visible que solicita `.txt` o `.md`.                 |
| Abrir el menú móvil y presionar Escape                | El menú se cierra y el foco vuelve al control que lo abre.                     |
| Abrir la biblioteca en móvil                          | Diálogo y controles accesibles por nombre.                                     |
| Revisar escritorio, tableta y móvil                   | Sin desbordamiento horizontal; capturas adjuntas.                              |

## Versión compilada

Se inició `PORT=3007 npm start` para revisar la versión de `dist` sin interferir con el servidor de desarrollo:

```text
Interfaz compilada: HTTP 200
{"mode":"demo","model":"Recuperación local"}
```

Un `POST /api/chat` con un documento propio devolvió:

```json
{
  "message": "Esto es lo que encontré en tu biblioteca:\n\nZephyr vive en la montaña de obsidiana. [1]",
  "sources": [
    {
      "id": 1,
      "documentId": "zephyr",
      "title": "Mi dragón",
      "excerpt": "Zephyr vive en la montaña de obsidiana."
    }
  ],
  "mode": "demo",
  "model": "Recuperación local"
}
```

## Alcance de la verificación

La integración de Chat Completions se probó con un proveedor simulado: envío de clave desde el servidor, modelo, contexto, historial y manejo de errores. No se utilizó una clave real ni se hicieron solicitudes de pago. No se ejecutó una auditoría automatizada de accesibilidad.

Capturas de la interfaz compilada: [escritorio](desktop.jpg), [tableta](tablet.jpg) y [móvil](mobile.jpg).
