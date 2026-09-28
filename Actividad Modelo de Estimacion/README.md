# Actividad Modelo de Estimación

Aplicación web **Estima**, desarrollada en React y TypeScript para aplicar **COCOMO 81 básico**. El método elegido satisface el objetivo de realizar estimaciones mediante alguno de los modelos propuestos en la actividad.

## Ejecutar

Requisitos: Node.js 22.13 o superior y npm.

Desde la raíz del repositorio:

```bash
cd "Actividad Modelo de Estimacion"
npm ci
npm run dev
```

Abrir la dirección que muestre Vite. Los archivos y dependencias de esta aplicación están contenidos en su propia carpeta.

```bash
npm test          # Pruebas de cálculos, límites, unidades y reporte
npm run lint     # Reglas de React y TypeScript
npm run build    # Validación de tipos y compilación en dist/
npm run preview  # Vista previa de la compilación
```

## Funcionalidades

- Estimación inmediata para los modos orgánico, semiacoplado y empotrado.
- Tamaño de entrada en LOC o KLOC; cambiar de unidad convierte el valor.
- Esfuerzo (personas-mes), duración (meses), equipo promedio equivalente, costo laboral (MXN) y productividad (LOC/persona-mes).
- Fórmulas con sustitución numérica y coeficientes visibles.
- Sensibilidad frente a cambios de tamaño de −20% y +20%; no representa un intervalo de confianza.
- Caso resuelto de una ToDoList colaborativa hipotética.
- Comprobación numérica de los tres modos y un ejercicio académico externo identificado.
- Descarga del reporte actual en Markdown.
- Validación de datos inválidos y diseño adaptable a móvil.

## Modelo implementado

`KLOC = LOC / 1000`

`E = a × KLOC^b` (personas-mes)

`T = c × E^d` (meses)

`P = E / T` (personas equivalentes de tiempo completo)

`Costo = E × costo mensual por persona` (MXN)

`Productividad = LOC / E` (LOC/persona-mes)

| Modo         |   a |    b |   c |    d |
| ------------ | --: | ---: | --: | ---: |
| Orgánico     | 2.4 | 1.05 | 2.5 | 0.38 |
| Semiacoplado | 3.0 | 1.12 | 2.5 | 0.35 |
| Empotrado    | 3.6 | 1.20 | 2.5 | 0.32 |

Las operaciones conservan toda la precisión disponible; el redondeo es solo de presentación. Se implementa el modelo **básico**, sin EAF ni mezcla de coeficientes del modelo intermedio o COCOMO II.

## Estimación de un proyecto

El caso completo se encuentra en [docs/ESTIMACION.md](docs/ESTIMACION.md) y en la sección **Ejemplo resuelto** de la aplicación.

Para la ToDoList hipotética de 8 KLOC en modo orgánico, con costo mensual de $35,000 MXN por persona, se obtienen:

| Resultado       |                      Valor |
| --------------- | -------------------------: |
| Esfuerzo        |         21.30 personas-mes |
| Duración        |                 7.99 meses |
| Equipo promedio | 2.67 personas equivalentes |
| Costo laboral   |            $745,630.69 MXN |
| Productividad   |     375.52 LOC/persona-mes |

## Comprobación y material de clase

**Pendiente:** no se ha proporcionado el material con los ejercicios específicos de esta actividad. No se afirma que esos ejercicios hayan sido comprobados. Cuando se disponga de ellos, deberán incorporarse sus entradas y respuestas esperadas a las pruebas y a la sección Validación.

Mientras tanto se incluyen controles independientes y la referencia externa de University of California, Irvine: un proyecto semiacoplado de 32 KLOC produce 145.508790 PM y 14.287335 meses, compatibles con los 146 PM y 14 meses aproximados del ejemplo de la diapositiva 16.

Los controles de 10 KLOC orgánico, 32 KLOC semiacoplado y 100 KLOC empotrado se contrastan contra constantes obtenidas independientemente con `decimal` de Python a 40 dígitos. Las pruebas no generan sus valores esperados con la función que se está probando.

Verificación realizada: 13 pruebas automáticas, revisión estática y compilación de producción; navegación, cambio de modo, conversión de unidades, rechazo de entradas inválidas, vistas móviles de 390 px sin desbordamiento general y descarga del reporte comprobados en navegador. El archivo descargado coincide con el contenido calculado.

## Estructura

```text
Actividad Modelo de Estimacion/
├── src/
│   ├── App.tsx                      # Navegación, entradas y descarga
│   ├── main.tsx                     # Entrada de React
│   ├── styles.css                   # Estilos y adaptación a móvil
│   ├── components/
│   │   ├── EstimateForm.tsx          # Parámetros y conversión LOC/KLOC
│   │   ├── Results.tsx               # Métricas, fórmulas y sensibilidad
│   │   └── Learning.tsx              # Ejemplo y validación
│   └── lib/cocomo.ts                 # Función de cálculo pura y reporte
├── tests/cocomo.test.ts              # Pruebas automáticas
├── docs/ESTIMACION.md                # Estimación desarrollada
├── README.md
├── package.json
├── package-lock.json
├── index.html
├── vite.config.ts
├── tsconfig.json
└── eslint.config.js
```

## Alcance y supuestos

Los datos se mantienen en memoria; recargar restaura el ejemplo. El reporte descargado permite conservar una estimación. La app no necesita un servidor de aplicación ni transmite los parámetros a servicios externos.

El tamaño debe estar entre 0.001 y 10,000 KLOC; estos son límites de entrada de la herramienta, no una garantía de validez empírica del modelo en todo ese rango. LOC debe ser entero. La tarifa admite de 0 a 10,000,000 MXN; cero permite resolver ejercicios que no incluyen costos.

El esfuerzo no es tiempo de calendario: 21 personas-mes no significa que una persona terminará necesariamente en 21 meses ni que 21 personas terminarán en un mes. El equipo promedio es una equivalencia de dedicación, no un plan de contratación. El costo excluye infraestructura, impuestos y contingencias. La elección del modo depende del contexto del proyecto, no solo del tamaño.

## Fuentes

- Barry W. Boehm, _Software Engineering Economics_, 1981: origen del modelo.
- Michele Rousseau, University of California, Irvine, [INF 111 — Lecture Note 10, Effort Estimation](https://ics.uci.edu/~michele/Teaching/INF111-Sum08/Slides/INF%20111%20-%20SET%2010-6up.pdf), diapositivas 13–16: modos, fórmulas del modelo básico y ejemplo numérico.

No se incluye el PDF externo en el repositorio; se enlaza a su publicación original.
