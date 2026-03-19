# Design System Document: Spiritual Service Excellence

## 1. Overview & Creative North Star
**Creative North Star: "The Sacred Hearth"**

This design system is crafted to transcend the utility of a booking app, becoming a digital sanctuary for Pandits. For an audience aged 45–70, the interface must reject the frantic "gig-economy" aesthetic. Instead, we employ **The Sacred Hearth**—a philosophy where the UI mimics the soft glow of a diya. 

We break the "standard app" mold by using **intentional asymmetry** and **tonal depth**. Rather than rigid grids, elements are allowed to breathe, appearing like sacred texts placed thoughtfully on a clean cloth. We use oversized typography and generous padding to ensure that "hurry" is never an option, and "clarity" is the only result.

---

## 2. Colors: The Palette of Devotion
Our colors are not just functional hex codes; they are emotional anchors.

*   **Primary Saffron (`primary`: #904d00 / `primary_container`: #ff8c00):** The soul of the app. Use the container token for large hero areas to evoke the warmth of a morning sun.
*   **Surface Hierarchy (`surface`: #fbf9f3 to `surface_container_highest`: #e4e2dd):** Our background is a warm off-white, reminiscent of aged handmade paper.
*   **Trust Green (`secondary`: #1b6d24):** Reserved strictly for successful bookings and completed rituals.

### The "No-Line" Rule
To maintain a "soft" emotional quality, **1px solid borders are prohibited for sectioning.** 
*   **How to define boundaries:** Use background color shifts. A `surface_container_low` card sitting on a `surface` background creates a natural edge. 
*   **Layering:** Treat the UI as stacked sheets of fine linen. Use `surface_container_lowest` (#ffffff) for the most important interactive cards to make them "float" gently above the cream background.

### The "Glass & Gradient" Rule
For floating action buttons or high-priority notifications, use a subtle gradient from `primary` (#904d00) to `tertiary_container` (#f89100). This creates a "glow" effect rather than a flat plastic look. Apply a 12px backdrop blur on overlays to keep the Pandit grounded in his current context while acknowledging the new information.

---

## 3. Typography: Authority Through Clarity
We use a dual-font system to bridge tradition and modern utility.

*   **Display & Headline (Noto Serif):** Used for Sanskrit shlokas, greetings, and screen titles. The serif evokes the authority of ancient scriptures.
*   **Body & Labels (Public Sans / Noto Sans Devanagari):** For instructions and numbers. High legibility is non-negotiable for elderly eyes.

**Hierarchy as Respect:**
*   **Headline-LG (2rem):** Used for "Suprabhatam" (Greetings). It is the "Wise Teacher" speaking.
*   **Body-LG (1rem / 18sp equivalent):** Our standard for all conversational text. We never use "Fine Print" for critical information; if it's important enough to say, it's 18sp.
*   **Line Height:** Fixed at **150%**. This ensures that even in Hindi script, characters never feel crowded.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often too "digital" and harsh. We use **Ambient Depth.**

*   **The Layering Principle:** Depth is achieved by "stacking."
    *   *Level 0:* `surface` (The floor)
    *   *Level 1:* `surface_container_low` (Section groupings)
    *   *Level 2:* `surface_container_lowest` (Interactive cards)
*   **Ambient Shadows:** If a card must float (e.g., a "New Booking" alert), use `0px 8px 24px rgba(144, 77, 0, 0.08)`. Note the saffron tint in the shadow—this mimics natural light bouncing off a warm surface.
*   **The "Ghost Border":** For input fields, use `outline_variant` (#ddc1ae) at **20% opacity**. It should be felt, not seen.

---

## 5. Components: Intentional Interactions

### Buttons (The "Path" Components)
*   **Primary:** 56px height. Rounded `md` (0.75rem). Use a subtle vertical gradient. 
*   **Confirmation Pair (Haan / Nahi):** 60px height. Placed side-by-side with generous 20px (`6`) spacing. "Haan" (Yes) uses `primary_container`, "Nahi" (No) uses `surface_variant`.
*   **Touch Targets:** Every interactive element must maintain a **52x52px** minimum tap area to accommodate aging motor skills.

### Cards & Lists (The "Scripture" Layout)
*   **Forbid Divider Lines:** Use **Spacing Scale 5 (1.7rem)** to separate list items. 
*   **Visual Soul:** Every card should have a 4px left-accent border in `primary` saffron to indicate it is an "active" thought or task.

### Input Fields
*   **Labeling:** Labels are never hidden. They sit prominently in `title-md` above the field.
*   **State:** Active inputs use a `primary` #FF8C00 glow (2px soft outer blur) rather than a sharp stroke.

### Specialized Component: The "Ashirwad" (Blessing) Loader
Instead of a spinning circle, use a gentle pulsing Diya illustration or a watercolor marigold flower that slowly fills with saffron color.

---

## 6. Do’s and Don'ts

### Do:
*   **Use Asymmetry:** Place illustrations slightly off-center to feel "hand-drawn" and organic.
*   **Prioritize Hindi:** Ensure Noto Sans Devanagari is the default; English is the secondary support.
*   **Embrace White Space:** If the screen feels 50% empty, you are doing it right. It conveys "unhurried" respect.

### Don't:
*   **Don't use pure black:** Use `on_surface` (#1b1c19) for text to avoid harsh contrast.
*   **Don't use "Success Blue":** In this spiritual context, blue feels clinical. Use `Trust Green` for all positive confirmations.
*   **Don't use Red for everything:** For errors, use a soft `error_container` background with an explanation, rather than a jarring red "X". Treat mistakes as a "teaching moment."

---

## 7. Spacing Scale (The Breath of the App)
*   **Section Padding:** Always use `8` (2.75rem) or `10` (3.5rem). 
*   **Content Grouping:** Use `3` (1rem) for related items.
*   **Screen Edge Margins:** Minimum `5` (1.7rem) to ensure thumbs don't feel cramped near the bezel.