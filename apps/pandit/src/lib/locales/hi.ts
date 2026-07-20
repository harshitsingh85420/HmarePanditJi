// हिन्दी — THE CANONICAL LOCALE.
//
// Every other locale mirrors this key structure exactly, and the
// completeness guard measures them against it.
//
// The Hindi strings themselves still live in lib/strings.ts, where ~200
// call sites already import them. Re-exporting (rather than moving the
// object) gives us the locale addressing layer with zero churn and zero
// risk of a bad find-and-replace across the app. When every call site
// eventually reads through the locale layer, the object can move here.
import { hi as strings } from "../strings";

export const hi = strings;
export type Locale = typeof strings;
export default hi;
