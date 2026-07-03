# AI Development Rules for HmarePanditJi
1. Target user: elderly Pandit on cheap Android. Buttons >= 56px tall, text >= 18px, high contrast.
2. All user-facing text must come from apps/pandit/src/lib/strings.ts. Never hardcode.
3. Every screen must call the voice narration hook on mount.
4. Never add npm packages without being told the exact package name in the prompt.
5. Never create summary/report markdown files.
6. Before declaring done: pnpm typecheck && pnpm build must pass.
7. API responses always shaped: { success: boolean, data?: T, error?: { code: string, message: string } }
