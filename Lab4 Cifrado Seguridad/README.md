# Lab4 Cifrado Seguridad

Aplicación en React, TypeScript y Vite para cumplir la actividad **Lab 4 Cipher and Decipher** del material `TC3005B_Hash-Cipher-Decipher (1).pdf`.

El formulario permite escribir texto plano, cifrarlo, mostrar y copiar el resultado, descifrarlo con la misma llave y mostrar el texto original. Todo el procesamiento ocurre localmente en el navegador mediante Web Crypto API.

## Ejecutar

Requiere Node.js 22.12 o superior.

```bash
npm ci
npm run dev
```

Abre <http://127.0.0.1:3004>.

## Uso

1. Escribe el texto plano.
2. Introduce una llave de al menos ocho caracteres. Para un uso real, utiliza una frase larga, única y difícil de adivinar.
3. Presiona **Cifrar texto**. El resultado comienza con `crypta.v1`.
4. Conserva juntos el texto cifrado y la llave. La aplicación no guarda la llave y no puede recuperarla.
5. Para descifrar, pega un resultado `crypta.v1` en la caja de texto cifrado, introduce la llave correcta y presiona **Descifrar texto**.

El texto cifrado puede compartirse; la llave debe enviarse por un canal distinto y seguro. Este laboratorio no administra llaves ni sustituye un gestor de secretos.

## Diseño criptográfico

La presentación muestra AES con una llave fija y ejemplos de AES-CBC/CryptoJS. La aplicación usa primitivas nativas del navegador y genera parámetros nuevos en cada operación:

| Elemento | Implementación |
| --- | --- |
| Cifrado autenticado | AES-256-GCM |
| Derivación de llave | PBKDF2 con SHA-256 y 210,000 iteraciones |
| Sal | 16 bytes aleatorios por cifrado |
| IV | 12 bytes aleatorios por cifrado |
| Etiqueta de autenticación | Incluida por Web Crypto en el resultado AES-GCM |
| Codificación | Base64 URL-safe |

El formato transportable es:

```text
crypta.v1.<sal>.<iv>.<cifrado-y-etiqueta>
```

La sal y el IV no son secretos y se incluyen en el resultado. AES-GCM autentica el contenido: una llave incorrecta o cualquier modificación provoca que el descifrado falle. Aunque dos operaciones usen el mismo texto y llave, producen resultados diferentes por la sal y el IV aleatorios.

## Diferencia entre hash y cifrado

- Un **hash** es unidireccional. Para almacenar contraseñas se debe usar una función específica para contraseñas y comparar hashes; no se descifra la contraseña.
- El **cifrado** es reversible con una llave. Este laboratorio lo usa porque la actividad exige recuperar el texto original.

La aplicación no debe utilizarse para almacenar contraseñas reversibles. Para autenticación real, delega el manejo de contraseñas a un proveedor de identidad o backend especializado.

## Estructura

```text
src/App.tsx              Formulario y estados de la interfaz
src/lib/crypto.ts        Derivación, cifrado, formato y descifrado
src/lib/crypto.test.ts   Pruebas criptográficas
src/App.test.tsx         Prueba integral del formulario
src/styles.css           Diseño adaptable
```

## Validación

```bash
npm test
npm run lint
npm run build
npm audit --omit=dev
```

Las cinco pruebas cubren:

- cifrado y recuperación exacta de texto Unicode y multilínea;
- resultados diferentes con la misma entrada;
- rechazo de una llave equivocada;
- detección de contenido alterado y formato inválido;
- recorrido completo del formulario.

## Referencias

- [Web Cryptography API - W3C](https://www.w3.org/TR/WebCryptoAPI/)
- [Derivación de llaves con PBKDF2 - MDN](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey)
- [Cifrado con Web Crypto - MDN](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt)
