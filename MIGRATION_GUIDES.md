# Complete Technology Migration Guide

This document provides step-by-step guides for all 10 technology migrations.

---

## Migration 2: localStorage Auth → HttpOnly Cookies + JWT

### Current State
- Tokens stored in `localStorage` (key: `hpj_token`)
- Frontend sets cookies via `document.cookie` (NOT HttpOnly, vulnerable to XSS)
- Backend returns token in response body
- Backend auth middleware only reads `Authorization` header

### Target State
- Backend sets HttpOnly, Secure, SameSite=Strict cookies
- Frontend NEVER sees the token (no localStorage)
- Browser automatically sends cookies with requests
- Backend reads cookies as fallback to Authorization header

### Implementation Steps

#### Step 1: Update Backend Auth Controller

File: `services/api/src/controllers/auth.controller.ts`

**Add cookie options:**
```typescript
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};
```

**Modify `verifyOtp` function:**
```typescript
// OLD: res.json({ success: true, data: { token, user } });

// NEW:
res.cookie("hpj_token", token, COOKIE_OPTIONS);
res.json({ 
  success: true, 
  data: { 
    user,
    message: "Login successful" 
  } 
});
```

**Add logout endpoint:**
```typescript
export function logout(req: Request, res: Response, next: NextFunction): void {
  res.clearCookie("hpj_token", { path: "/" });
  res.json({ success: true, message: "Logged out successfully" });
}
```

#### Step 2: Update Backend Auth Middleware

File: `services/api/src/middleware/auth.ts`

**Add cookie reading:**
```typescript
export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  let token: string | undefined;
  
  // Try Authorization header first
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }
  
  // Fallback to cookie
  if (!token) {
    token = request.cookies?.hpj_token;
  }

  if (!token) {
    throwUnauthorized("Missing authentication");
  }

  // ... rest of JWT verification logic
}
```

#### Step 3: Update Frontend Auth Context

File: `apps/web/src/context/auth-context.tsx`

**Remove localStorage operations:**
```typescript
// DELETE these lines:
// localStorage.setItem("hpj_token", token);
// document.cookie = `hpj_token=${token}; ...`;

// REPLACE saveTokens with:
function saveTokens(token: string): void {
  // Backend sets HttpOnly cookies - nothing to do client-side
  setAccessToken(token);
}

// REPLACE clearTokens with:
function clearTokens(): void {
  // Backend clears HttpOnly cookies - just clear local state
  setUser(null);
  setAccessToken(null);
}

// MODIFY bootstrap to call /auth/me without token
useEffect(() => {
  // Browser will automatically send hpj_token cookie
  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include", // Important!
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchUser();
}, []);
```

#### Step 4: Update All API Calls

Add `credentials: "include"` to all fetch/axios calls that need auth.

#### Security Benefits
✅ XSS attacks cannot steal tokens (HttpOnly)
✅ CSRF protection via SameSite=Strict
✅ Tokens never exposed to JavaScript
✅ Automatic cookie handling by browser

---

## Migration 3: Prisma 5 → Prisma 6

### Current State
- `packages/db`: Prisma 5.22.0
- `services/api`: Prisma 5.12.0
- Version mismatch causes potential issues

### Target State
- All packages use Prisma 6.x (latest stable)
- Better performance, improved type inference

### Implementation Steps

#### Step 1: Update package.json files

```bash
# In packages/db/package.json
"@prisma/client": "^6.0.0"
"prisma": "^6.0.0"

# In services/api/package.json  
"@prisma/client": "^6.0.0"
"prisma": "^6.0.0"
```

#### Step 2: Run Prisma upgrade

```bash
cd packages/db
pnpm install
npx prisma migrate dev
```

#### Step 3: Check for breaking changes

Prisma 6 breaking changes:
- `findUnique` now requires `@unique` fields
- Some date handling changes
- Improved null safety

Run TypeScript compiler to catch type errors:
```bash
pnpm -r type-check
```

#### Step 4: Test database operations

```bash
# Test all database queries
pnpm test
```

---

## Migration 4: ESLint 8 → ESLint 9 (Flat Config)

### Current State
- `.eslintrc.js` with legacy config format
- Missing Next.js plugin
- Config files ignored

### Target State
- `eslint.config.js` with flat config API
- Better plugin support
- All files linted

### Implementation Steps

#### Step 1: Delete old config

```bash
rm .eslintrc.js
```

#### Step 2: Create new flat config

