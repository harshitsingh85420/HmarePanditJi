# Manual test scripts — pandit-POV conformance register

Some requirements cannot be discharged by an automated test: they involve a
camera, a GPS fix, a real network, or a judgement only a human can make ("can a
62-year-old actually tell these two buttons apart?"). Those are typed `MANUAL`
in the register and are scripted here.

**Test profile — every script below runs at this profile, no exceptions:**
- Viewport **360 × 740**, touch emulation on (canon's own stated target is
  *Samsung Galaxy A12 · 360dp*)
- One pass on **Fast 3G** throttling, because the pandit is not on office wifi
- Record the profile in the result you paste back

**A manual script only discharges a requirement if a human actually ran it and
recorded the date and outcome.** An unrun script is not coverage. The
conformance guard checks that the entry exists; it cannot check that anyone
read it, so that part is on us.

**Only requirements that genuinely exist today are scripted here.** Writing a
manual script for a feature that is ❌ missing would manufacture the appearance
of coverage — those belong in DEVIATIONS.md or stay ❌ until built. That is why
F01-02, F01-08, F02-08, F05-05, F05-06 and F36-03 have no script below.

---

## F04-03 — "क्या आप अभी इसी पते पर हैं?" (🟡 city-confirm built)

**Why manual:** needs a real GPS fix and a real device moving between two
locations. An emulator's mocked coordinates prove nothing about a pandit
standing in his own street.

**Setup:** a registered pandit account with no saved address; location
permission NOT yet granted.

| # | Step | Expected |
|---|---|---|
| 1 | Reach the location step of registration | The question is **spoken** as well as shown; the screen does not proceed on its own |
| 2 | Grant location permission | The detected city appears; the pandit is asked to **confirm**, never silently accepted |
| 3 | Answer "हाँ" | The confirmed city is stored and the flow advances |
| 4 | Restart, reach the same step, answer "नहीं" | The pandit can supply a different city; the detected value does not overwrite his answer |
| 5 | Deny location permission outright | A spoken, non-blaming fallback offers the manual path — no dead end, no error jargon |

**Known gap this script must NOT paper over:** the doc asks for a map with a
blue dot and a draggable pin. That is not built. Record step 2–4 against the
city-confirm shape only, and note the absence rather than passing the item.

**Record:** date · tester · device · profile · outcome per step.

---

## F05-02 — Aadhaar photo capture (🟡 upload built, auto-capture is not)

**Why manual:** camera behaviour, focus, and glare on a laminated card are not
reproducible in a headless test.

**Setup:** a pandit account at the आधार step. Use a **dummy/sample Aadhaar
card** — never a real person's document in a test run.

| # | Step | Expected |
|---|---|---|
| 1 | Reach the आधार step | Consent is requested **before** the camera or picker opens (DPDP; guarded by aadhaar-consent.test.ts) |
| 2 | Decline consent | No capture occurs and no image is stored |
| 3 | Grant consent, upload a front image | The image is accepted and the pandit is told, in Devanagari, what happens next |
| 4 | Upload a deliberately blurred image | Observe what the pandit is told — record it verbatim |
| 5 | Repeat on Fast 3G | Upload either completes or fails **legibly**; it must never hang with no feedback |

**Known gap:** the doc asks for **auto-capture with manual fallback**. Only
manual upload exists. Step 4's behaviour is the honest measure of how far the
gap matters — record it, do not grade it as a pass.

**Record:** date · tester · device · profile · verbatim message from step 4.

---

## F08-02 — per-pooja verification video (🟡, submission is by YouTube link)

**Why manual:** the real question is whether a 62-year-old can produce the
artefact at all. That is a human observation, not an assertion.

**Setup:** a pandit account with at least one pooja added, at the वीडियो step.
Ideally run this with an **actual elderly tester**; if not possible, record that
the tester was not the target persona — it materially weakens the result.

| # | Step | Expected |
|---|---|---|
| 1 | Reach the वीडियो step | The recording checklist is visible |
| 2 | Read the checklist aloud as a pandit would encounter it | Note which items are present. **आसन (posture) is currently absent** — confirm and record |
| 3 | Note whether the checklist is spoken | It is on-screen text only today. For a voice-first persona, record whether the tester noticed it at all |
| 4 | Attempt to submit without help | **The core measurement.** Can the tester produce an unlisted YouTube link unaided? Record where they stop |
| 5 | If they stop, follow the WhatsApp help path | Record whether it is discoverable from where they got stuck |

**This script exists to measure deviation D-03's real cost.** Step 4 is the
result that matters. If testers cannot pass step 4 unaided, the WhatsApp path
is not a convenience — it is the primary flow, and D-03 should be re-read in
that light.

**Record:** date · tester (and whether they match the persona) · device ·
profile · exactly where step 4 broke down.
