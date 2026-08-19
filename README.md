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

Los roles y los estados de producto estan en `src/constants/index.js` como objetos, no como strings sueltos.

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
