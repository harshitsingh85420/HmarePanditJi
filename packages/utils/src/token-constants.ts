/**
 * Authentication token key constants — THE ONE SOURCE.
 *
 * Every app reads and writes its session token under exactly one key, named
 * here. This file exists because the same class of bug hit twice:
 *
 *   admin    — login wrote 'hpj_admin_token', ten screens read a hard-coded
 *              "adminToken", sent `Bearer ` empty, and got 401s that
 *              `if (res.ok)` swallowed into blank pages.
 *   customer — login writes 'hpj_token', FOURTEEN sites read a bare "token"
 *              that is written nowhere in the repo. Eleven were silent blank
 *              screens; three were login GATES, so an authenticated customer
 *              was pushed into a modal that wrote the token again and
 *              re-entered the same gate — an unbreakable loop on Book Now.
 *
 * tokenKeyContract.test.ts pins writer == reader: a hard-coded key literal
 * anywhere in an app fails the build.
 */

export const ADMIN_TOKEN_KEY = 'hpj_admin_token';

/**
 * The CUSTOMER (apps/web) session token.
 *
 * Value is 'hpj_token' because that is what apps/web/app/login/page.tsx has
 * always written and what live browsers are holding right now. Renaming the
 * written key would sign every existing customer out — an auth semantics
 * change, which this repair explicitly is not.
 */
export const CUSTOMER_TOKEN_KEY = 'hpj_token';

/**
 * @deprecated Never written, never read — a fourth spelling of the customer
 * token that existed only to be picked up by mistake. Use CUSTOMER_TOKEN_KEY.
 * Kept as an alias for one release in case an external consumer imported it.
 */
export const USER_TOKEN_KEY = CUSTOMER_TOKEN_KEY;