File: `eslint.config.js`

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@next/next": nextPlugin,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@next/next/no-img-element": "warn",
    },
    settings: {
      react: { version: "detect" },
    },
  },
  {
    ignores: [
      "node_modules/",
      ".next/",
      "dist/",
      "coverage/",
      "pnpm-lock.yaml",
    ],
  },
  prettier,
];
```

#### Step 3: Update dependencies

```bash
pnpm add -D eslint@^9.0.0 @eslint/js@^9.0.0 typescript-eslint@^7.0.0
pnpm add -D eslint-plugin-react@^7.34.0 eslint-plugin-react-hooks@^4.6.0
pnpm add -D @next/eslint-plugin-next@^14.2.0
pnpm add -D eslint-config-prettier@^9.1.0
```

---

## Migration 5: Docker Compose Healthchecks

### Current State
- Root docker-compose.yml: Only postgres has healthcheck
- infrastructure/docker-compose.yml: All services have healthchecks
- Missing application service containers

### Target State
- All infrastructure services have healthchecks
- Application services defined with healthchecks
- Dependencies use `condition: service_healthy`

### Implementation

The infrastructure compose already has healthchecks. Update root docker-compose.yml:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: hpj_user
      POSTGRES_PASSWORD: hpj_password
      POSTGRES_DB: hmarepanditji
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hpj_user -d hmarepanditji"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 5s

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  pgadmin:
    image: dpage/pgadmin4:8.6  # Pin version!
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@hmarepanditji.com
      PGADMIN_DEFAULT_PASSWORD: StrongP@ssw0rd123!  # Use strong password
    ports:
      - "5050:80"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - pgadmin_data:/var/lib/pgadmin

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
  pgadmin_data:
```

---

## Migration 6: Redis-Only Caching

### Current State
- Two-tier: Redis + PostgreSQL muhurat_cache table
- Search service has Redis, API service has no caching

### Target State
- Redis-only for all caching
- Remove PostgreSQL cache table
- Add Redis to API service for future use

### Implementation Steps

#### Step 1: Update search-service cache

File: `services/search-service/src/muhurat/cache.js`

**Remove DB persistence:**
```javascript
// DELETE these functions:
// async function storeInDb(key, value, date, pujaType) { ... }
// async function getFromDb(key) { ... }

// MODIFY cacheMuhurat to Redis-only:
export async function cacheMuhurat(key, data, date, pujaType) {
  try {
    const redis = await getRedis();
    if (!redis) return;

    await redis.set(
      key,
      JSON.stringify({ data, date, pujaType, cachedAt: Date.now() }),
      "EX",
      CACHE_TTL_SECONDS
    );
  } catch (error) {
    console.error("Redis cache write failed:", error);
  }
}
```

#### Step 2: Remove PostgreSQL cache table

Create migration:
```sql
DROP TABLE IF EXISTS muhurat_cache;
```

#### Step 3: Add Redis to API service

File: `services/api/package.json`
```json
"ioredis": "^5.3.0"
```

File: `services/api/src/lib/redis.ts`
```typescript
import Redis from "ioredis";

let redis: Redis | null = null;

export async function getRedis(): Promise<Redis | null> {
  if (redis) return redis;
  
  try {
    redis = new Redis(process.env.REDIS_URL!);
    return redis;
  } catch (error) {
    console.error("Redis connection failed:", error);
    return null;
  }
}
```

---

## Migration 7: React Context → Zustand (Web App)

### Current State
- 3 contexts: auth, cart, samagri-cart
- Mix of localStorage and sessionStorage
- Inconsistent patterns

### Target State
- Zustand stores matching pandit app pattern
- Consolidated cart state
- Consistent persistence

### Implementation Steps

#### Step 1: Add Zustand to web app

```bash
cd apps/web
pnpm add zustand@^5.0.12
```

#### Step 2: Create auth store

File: `apps/web/src/stores/authStore.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  phone: string;
  role: string;
  name: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  loginModalOpen: boolean;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      loginModalOpen: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      openLoginModal: () => set({ loginModalOpen: true }),
      closeLoginModal: () => set({ loginModalOpen: false }),
      
      logout: async () => {
        await fetch("/api/v1/auth/logout", { 
          method: "POST",
          credentials: "include" 
        });
        set({ user: null, loginModalOpen: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

#### Step 3: Create cart store

File: `apps/web/src/stores/cartStore.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SamagriItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  samagriItem: SamagriItem | null;
  isCartOpen: boolean;
  
  setSamagriItem: (item: SamagriItem) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      samagriItem: null,
      isCartOpen: false,

      setSamagriItem: (item) => set({ samagriItem: item, isCartOpen: true }),
      clearCart: () => set({ samagriItem: null, isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    }),
    {
      name: "cart-storage",
    }
  )
);
```

#### Step 4: Replace Context providers

File: `apps/web/src/app/layout.tsx`

**OLD:**
```tsx
<AuthProvider>
  <SamagriCartProvider>
    <CartProvider>{children}</CartProvider>
  </SamagriCartProvider>
