import type { KnowledgeDocument } from './types';

export const exampleDocuments: KnowledgeDocument[] = [
  {
    id: 'guide-rag',
    title: 'Guía de RAG e inteligencia artificial',
    origin: 'example',
    content: `RAG significa Retrieval-Augmented Generation, o generación aumentada por recuperación. Funciona combinando la búsqueda de información en una biblioteca de documentos con la generación de una respuesta mediante un modelo de lenguaje.

El proceso RAG tiene tres pasos: primero se divide cada documento en fragmentos; después se recuperan los fragmentos más relacionados con la pregunta; finalmente se incluyen esos fragmentos como contexto en el mensaje enviado al modelo de inteligencia artificial.

Un endpoint de IA es una dirección HTTP a la que una aplicación envía una solicitud para utilizar un modelo. En este laboratorio, React envía un POST a /api/chat y el servidor puede conectarse a una API compatible con Chat Completions. La clave de API se configura únicamente en el servidor.

Las fuentes permiten comprobar de dónde salió una respuesta. Las citas como [1] enlazan una afirmación con el fragmento recuperado. Si los documentos no contienen la respuesta, el asistente debe reconocerlo y pedir más información.

AdanGPT usa recuperación léxica local basada en términos y frecuencia inversa. No utiliza embeddings ni una base de datos vectorial. En modo demo extrae frases de los documentos; al configurar una clave válida, un modelo genera la respuesta usando los fragmentos recuperados.

RAG no elimina todos los errores de un modelo. Es necesario revisar las citas y tratar el texto de los documentos como información, nunca como instrucciones que sustituyan las reglas del asistente.`,
  },
  {
    id: 'guide-dragons',
    title: 'El pequeño atlas de los dragones',
    origin: 'example',
    content: `Los dragones son criaturas mitológicas que aparecen en relatos de distintas culturas. Sus características dependen de cada tradición; no son animales reales.

En muchas historias europeas, los dragones se representan con escamas, alas membranosas, cuatro patas y la capacidad de escupir fuego. A menudo custodian tesoros o lugares importantes. Un wyvern suele representarse con dos patas y dos alas.

En diversas tradiciones de Asia oriental, los dragones tienen cuerpos largos y serpentinos. Se relacionan con el agua, la lluvia, la buena fortuna y la sabiduría. Muchas representaciones no tienen alas.

El dragón de AdanGPT se llama Brasa. Es un personaje ficticio creado para este laboratorio: un pequeño guardián de la biblioteca, de escamas verde bosque y alas cobrizas. Su fuego representa las ideas que nacen de una buena pregunta.

Brasa echa fuego cuando se envía una pregunta o cuando se presiona el botón Encender la chispa. La animación está construida con SVG y CSS. Si el dispositivo prefiere movimiento reducido, la aplicación desactiva el movimiento decorativo.`,
  },
  {
    id: 'guide-react',
    title: 'Notas de React y endpoints',
    origin: 'example',
    content: `React es una biblioteca de JavaScript para construir interfaces mediante componentes. Un componente reúne el aspecto y el comportamiento de una parte de la pantalla. Las propiedades transmiten información y el estado representa datos que cambian durante la interacción.

El hook useState permite manejar estado local, por ejemplo el texto del mensaje o la lista de conversaciones. useEffect sincroniza el componente con sistemas externos, como una petición HTTP o el almacenamiento del navegador.

Para llamar a una API desde React se puede usar fetch con un método HTTP, encabezados y un cuerpo JSON. Una solicitud POST envía datos; una solicitud GET recupera información. Se debe comprobar response.ok antes de utilizar el resultado.

Una aplicación de chat necesita manejar al menos los estados de espera, envío, respuesta y error. Deshabilitar envíos duplicados y permitir cancelar una solicitud mejora la experiencia. Un AbortController permite cancelar fetch.

Las claves privadas no deben incluirse en el código de React ni en variables VITE_. El navegador puede inspeccionar el código y las solicitudes. El patrón de este laboratorio utiliza un servidor intermedio que guarda la clave en una variable de entorno y expone /api/chat.

En desarrollo, Vite sirve la interfaz y redirige /api al servidor de Node. En producción, el servidor de Node entrega los archivos de dist y mantiene el mismo endpoint. No se necesita configurar CORS al usar el mismo origen.`,
  },
];
