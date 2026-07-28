/**
 * Subpath entry: `import { resolveApiBase } from "@hmarepanditji/utils/api-base"`.
 *
 * Same reason as ./code-only.ts: guards need this resolver but must not pull
 * the package barrel, which re-exports auth-context.tsx and therefore React.
 * App code can keep importing from "@hmarepanditji/utils" — it has React.
 */
export * from "./src/api-base";
