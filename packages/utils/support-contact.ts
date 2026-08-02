/**
 * Subpath entry: `import { resolveSupportPhone } from "@hmarepanditji/utils/support-contact"`.
 *
 * Same reason as ./code-only.ts and ./api-base.ts: the guard that pins the
 * ops-contact law must EXECUTE this resolver under bare node+tsx, and the
 * package barrel is heavier than a guard should carry. App code keeps
 * importing from "@hmarepanditji/utils".
 */
export * from "./src/support-contact";
