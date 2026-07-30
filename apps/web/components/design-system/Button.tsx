import React from "react";

/* ─────────────────────────────────────────────────────────────
   FIVE STATES, FOUR KINDS — and the disabled state is the point.

     "A disabled control always prints its reason beneath itself — and
      the reason names the unlock. 13 silent disables → 0."

   The audit found 13 controls a customer cannot press with nothing on
   screen saying why or what would unlock them. The booking wizard's
   step-4 gate was the worst: `disabled={!canNext()}` and no sentence
   anywhere. A customer cannot debug a form. He concludes the app is
   broken and leaves, and we never learn.

   So `disabled` is not a boolean here. It is a REASON, and the type
   makes the silent form unrepresentable: you cannot disable this button
   without writing the sentence that un-disables it.
   ───────────────────────────────────────────────────────────── */

export type ButtonKind = "primary" | "secondary" | "tertiary" | "destructive";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  kind?: ButtonKind;
  /**
   * The reason this control cannot be pressed, in the customer's words,
   * NAMING THE UNLOCK — "Pick a date first — then you can continue",
   * not "Invalid input".
   *
   * Passing a string disables the button AND prints the reason beneath
   * it. There is deliberately no `disabled?: boolean`.
   */
  disabledReason?: string | null;
  /** Renders the sending state; the label is replaced, never blanked. */
  busy?: boolean;
  busyLabel?: string;
  /** Terminal success — the control has done its job and stays put. */
  done?: boolean;
  doneLabel?: string;
}

const BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  width: "100%",
  minHeight: 52, // thumb target at 360
  padding: "0 18px",
  borderRadius: "var(--hpj-r-control)",
  font: "600 15.5px/1 var(--hpj-font)",
  cursor: "pointer",
  transition: "transform .06s ease, background .15s ease",
};

function skin(kind: ButtonKind): React.CSSProperties {
  switch (kind) {
    case "secondary":
      return { background: "transparent", color: "var(--hpj-primary)", border: "1.5px solid var(--hpj-primary)" };
    case "tertiary":
      return { background: "transparent", color: "var(--hpj-primary)", border: "none", minHeight: 44 };
    case "destructive":
      // outlined, never filled — a destructive action should not be the
      // most visually confident thing on the screen
      return { background: "transparent", color: "var(--hpj-destructive)", border: "1.5px solid var(--hpj-destructive)" };
    default:
      return { background: "var(--hpj-primary)", color: "#fff", border: "1.5px solid var(--hpj-primary)" };
  }
}

export function Button({
  kind = "primary",
  disabledReason = null,
  busy = false,
  busyLabel = "Sending…",
  done = false,
  doneLabel = "Done",
  children,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = !!disabledReason || busy || done;

  const visual: React.CSSProperties = {
    ...BASE,
    ...skin(kind),
    ...(disabledReason ? { opacity: 0.45, cursor: "not-allowed" } : {}),
    ...(busy ? { opacity: 0.8, cursor: "progress" } : {}),
    ...(done ? { background: "var(--hpj-verified-field)", color: "var(--hpj-verified)", borderColor: "var(--hpj-verified-field)", cursor: "default" } : {}),
    ...style,
  };

  return (
    <span style={{ display: "block", width: "100%" }}>
      <button
        {...rest}
        disabled={isDisabled}
        // The reason is announced, not merely printed — a screen reader
        // must reach it the same way an eye does.
        aria-describedby={disabledReason ? `${rest.id ?? "hpj-btn"}-reason` : undefined}
        style={visual}
      >
        {done ? (
          <>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 19 }}>check_circle</span>
            {doneLabel}
          </>
        ) : busy ? (
          busyLabel
        ) : (
          children
        )}
      </button>

      {disabledReason ? (
        <span
          id={`${rest.id ?? "hpj-btn"}-reason`}
          className="hpj-label"
          style={{ display: "flex", alignItems: "flex-start", gap: 6, margin: "8px 2px 0" }}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 15, flex: "none" }}>info</span>
          {disabledReason}
        </span>
      ) : null}
    </span>
  );
}
