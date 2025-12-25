import { z } from 'zod';
import { 
  insertTenantSchema, 
  insertUserSchema, 
  insertProjectSchema, 
  insertTaskSchema,
  loginSchema,
  registerTenantSchema,
  tenants,
  users,
  projects,
  tasks,
  auditLogs
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  })
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: loginSchema,
      responses: {
        200: z.object({
          token: z.string(),
          user: z.custom<typeof users.$inferSelect>(),
          tenant: z.custom<typeof tenants.$inferSelect>().optional()
        }),
        401: errorSchemas.unauthorized,
      }
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: registerTenantSchema,
      responses: {
        201: z.object({
          token: z.string(),
          user: z.custom<typeof users.$inferSelect>(),
          tenant: z.custom<typeof tenants.$inferSelect>()
        }),
        400: errorSchemas.validation,
        409: errorSchemas.conflict
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.object({
          user: z.custom<typeof users.$inferSelect>(),
          tenant: z.custom<typeof tenants.$inferSelect>().optional()
        }),
        401: errorSchemas.unauthorized
      }
    }
  },
  tenants: {
    list: {
      method: 'GET' as const,
      path: '/api/tenants',
      responses: {
        200: z.array(z.custom<typeof tenants.$inferSelect>()),
        403: errorSchemas.forbidden
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/tenants/:id',
      responses: {
        200: z.custom<typeof tenants.$inferSelect>(),
        404: errorSchemas.notFound,
        403: errorSchemas.forbidden
      }
    }
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
        403: errorSchemas.forbidden
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/users/:id',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
        403: errorSchemas.forbidden
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        403: errorSchemas.forbidden
      }
    }
  },
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema.omit({ tenantId: true, createdBy: true }), // Backend infers these
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/projects/:id',
      input: insertProjectSchema.partial().omit({ tenantId: true, createdBy: true }),
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        404: errorSchemas.notFound,
        403: errorSchemas.forbidden
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/projects/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        403: errorSchemas.forbidden
      }
    }
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      input: z.object({
        projectId: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: insertTaskSchema.omit({ tenantId: true }), // Backend infers tenant
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id',
      input: insertTaskSchema.partial().omit({ tenantId: true }),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
        403: errorSchemas.forbidden
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        403: errorSchemas.forbidden
      }
    }
  },
  health: {
    check: {
      method: 'GET' as const,
      path: '/api/health',
      responses: {
        200: z.object({
          status: z.string(),
          database: z.string()
        })
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
