function errorResponse(description, code, message) {
  return {
    description,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        example: { error: { code, message } }
      }
    }
  };
}

const schemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'ORDER_NOT_FOUND' },
          message: { type: 'string', example: 'Pedido no encontrado' }
        }
      }
    }
  },
  MessageResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Usuario eliminado' }
    }
  },
  OrderItem: {
    type: 'object',
    required: ['name', 'quantity', 'price'],
    properties: {
      name: { type: 'string', example: 'Caja chica' },
      quantity: { type: 'integer', minimum: 1, example: 2 },
      price: { type: 'number', minimum: 0, example: 15000 }
    }
  },
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '64b7f7f7f7f7f7f7f7f7f7f7' },
      firstName: { type: 'string', example: 'Ana' },
      lastName: { type: 'string', example: 'Perez' },
      email: { type: 'string', format: 'email', example: 'ana.perez@test.com' },
      role: { type: 'string', enum: ['admin', 'customer', 'driver', 'store'], example: 'customer' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  UserInput: {
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'password'],
    properties: {
      firstName: { type: 'string', example: 'Ana' },
      lastName: { type: 'string', example: 'Perez' },
      email: { type: 'string', format: 'email', example: 'ana.perez@test.com' },
      password: { type: 'string', example: 'secreta123' },
      role: { type: 'string', enum: ['customer', 'driver', 'store'], example: 'customer' }
    }
  },
  Order: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '64b7f7f7f7f7f7f7f7f7f7f8' },
      customer: { type: 'string', example: '64b7f7f7f7f7f7f7f7f7f7f7' },
      items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
      deliveryAddress: { type: 'string', example: 'Av. Corrientes 1234' },
      total: { type: 'number', example: 30000 },
      status: { type: 'string', enum: ['created', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'], example: 'created' },
      priority: { type: 'string', enum: ['low', 'normal', 'high'], example: 'normal' },
      delivery: { type: 'string', nullable: true, example: null },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  OrderInput: {
    type: 'object',
    required: ['customer', 'items', 'deliveryAddress'],
    properties: {
      customer: { type: 'string', example: '64b7f7f7f7f7f7f7f7f7f7f7' },
      items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
      deliveryAddress: { type: 'string', example: 'Av. Corrientes 1234' },
      priority: { type: 'string', enum: ['low', 'normal', 'high'], example: 'normal' }
    }
  },
  OrderStatusInput: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['created', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'], example: 'assigned' }
    }
  },
  Delivery: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '64b7f7f7f7f7f7f7f7f7f7f9' },
      order: { type: 'string', example: '64b7f7f7f7f7f7f7f7f7f7f8' },
      driver: { type: 'string', nullable: true, example: '64b7f7f7f7f7f7f7f7f7f7fa' },
      status: { type: 'string', enum: ['pending', 'assigned', 'in_transit', 'delivered'], example: 'assigned' },
      priority: { type: 'string', enum: ['low', 'normal', 'high'], example: 'normal' },
      assignedAt: { type: 'string', format: 'date-time', nullable: true },
      deliveredAt: { type: 'string', format: 'date-time', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  DeliveryInput: {
    type: 'object',
    required: ['order', 'driver'],
    properties: {
      order: { type: 'string', example: '64b7f7f7f7f7f7f7f7f7f7f8' },
      driver: { type: 'string', example: '64b7f7f7f7f7f7f7f7f7f7fa' },
      priority: { type: 'string', enum: ['low', 'normal', 'high'], example: 'normal' }
    }
  },
  DeliveryStatusInput: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['pending', 'assigned', 'in_transit', 'delivered'], example: 'in_transit' }
    }
  },
  MockSeedResult: {
    type: 'object',
    properties: {
      insertados: { type: 'integer', example: 10 },
      coleccion: { type: 'string', example: 'usuarios' }
    }
  }
};

const qtyParam = {
  name: 'qty',
  in: 'query',
  required: false,
  description: 'Cantidad a generar. Entero positivo, maximo 50. Default 5.',
  schema: { type: 'integer', example: 5 }
};

const idParam = (name, example) => ({
  name,
  in: 'path',
  required: true,
  schema: { type: 'string', example }
});

