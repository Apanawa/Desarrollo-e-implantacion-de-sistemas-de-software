# Estimación COCOMO de una ToDoList colaborativa

## 1. Proyecto y supuestos

Proyecto hipotético: aplicación web para que un equipo registre proyectos y tareas, asigne responsables, establezca fechas y consulte reportes.

Se asume que el equipo conoce las tecnologías, que los requisitos son estables y que no existen restricciones críticas de hardware o tiempo real. Por ello se selecciona el modo **orgánico** de **COCOMO 81 básico**.

Esta estimación se elabora antes del desarrollo. Los tamaños siguientes son supuestos académicos; no se han contado líneas del directorio `toDoList` existente ni de esta calculadora.

## 2. Descomposición del tamaño

| Módulo                        | LOC estimadas |
| ----------------------------- | ------------: |
| Interfaz y navegación         |         2,000 |
| API de tareas y proyectos     |         2,500 |
| Autenticación y permisos      |         1,000 |
| Persistencia y acceso a datos |         1,000 |
| Filtros y reportes            |         1,500 |
| **Total**                     |     **8,000** |

Se contempla código propio entregado del producto. No se suman dependencias instaladas, archivos compilados ni código generado. Los módulos se consideran sin duplicar código compartido.

`KLOC = 8,000 / 1,000 = 8`

## 3. Esfuerzo

Para modo orgánico: `a = 2.4`, `b = 1.05`, `c = 2.5`, `d = 0.38`.

```text
E = a × KLOC^b
E = 2.4 × 8^1.05
E = 21.3037338637 personas-mes
E ≈ 21.30 personas-mes
```

## 4. Duración

```text
T = c × E^d
T = 2.5 × 21.3037338637^0.38
T = 7.9937982892 meses
T ≈ 7.99 meses
```

## 5. Equipo promedio

```text
P = E / T
P = 21.3037338637 / 7.9937982892
P = 2.6650327032 personas equivalentes
P ≈ 2.67 personas equivalentes de tiempo completo
```

Un punto de partida para planear recursos sería cerca de tres personas. Esta aproximación no determina qué roles trabajan cada mes ni garantiza terminar en ocho meses.

## 6. Costo laboral y productividad

Se asume un costo integral de trabajo de **$35,000 MXN por persona-mes**. Es un supuesto para el ejercicio, no una tarifa investigada del mercado.

```text
Costo = E × costo mensual por persona
Costo = 21.3037338637 × 35,000
Costo ≈ $745,630.69 MXN

Productividad = LOC / E
Productividad = 8,000 / 21.3037338637
Productividad ≈ 375.52 LOC/persona-mes
```

El presupuesto mostrado no incluye infraestructura, impuestos ni contingencias. La aplicación conserva precisión completa y redondea únicamente la salida visible.

## 7. Comprobación independiente

Valores obtenidos con `decimal` de Python, a 40 dígitos de precisión, utilizados como constantes en las pruebas:

| Caso                  | Esfuerzo esperado (PM) | Duración esperada (meses) |
| --------------------- | ---------------------: | ------------------------: |
| Orgánico, 10 KLOC     |     26.928442903247122 |         8.738165793274268 |
| Semiacoplado, 32 KLOC |    145.508790384998216 |        14.287335375866539 |
| Empotrado, 100 KLOC   |    904.279115343448840 |        22.077851553442413 |

Reproducción del cálculo independiente:

```python
from decimal import Decimal, getcontext
getcontext().prec = 40
for a, b, d, size in [('2.4', '1.05', '.38', '10'),
                       ('3', '1.12', '.35', '32'),
                       ('3.6', '1.2', '.32', '100')]:
    effort = Decimal(a) * Decimal(size) ** Decimal(b)
    duration = Decimal('2.5') * effort ** Decimal(d)
    print(effort, duration)
```

Además, el ejemplo externo de UCI de 32 KLOC en modo semiacoplado reporta aproximadamente 146 PM y 14 meses. El resultado de la aplicación coincide al redondear a enteros. Sus cifras de productividad y personal emplean aproximaciones intermedias; no se fuerzan esas aproximaciones en el cálculo de la aplicación.

## 8. Comprobación con el material de clase

**Pendiente de recibir el material específico.** Los controles anteriores son comprobaciones numéricas y una referencia académica externa; no sustituyen la comparación solicitada con los ejercicios del curso.

Al recibir el material, registrar por ejercicio: modelo utilizado (básico/intermedio/II), modo, tamaño, unidades, tarifa si existe, resultados esperados, tolerancia de redondeo y resultado de la aplicación. Si utiliza otro modelo, se requiere incorporarlo explícitamente en lugar de mezclar sus coeficientes con los del modelo básico.

## 9. Fuente metodológica

[University of California, Irvine — INF 111, Lecture Note 10](https://ics.uci.edu/~michele/Teaching/INF111-Sum08/Slides/INF%20111%20-%20SET%2010-6up.pdf), diapositivas 13–16. COCOMO 81 básico, originado en el trabajo de Barry W. Boehm (1981).