</AuthProvider>
```

**NEW:**
```tsx
// No providers needed - Zustand uses React Context internally
{children}
```

#### Step 5: Update component usage

**OLD:**
```typescript
const { user, loading, logout } = useAuth();
```

**NEW:**
```typescript
const user = useAuthStore((state) => state.user);
const loading = useAuthStore((state) => state.loading);
const logout = useAuthStore((state) => state.logout);
```

---

## Migration 8: Puter.js AI → Direct Anthropic API

### Current State
- Client-side Puter.js SDK
- No API key needed (Puter handles auth)
- Unreliable, user-pays model

### Target State
- Server-side API route with secret key
- Direct Anthropic API calls
- Better rate limiting and billing control

### Implementation Steps

#### Step 1: Add Anthropic API key

File: `.env.example`
```env
# ===== ANTHROPIC AI =====
ANTHROPIC_API_KEY=sk-ant-xxxxx
ANTHROPIC_MODEL=claude-sonnet-4-5-20250514
```

#### Step 2: Create API route

File: `apps/web/src/app/api/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250514";

const SYSTEM_PROMPT = `You are Guruji AI, a knowledgeable Hindu priest assistant for HmarePanditJi...`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.content?.[0]?.text || "No response";

    return NextResponse.json({ 
      success: true, 
      message: assistantMessage 
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
```

#### Step 3: Update puter-ai.ts

File: `apps/web/src/lib/puter-ai.ts`

```typescript
export async function chatWithClaude(
  userMessage: string,
  systemPrompt?: string,
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Chat request failed");
  }

  const data = await response.json();
  return data.message;
}

export async function chatMultiTurn(messages: any[]): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error("Chat request failed");
  }

  const data = await response.json();
  return data.message;
}
```

#### Step 4: Remove Puter.js SDK

File: `apps/web/src/app/layout.tsx`

**DELETE:**
```html
<script src="https://js.puter.com/v2/" async />
```

---

## Migration 9: Standardize on Vitest + Playwright

### Current State
- Jest in booking-service and search-service
- Vitest in pandit app
- No tests in web, admin, packages

### Target State
- All unit/integration tests use Vitest
- All E2E tests use Playwright
- Consistent test commands

### Implementation Steps

#### Step 1: Remove Jest configs

```bash
rm services/booking-service/jest.config.js
rm services/search-service/jest.config.js
```

#### Step 2: Create Vitest configs

File: `services/booking-service/vitest.config.ts`
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

File: `services/search-service/vitest.config.ts`
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

#### Step 3: Update package.json test scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

#### Step 4: Add Vitest to services

```bash
cd services/booking-service
pnpm add -D vitest @vitest/coverage-v8

cd services/search-service  
pnpm add -D vitest @vitest/coverage-v8
```

#### Step 5: Convert Jest tests to Vitest

Change in test files:
```typescript
// OLD (Jest):
import { describe, it, expect, jest } from "@jest/globals";

// NEW (Vitest):
import { describe, it, expect, vi } from "vitest";

// Replace jest.fn() with vi.fn()
// Replace jest.mock() with vi.mock()
```

---

## Migration 10: Add Sentry to Web and Admin Apps

### Current State
- Only pandit app has Sentry
- Web and admin apps have no error monitoring

### Target State
- All 3 apps use Sentry
- Unified error dashboard

### Implementation Steps

#### Step 1: Add Sentry dependencies

```bash
cd apps/web
pnpm add @sentry/nextjs

cd apps/admin
pnpm add @sentry/nextjs
```

#### Step 2: Create Sentry configs

File: `apps/web/sentry.client.config.ts`
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  environment: process.env.NODE_ENV,
});
```

File: `apps/web/sentry.server.config.ts`
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

File: `apps/web/sentry.edge.config.ts`
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

Repeat for admin app.

#### Step 3: Add Sentry env vars

File: `.env.example`
```env
# ===== SENTRY =====
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxx
SENTRY_PROJECT=hmarepanditji-web
SENTRY_ORG=hmarepanditji
```

#### Step 4: Create error boundary

File: `apps/web/src/components/ErrorBoundary.tsx`
```typescript
"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page.</h1>;
    }
    return this.props.children;
  }
}
```

#### Step 5: Wrap layout with ErrorBoundary

File: `apps/web/src/app/layout.tsx`
```typescript
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## Migration Progress Tracker

- [x] Migration 1: Express.js → Fastify (Foundation complete)
- [ ] Migration 2: localStorage → HttpOnly Cookies
- [ ] Migration 3: Prisma 5 → Prisma 6
- [ ] Migration 4: ESLint 8 → ESLint 9
- [ ] Migration 5: Docker Healthchecks
- [ ] Migration 6: Redis-Only Caching
- [ ] Migration 7: React Context → Zustand
- [ ] Migration 8: Puter.js → Anthropic API
- [ ] Migration 9: Jest → Vitest
- [ ] Migration 10: Sentry for all apps