const paths = {
  '/api/users': {
    get: {
      tags: ['Users'],
      summary: 'Listar usuarios',
      responses: {
        200: {
          description: 'Lista de usuarios',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }
        }
      }
    },
    post: {
      tags: ['Users'],
      summary: 'Crear un usuario',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } }
      },
      responses: {
        201: {
          description: 'Usuario creado',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
        },
        400: errorResponse('Faltan datos obligatorios', 'MISSING_FIELDS', 'Faltan datos obligatorios'),
        403: errorResponse('No se puede crear un usuario admin', 'FORBIDDEN_ROLE', 'No puedes crear admin'),
        409: errorResponse('El email ya esta registrado', 'EMAIL_ALREADY_REGISTERED', 'El email ya esta registrado')
      }
    }
  },
  '/api/users/{uid}': {
    get: {
      tags: ['Users'],
      summary: 'Obtener un usuario por ID',
      parameters: [idParam('uid', '64b7f7f7f7f7f7f7f7f7f7f7')],
      responses: {
        200: { description: 'Usuario encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        404: errorResponse('Usuario no encontrado', 'USER_NOT_FOUND', 'Usuario no encontrado')
      }
    },
    delete: {
      tags: ['Users'],
      summary: 'Eliminar un usuario',
      parameters: [idParam('uid', '64b7f7f7f7f7f7f7f7f7f7f7')],
      responses: {
        200: { description: 'Usuario eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        404: errorResponse('Usuario no encontrado', 'USER_NOT_FOUND', 'Usuario no encontrado')
      }
    }
  },
  '/api/orders': {
    get: {
      tags: ['Orders'],
      summary: 'Listar pedidos',
      responses: {
        200: { description: 'Lista de pedidos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } }
      }
    },
    post: {
      tags: ['Orders'],
      summary: 'Crear un pedido',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderInput' } } }
      },
      responses: {
        201: {
          description: 'Pedido creado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  order: { $ref: '#/components/schemas/Order' },
                  shippingCost: { type: 'number', example: 20 },
                  message: { type: 'string', example: 'Pedido creado y email enviado' }
                }
              }
            }
          }
        },
        400: errorResponse('Faltan datos obligatorios', 'MISSING_FIELDS', 'Falta el cliente'),
        403: errorResponse('Los repartidores no pueden crear pedidos', 'FORBIDDEN_ROLE', 'Los repartidores no pueden crear pedidos'),
        404: errorResponse('El cliente no existe', 'USER_NOT_FOUND', 'El usuario no existe')
      }
    }
  },
  '/api/orders/{oid}': {
    get: {
      tags: ['Orders'],
      summary: 'Obtener un pedido por ID',
      parameters: [idParam('oid', '64b7f7f7f7f7f7f7f7f7f7f8')],
      responses: {
        200: { description: 'Pedido encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
        404: errorResponse('Pedido no encontrado', 'ORDER_NOT_FOUND', 'Pedido no encontrado')
      }
    },
    delete: {
      tags: ['Orders'],
      summary: 'Eliminar un pedido',
      parameters: [idParam('oid', '64b7f7f7f7f7f7f7f7f7f7f8')],
      responses: {
        200: { description: 'Pedido eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        404: errorResponse('Pedido no encontrado', 'ORDER_NOT_FOUND', 'Pedido no encontrado')
      }
    }
  },
  '/api/orders/{oid}/status': {
    patch: {
      tags: ['Orders'],
      summary: 'Actualizar el estado de un pedido',
      parameters: [idParam('oid', '64b7f7f7f7f7f7f7f7f7f7f8')],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderStatusInput' } } }
      },
      responses: {
        200: { description: 'Pedido actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
        400: errorResponse('Estado invalido', 'INVALID_STATUS', 'Estado invalido'),
        404: errorResponse('Pedido no encontrado', 'ORDER_NOT_FOUND', 'Pedido no encontrado'),
        409: errorResponse('El pedido ya fue entregado', 'ORDER_ALREADY_DELIVERED', 'El pedido ya fue entregado')
      }
    }
  },
  '/api/deliveries': {
    get: {
      tags: ['Deliveries'],
      summary: 'Listar entregas',
      responses: {
        200: { description: 'Lista de entregas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Delivery' } } } } }
      }
    },
    post: {
      tags: ['Deliveries'],
      summary: 'Crear una entrega',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/DeliveryInput' } } }
      },
      responses: {
        201: { description: 'Entrega creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Delivery' } } } },
        400: errorResponse('El usuario no tiene rol de repartidor', 'INVALID_ROLE', 'El usuario no tiene rol de repartidor'),
        404: errorResponse('El pedido no existe', 'ORDER_NOT_FOUND', 'El pedido no existe'),
        409: errorResponse('El pedido ya fue asignado o procesado', 'ORDER_ALREADY_PROCESSED', 'El pedido ya fue asignado o procesado')
      }
    }
  },
  '/api/deliveries/{did}': {
    get: {
      tags: ['Deliveries'],
      summary: 'Obtener una entrega por ID',
      parameters: [idParam('did', '64b7f7f7f7f7f7f7f7f7f7f9')],
      responses: {
        200: { description: 'Entrega encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Delivery' } } } },
        404: errorResponse('Entrega no encontrada', 'DELIVERY_NOT_FOUND', 'Entrega no encontrada')
      }
    },
    delete: {
      tags: ['Deliveries'],
      summary: 'Eliminar una entrega',
      parameters: [idParam('did', '64b7f7f7f7f7f7f7f7f7f7f9')],
      responses: {
        200: { description: 'Entrega eliminada', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        404: errorResponse('Entrega no encontrada', 'DELIVERY_NOT_FOUND', 'Entrega no encontrada')
      }
    }
  },
  '/api/deliveries/{did}/status': {
    patch: {
      tags: ['Deliveries'],
      summary: 'Actualizar el estado de una entrega',
      parameters: [idParam('did', '64b7f7f7f7f7f7f7f7f7f7f9')],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/DeliveryStatusInput' } } }
      },
      responses: {
        200: { description: 'Entrega actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Delivery' } } } },
        400: errorResponse('Estado invalido', 'INVALID_STATUS', 'Estado invalido'),
        404: errorResponse('Entrega no encontrada', 'DELIVERY_NOT_FOUND', 'Entrega no encontrada'),
        409: errorResponse('La entrega ya fue completada', 'DELIVERY_ALREADY_COMPLETED', 'La entrega ya fue completada')
      }
    }
  },
  '/api/mocks/users': {
    get: {
      tags: ['Mocks'],
      summary: 'Generar usuarios simulados (no se guardan en la base)',
      parameters: [
        qtyParam,
        {
          name: 'role',
          in: 'query',
          required: false,
          description: 'Filtra el rol generado. No se permite admin.',
          schema: { type: 'string', enum: ['customer', 'driver', 'store'] }
        }
      ],
      responses: {
        200: { description: 'Usuarios simulados', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } },
        400: errorResponse('Cantidad invalida', 'INVALID_MOCK_QTY', 'La cantidad debe ser un numero entero positivo'),
        403: errorResponse('No se pueden simular usuarios admin', 'FORBIDDEN_ROLE', 'No se pueden simular usuarios admin')
      }
    }
  },
  '/api/mocks/orders': {
    get: {
      tags: ['Mocks'],
      summary: 'Generar pedidos simulados (no se guardan en la base)',
      parameters: [qtyParam],
      responses: {
        200: { description: 'Pedidos simulados', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } },
        400: errorResponse('Cantidad invalida', 'INVALID_MOCK_QTY', 'La cantidad debe ser un numero entero positivo')
      }
    }
  },
  '/api/mocks/deliveries': {
    get: {
      tags: ['Mocks'],
      summary: 'Generar entregas simuladas (no se guardan en la base)',
      parameters: [qtyParam],
      responses: {
        200: { description: 'Entregas simuladas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Delivery' } } } } },
        400: errorResponse('Cantidad invalida', 'INVALID_MOCK_QTY', 'La cantidad debe ser un numero entero positivo')
      }
    }
  },
  '/api/mocks/seed': {
    post: {
      tags: ['Mocks'],
      summary: 'Insertar datos de prueba en MongoDB',
      description: 'No recibe body. Con type=all la respuesta trae un MockSeedResult por coleccion (usuarios, pedidos, entregas) en vez de uno solo.',
      parameters: [
        qtyParam,
        {
          name: 'type',
          in: 'query',
          required: false,
          description: 'Coleccion a insertar. Default users.',
          schema: { type: 'string', enum: ['users', 'orders', 'deliveries', 'all'], example: 'users' }
        }
      ],
      responses: {
        201: { description: 'Datos insertados', content: { 'application/json': { schema: { $ref: '#/components/schemas/MockSeedResult' } } } },
        400: errorResponse('Cantidad o tipo invalido', 'INVALID_MOCK_QTY', 'La cantidad debe ser un numero entero positivo'),
        500: errorResponse('Fallo la insercion en MongoDB', 'MOCK_SEED_FAILED', 'Fallo la carga de datos de prueba en MongoDB')
      }
    }
  },
  '/api/logger/test': {
    get: {
      tags: ['Logger'],
      summary: 'Probar el logger',
      description: 'Herramienta interna para verificar la configuracion de Winston, no es una funcionalidad de negocio. Genera un log de cada nivel: debug, http, info, warning, error y fatal.',
      responses: {
        200: {
          description: 'Logs generados',
          content: {
            'application/json': {
              schema: { type: 'object', properties: { message: { type: 'string', example: 'Se generaron logs de todos los niveles' } } }
            }
          }
        }
      }
    }
  }
};

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ShipNow API',
    version: '1.0.0',
    description: 'API de logistica de ShipNow: usuarios, pedidos y entregas, con modulo de datos de prueba y logging integrado.'
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Servidor local' }
  ],
  tags: [
    { name: 'Users', description: 'Gestion de usuarios' },
    { name: 'Orders', description: 'Gestion de pedidos' },
    { name: 'Deliveries', description: 'Gestion de entregas' },
    { name: 'Mocks', description: 'Generacion y carga de datos de prueba' },
    { name: 'Logger', description: 'Endpoint interno para validar el logger' }
  ],
  components: { schemas },
  paths
};

export default swaggerSpec;
