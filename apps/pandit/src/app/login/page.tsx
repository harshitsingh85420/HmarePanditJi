import { redirect } from "next/navigation";

/**
 * Redirect /login → /auth
 * The real pandit authentication page lives at /auth with the full
 * phone OTP flow (send OTP → verify OTP → role check).
 */
export default function PanditLoginRedirect() {
  redirect("/auth");
}
