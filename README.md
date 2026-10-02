# ShipNow API

API de ShipNow, refactorizada en capas (Controller, Service, Repository) para Usuarios y Productos, con validacion de variables de entorno al arranque.

## Como correrlo

```bash
npm install
cp .env.example .env
```

Completar el `.env` con `PORT`, `MONGODB_URI` y `NODE_ENV`. Si falta alguna, el server no arranca y tira un error diciendo cual falta.

```bash
npm run dev
```

## Por que separe Service y Repository

El Repository es lo unico que toca Mongoose: busca y guarda datos, nada mas. El Service tiene las reglas del negocio (validaciones, que un admin no se pueda crear por POST, calcular el status del producto segun el stock, etc). Asi el Service no depende de Mongoose para nada, solo llama al Repository, y si el dia de mañana cambio de base de datos solo toco el Repository.

Los roles, los estados de producto, pedido y entrega, y las prioridades estan en `src/constants/index.js` como objetos, no como strings sueltos.

## Mocking (`/api/mocks`)

Modulo aparte para generar datos de prueba, con las mismas capas que el resto (route -> controller -> service -> repository), usando los modelos y las constantes que ya estaban.

Con GET generas datos simulados sin tocar la base: `/api/mocks/users?qty=5` (podes filtrar con `?role=driver`, admin no esta permitido), `/api/mocks/orders?qty=5` y `/api/mocks/deliveries?qty=5`. Cada entrega generada viene con su pedido y su repartidor (rol `driver`) asociados.

Con POST `/api/mocks/seed?qty=10&type=users` insertas en Mongo de verdad. `type` puede ser `users` (default), `orders`, `deliveries` o `all`. Para `orders` usa clientes existentes (crea los que falten), para `deliveries` toma pedidos en estado `created` y repartidores existentes (idem, crea lo que falta) y al asignar la entrega actualiza el pedido a `assigned` con la referencia a la entrega. `all` corre los tres seeds seguidos.

```bash
curl "http://localhost:3000/api/mocks/users?qty=2"
curl -X POST "http://localhost:3000/api/mocks/seed?type=all&qty=10"
```

## Manejo de errores

Los services son los que detectan el problema y tiran un `CustomError` (`src/errors/custom-error.js`) con un codigo que sale del diccionario `src/errors/error-codes.js` (usuario no encontrado, pedido no encontrado, estado invalido, cantidad de mocks invalida, etc, cada uno con su status y su mensaje). Los controllers ya no arman ninguna respuesta de error, solo hacen `next(error)`. El unico que responde es el middleware `src/middlewares/error-handler.middleware.js`, al final de `app.js`/`server.js`, asi que toda respuesta de error tiene siempre la misma forma:

```json
{ "error": { "code": "ORDER_NOT_FOUND", "message": "Pedido no encontrado" } }
```

Si se cuela un error que no es un `CustomError` (un `ValidationError` o `CastError` de Mongoose, por ejemplo), el middleware igual lo mapea a esa misma estructura en vez de devolver el error crudo.

Para probar casos invalidos:

```bash
curl http://localhost:3000/api/orders/000000000000000000000000
curl "http://localhost:3000/api/mocks/users?qty=-5"
curl -X POST "http://localhost:3000/api/mocks/seed?type=noexiste"
```

En mocks: `qty` negativo, en cero, no numerico o mayor a 50 devuelve `INVALID_MOCK_QTY`; un `type` de seed que no sea `users`, `orders`, `deliveries` o `all` devuelve `INVALID_MOCK_TYPE`; y si falla la insercion en Mongo el service lo atrapa y devuelve `MOCK_SEED_FAILED` en vez del error crudo.

## Logging

El logger es Winston (`src/config/logger.config.js`), configurado una sola vez ahi y usado desde cualquier archivo importandolo. Niveles, de mas grave a menos: `fatal`, `error`, `warning`, `info`, `http`, `debug`.

En desarrollo (`NODE_ENV=development`) se loguea desde `debug` para arriba, en produccion solo desde `info` (no se ven `http` ni `debug`). La consola (coloreada) solo esta activa en desarrollo; en test y produccion el logger solo escribe a archivo, para no ensuciar la salida. A archivo van dos rotaciones diarias (usa `winston-daily-rotate-file`, maximo 14 dias guardados): `logs/error-<fecha>.log` con solo `error` y `fatal`, y `logs/combined-<fecha>.log` con toda la actividad desde el nivel minimo del ambiente. La carpeta `logs/` esta en el `.gitignore`, no se sube nada de ahi.

El middleware de errores loguea el `CustomError` (o `ValidationError`/`CastError`) como `warning` (son casos esperados del negocio) y cualquier otro error no controlado como `error`. Una falla al conectar a MongoDB en el arranque se loguea como `fatal`.

