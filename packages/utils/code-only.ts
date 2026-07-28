/**
 * Subpath entry: `import { codeOnly } from "@hmarepanditji/utils/code-only"`.
 *
 * WHY THIS SHIM EXISTS. Guards need codeOnly but must NOT pull the package
 * barrel: `src/index.ts` re-exports `auth-context.tsx`, which requires React,
 * and the guards run under bare node+tsx where React is unresolvable. The
 * obvious alternative — a deep relative path like
 * `../../../../packages/utils/src/code-only` — compiles under tsx but breaks
 * `tsc -p services/api`, whose `rootDir` is `./src` (TS6059). A package-name
 * import resolves through node_modules and is exempt from rootDir, so this
 * two-line file is what keeps both the runtime and the typecheck honest.
 */
export * from "./src/code-only";
