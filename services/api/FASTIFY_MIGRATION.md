# Express to Fastify Migration Guide

## Overview
This document outlines the changes needed to migrate all route handlers and middleware from Express to Fastify.

## Key Changes Required

### 1. Middleware Signature Changes

**Express Pattern (Old):**
```typescript
const middleware = (req: Request, res: Response, next: NextFunction) => {
  // logic
  next();
};
```

**Fastify Pattern (New):**
```typescript
const middleware = async (request: FastifyRequest, reply: FastifyReply) => {
  // logic - use return instead of next()
  // to continue, don't call anything
};
```

### 2. Request/Response API Changes

| Express | Fastify |
|---------|---------|
| `req.body` | `request.body` |
| `req.query` | `request.query` |
| `req.params` | `request.params` |
| `req.headers` | `request.headers` |
| `req.user` (custom) | `request.user` (needs decoration) |
| `res.json(data)` | `return reply.send(data)` |
| `res.status(404).json(err)` | `return reply.code(404).send(err)` |
| `next(err)` | `throw err` or `reply.send(err)` |

### 3. Route Handler Pattern

**Express (Old):**
```typescript
router.post('/login', validate(schema), async (req, res, next) => {
  try {
    const result = await login(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});
```

**Fastify (New):**
```typescript
export default async function loginRoutes(fastify: FastifyInstance) {
  fastify.post('/login', {
    preHandler: [validate(schema)],
    schema: { /* OpenAPI schema for validation */ }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await login(request.body);
    return reply.send({ success: true, data: result });
  });
}
```

### 4. Authentication Middleware

Must decorate the request with user data:

```typescript
// In app.ts, register the decoration
app.decorateRequest('user', null);

// In auth middleware
declare module 'fastify' {
  interface FastifyRequest {
    user: UserPayload | null;
  }
}
```

### 5. File Uploads (Multer → @fastify/multipart)

**Express (Old):**
```typescript
const upload = multer({ storage });
router.post('/upload', upload.single('file'), handler);
// Access file: req.file
```

**Fastify (New):**
```typescript
fastify.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => {
  const data = await request.file();
  const file = data.file; // stream
  const filename = data.filename;
  // Process file stream
});
```

### 6. Error Handling

**Express (Old):**
```typescript
const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
};
```

**Fastify (New):**
```typescript
const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  const statusCode = error.statusCode || 500;
  return reply.code(statusCode).send({ error: error.message });
};

// Set in app.ts:
app.setErrorHandler(errorHandler);
```

### 7. Static Files

**Express (Old):**
```typescript
app.use('/uploads', express.static('public/uploads'));
```

**Fastify (New):**
```typescript
app.register(fastifyStatic, {
  root: join(process.cwd(), 'public/uploads'),
  prefix: '/uploads',
});
```

### 8. Rate Limiting

**Express (Old):**
```typescript
app.use(generalLimiter);
```

**Fastify (New):**
```typescript
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
```

## Files That Need Updates

### Middleware (5 files)
- [ ] `src/middleware/auth.ts` - Adapt to FastifyRequest/FastifyReply
- [ ] `src/middleware/errorHandler.ts` - Convert to Fastify error handler
- [ ] `src/middleware/rateLimiter.ts` - Replace with @fastify/rate-limit config
- [ ] `src/middleware/roleGuard.ts` - Adapt to Fastify pattern
- [ ] `src/middleware/validator.ts` - Replace with fastify-type-provider-zod or preHandler

### Routes (16 files)
All route files need to be converted from Express Router pattern to Fastify plugin pattern:
- [ ] `src/routes/auth.routes.ts`
- [ ] `src/routes/customer.routes.ts`
- [ ] `src/routes/pandit.routes.ts`
- [ ] `src/routes/ritual.routes.ts`
- [ ] `src/routes/booking.routes.ts`
- [ ] `src/routes/payment.routes.ts`
- [ ] `src/routes/review.routes.ts`
- [ ] `src/routes/admin.routes.ts`
- [ ] `src/routes/notification.routes.ts`
- [ ] `src/routes/travel.routes.ts`
- [ ] `src/routes/muhurat.routes.ts`
- [ ] `src/routes/samagri.routes.ts`
- [ ] `src/routes/voice.routes.ts`
- [ ] `src/routes/kyc.routes.ts`
- [ ] `src/routes/onboarding.routes.ts`
- [ ] `src/routes/upload.routes.ts`

### Route Export Pattern Change

**Old (Express):**
```typescript
export default router;
```

**New (Fastify):**
```typescript
export default async function routesName(fastify: FastifyInstance) {
  fastify.get('/', handler);
  fastify.post('/create', handler);
}
```

## Testing Strategy

1. Update one route file at a time
2. Run TypeScript compiler to catch type errors
3. Test with API client (Postman/Insomnia)
4. Verify all endpoints work before moving to next

## TypeScript Declarations

Add to `src/types/fastify.d.ts`:
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user: UserPayload | null;
  }
}

interface UserPayload {
  id: string;
  userId: string;
  phone: string;
  role: string;
  name: string;
  isVerified: boolean;
}
```

## Next Steps

1. Create TypeScript declarations for Fastify
2. Update middleware files one by one
3. Update route files one by one
4. Test all endpoints
5. Remove Express dependencies from devDependencies
6. Update documentation