Para probar que los 6 niveles anden:

```bash
curl http://localhost:3000/api/logger/test
```

Eso tira un log de cada nivel (por consola si estas en desarrollo), y los de `error`/`fatal` deberian aparecer tambien en `logs/error-<fecha>.log` (y todos en `logs/combined-<fecha>.log`).

## Health check

Lo deje como ruta aparte del resto (`src/routes/health.routes.js` con su propio controller), para no mezclar una herramienta de infraestructura con los endpoints de negocio. Chequea si la conexion a MongoDB esta activa (`mongoose.connection.readyState`) y con eso responde si el servicio esta realmente en condiciones, no solo si el proceso esta vivo:

```bash
curl http://localhost:3000/api/health
```

Con la base conectada responde `200` con `{ "status": "ok", "uptime": ..., "db": "connected", "timestamp": ... }`. Si Mongo se cayo responde `503` con `status` y `db` en `error`/`disconnected`.

## Carga de archivos

Multer esta configurado en un solo lugar, `src/config/multer.config.js`, separado de las rutas: ahi se define donde se guarda cada archivo, como se le pone nombre (timestamp + sufijo random + extension original, para no pisar archivos ni depender del nombre que mande el cliente), que tipos de archivo se aceptan (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`) y el tamano maximo (5MB). Las rutas solo importan el middleware ya armado.

Los archivos quedan en `uploads/`, con una subcarpeta por entidad (`uploads/users`, `uploads/deliveries`), creadas solas la primera vez que se sube algo. `uploads/` esta en el `.gitignore`, no sube nada al repo.

En Mongo solo se guardan los metadatos (`originalName`, `generatedName`, `path`, `mimeType`, `size`, `documentType`, `uploadedAt`), nunca el archivo. Esta forma esta en `src/models/file-metadata.schema.js`, compartida entre `User` (array `documents`) y `Delivery` (campo `receipt`).

Dos endpoints:

- `POST /api/users/:uid/documents`: multipart con campo `file` y campo `documentType` (`dni`, `license`, `insurance` u `other`). Verifica que el usuario exista, valida el archivo y el tipo de documento, y lo agrega al array `documents` del usuario.
- `POST /api/deliveries/:did/receipt`: multipart con campo `file`. Verifica que la entrega exista, valida el archivo y lo guarda como `receipt` de esa entrega. Elegi que el comprobante cuelgue de la entrega (no del pedido) porque es la entidad que efectivamente representa la operacion de entrega.

Si algo falla despues de que Multer ya escribio el archivo en disco (la entidad no existe, el tipo de documento es invalido), el service borra ese archivo huerfano antes de responder el error, para no dejar nada suelto sin asociar.

Errores especificos: `FILE_REQUIRED`, `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `UNEXPECTED_FILE_FIELD` (si el campo del archivo no es `file`) e `INVALID_DOCUMENT_TYPE`, todos con el mismo formato que el resto de los errores del proyecto. El logger registra la carga exitosa, cualquier error de subida y el intento de tipo de archivo no permitido.

```bash
curl -X POST http://localhost:3000/api/users/<uid>/documents -F "documentType=license" -F "file=@licencia.pdf"
curl -X POST http://localhost:3000/api/deliveries/<did>/receipt -F "file=@comprobante.pdf"
```

## Documentacion con Swagger

Con el server levantado, la documentacion interactiva esta en `http://localhost:3000/api/docs`. El spec entero (info, tags, schemas y paths) esta armado a mano como un objeto en `src/config/swagger.config.js`, separado de las rutas; `src/routes/docs.routes.js` solo lo sirve con `swagger-ui-express`.

Esta documentado por tags: Users, Orders, Deliveries, Mocks, Logger y Health (los mismos modulos de este README). Cada endpoint tiene su metodo, parametros, body si le corresponde, y las respuestas de error reales que puede devolver, con el `code` tal cual sale del diccionario de `src/errors/error-codes.js`. Los schemas reutilizables son User, Order, Delivery, OrderItem, FileMetadata, ErrorResponse y MessageResponse (mas los de input para los POST/PATCH). En `/api/mocks/seed` se aclara que no lleva body, `qty` y `type` van por query. `/api/logger/test` esta marcado como herramienta interna, no como endpoint de negocio. Los dos endpoints de carga de archivos estan como `multipart/form-data`, con el campo `file` y, en el de documentos de usuario, `documentType`.

## Testing

Tests funcionales con Mocha (organiza y corre), Chai (asserts) y Supertest (pega contra la app de Express sin levantar puerto, importando directo `src/app.js`).

Corren contra su propia base, separada de la de desarrollo, con su propio archivo de entorno:

```bash
cp .env.test.example .env.test
```

Completar `.env.test` con un `MONGODB_URI` que apunte a una base de test (por ejemplo `mongodb://localhost:27017/shipnow_test`, nunca la misma que uses en desarrollo). El script de test fuerza `NODE_ENV=test` con `cross-env`, y con eso `env.config.js` carga `.env.test` en vez de `.env`. Si por lo que sea corre con otro `NODE_ENV`, el setup de los tests corta antes de tocar la base.

```bash
npm test
```

Cubre Users, Orders, Deliveries, Mocks, Logger, Health, la ruta de Swagger y la carga de archivos, con casos exitosos y de error (400/403/404/409 segun corresponda), chequeando siempre el status y el body, no solo que responda. Cada archivo en `test/` crea los datos que necesita (usuarios validos antes de pedidos, pedidos en `created` antes de entregas, etc) y al terminar borra lo que creo, incluidos los archivos subidos a `uploads/`; al final de toda la corrida, `test/setup.js` dropea la base de test entera como limpieza general.

## Docker

Arme el `Dockerfile` en dos etapas: una instala las dependencias de produccion (`npm ci --omit=dev`) y la otra copia solo esos `node_modules` y el codigo de `src`, sin devDependencies ni archivos de desarrollo (lo que no tiene que entrar en la imagen esta en `.dockerignore`).

Con `docker-compose up` se levanta la API junto con su propia instancia de MongoDB, sin depender de tener Mongo instalado aparte. Le puse `healthcheck` al servicio de Mongo y `depends_on: condition: service_healthy` en la API para que no intente conectarse hasta que la base este realmente lista, porque si no con mala suerte la API arranca mientras Mongo todavia esta inicializando y explota la conexion.

```bash
docker-compose up
```

Variables que usa el servicio `api` dentro de `docker-compose.yml` (no hace falta `.env` para este caso, `MONGODB_URI` ya apunta al servicio `mongo` de la red interna que crea Docker):

- `PORT` (default `3000`)
- `NODE_ENV` (default `production`)
- `MONGODB_URI` (fija en `mongodb://mongo:27017/shipnow`)

Si en cambio queres armar y correr solo la imagen de la API, sin compose, necesitas un Mongo accesible por tu cuenta:

```bash
docker build -t shipnow-api .
docker run -p 3000:3000 -e PORT=3000 -e NODE_ENV=production -e MONGODB_URI="mongodb://host.docker.internal:27017/shipnow" shipnow-api
```

## Endpoints

| Metodo | Ruta                    | Descripcion              |
|--------|-------------------------|--------------------------|
| GET    | /api/users              | Listar usuarios          |
| GET    | /api/users/:uid         | Obtener usuario por ID   |
| POST   | /api/users              | Crear usuario            |
| DELETE | /api/users/:uid         | Eliminar usuario         |
| POST   | /api/users/:uid/documents | Subir un documento del usuario |
| GET    | /api/products           | Listar productos         |
| GET    | /api/products/:pid      | Obtener producto por ID  |
| POST   | /api/products           | Crear producto           |
| PUT    | /api/products/:pid      | Actualizar producto      |
| DELETE | /api/products/:pid      | Eliminar producto        |
| GET    | /api/orders             | Listar pedidos           |
| GET    | /api/orders/:oid        | Obtener pedido por ID    |
| POST   | /api/orders             | Crear pedido             |
| PATCH  | /api/orders/:oid/status | Actualizar estado pedido |
| DELETE | /api/orders/:oid        | Eliminar pedido          |
| GET    | /api/deliveries         | Listar entregas          |
| GET    | /api/deliveries/:did    | Obtener entrega por ID   |
| POST   | /api/deliveries         | Crear entrega            |
| PATCH  | /api/deliveries/:did/status | Actualizar estado entrega |
| DELETE | /api/deliveries/:did    | Eliminar entrega         |
| POST   | /api/deliveries/:did/receipt | Subir el comprobante de una entrega |
| GET    | /api/mocks/users        | Generar usuarios simulados (no se guardan) |
| GET    | /api/mocks/orders       | Generar pedidos simulados (no se guardan) |
| GET    | /api/mocks/deliveries   | Generar entregas simuladas (no se guardan) |
| POST   | /api/mocks/seed         | Insertar datos de prueba en MongoDB |
| GET    | /api/logger/test        | Generar un log de cada nivel (debug/http/info/warning/error/fatal) |
| GET    | /api/docs               | Documentacion interactiva (Swagger UI) |
| GET    | /api/health             | Estado del servicio y de la conexion a MongoDB |
