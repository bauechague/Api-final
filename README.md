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

En desarrollo (`NODE_ENV=development`) se loguea desde `debug` para arriba, en produccion solo desde `info` (no se ven `http` ni `debug`). Por consola sale todo coloreado; a archivo solo van `error` y `fatal`, en `logs/error-<fecha>.log`, con rotacion diaria y un maximo de 14 dias guardados (usa `winston-daily-rotate-file`). La carpeta `logs/` esta en el `.gitignore`, no se sube nada de ahi.

El middleware de errores loguea el `CustomError` (o `ValidationError`/`CastError`) como `warning` (son casos esperados del negocio) y cualquier otro error no controlado como `error`. Una falla al conectar a MongoDB en el arranque se loguea como `fatal`.

Para probar que los 6 niveles anden:

```bash
curl http://localhost:3000/api/logger/test
```

Eso tira un log de cada nivel por consola, y los de `error`/`fatal` deberian aparecer tambien en `logs/error-<fecha>.log`.

## Endpoints

| Metodo | Ruta                    | Descripcion              |
|--------|-------------------------|--------------------------|
| GET    | /api/users              | Listar usuarios          |
| GET    | /api/users/:uid         | Obtener usuario por ID   |
| POST   | /api/users              | Crear usuario            |
| DELETE | /api/users/:uid         | Eliminar usuario         |
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
| GET    | /api/mocks/users        | Generar usuarios simulados (no se guardan) |
| GET    | /api/mocks/orders       | Generar pedidos simulados (no se guardan) |
| GET    | /api/mocks/deliveries   | Generar entregas simuladas (no se guardan) |
| POST   | /api/mocks/seed         | Insertar datos de prueba en MongoDB |
| GET    | /api/logger/test        | Generar un log de cada nivel (debug/http/info/warning/error/fatal) |
