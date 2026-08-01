// LIVE PROXY to the production API, so the browser walk runs on production's
// ACTUAL responses rather than bodies I chose. The local web app has
// NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1 baked into .env.local, so
// this sits at that address and forwards everything upstream unchanged.
//
// Three modes, switched at /__mode/<m> so one server serves all three shots:
//   live  — pure passthrough. What a production customer's browser receives.
//   empty — passthrough, then data.pandits emptied. Production CANNOT produce
//           an empty pandit list today (one pandit exists and every filter is
//           dead — see F-J4-2/F-J4-4), so the empty RENDER is proven against
//           production's real envelope with the array emptied. Stated, not
//           dressed up as a production measurement.
//   fail  — 503, to exercise the error branch.
import { createServer } from "node:http";

const UPSTREAM = "https://hmarepanditji-api.onrender.com";
let mode = "live";

const cors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
};

createServer(async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  const m = /^\/__mode\/(\w+)$/.exec(req.url);
  if (m) {
    mode = m[1];
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("mode=" + mode);
  }

  if (mode === "fail") {
    console.log("FAIL  ", req.method, req.url);
    res.writeHead(503, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ success: false, message: "injected failure" }));
  }

  /* THE PROXY CORRUPTED MULTIPART AND BLAMED THE APP. This read the body as a
     STRING and forced Content-Type: application/json on every forward, so a
     file upload arrived as mangled text with a JSON content-type and the API
     answered 400 "No number after minus sign in JSON at position 1" — the
     `--` of the multipart boundary. The screen showed the app's honest error
     banner and I nearly filed it as an upload defect.
     AN INSTRUMENT THAT REWRITES ITS SUBJECT IS NOT OBSERVING IT.
     Binary-safe now: Buffer chunks, original content-type preserved. */
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks);
  const body = raw.toString("utf8"); // for logging/inspection only

  /* ═══ ASSERT-VISIBLE-NEVER-FIRE ═══════════════════════════════════
     TANYA IS OFF LIMITS — ABSOLUTE. She is a real person and the only
     VERIFIED pandit, so POST /bookings would create a real row and send
     a real notification to a real phone. J4b needs the SUBMIT PAYLOAD,
     not the submission. These paths are captured in full and then KILLED
     HERE — the request never leaves this process. The payload is the
     evidence; the booking is not mine to create. J9 owns that, and its
     test-pandit gate is unpassed. */
  /* ═══ ACT-TWO SPLIT (Isj's Twilio reading: ABSENT — sends are stubs) ═══
     A wrong target dies at the proxy, not at my intention. */
  const QA_PANDIT = "cms9zruni0000fh3olj7zbfhx";
  const TANYA = ["cmriymyqo0000et35bg7uhir6", "cmriymyrp0002et35yb0v6wlt", "919465278318"];

  // 1 · ANYTHING carrying Tanya's ids or phone dies, any method, any path.
  if (TANYA.some((t) => body.includes(t) || req.url.includes(t))) {
    console.log("\n╔══ TANYA-GUARD KILLED — NOT FORWARDED ══");
    console.log("║ " + req.method + " " + req.url);
    console.log("╚════════════════════════════════════════\n");
    res.writeHead(503, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ success: false, message: "BLOCKED BY QA PROXY — Tanya guard" }));
  }

  // 2 · Booking writes forward ONLY if the body's panditId is the QA pandit.
  if (req.method !== "GET" && /\/bookings\b/.test(req.url)) {
    let target = null;
    try { target = JSON.parse(body || "{}").panditId ?? null; } catch { /* non-JSON */ }
    if (target !== QA_PANDIT) {
      console.log("\n╔══ TARGET-CHECK KILLED — panditId=" + JSON.stringify(target) + " ══");
      console.log("║ " + req.method + " " + req.url);
      console.log("╚════════════════════════════════════════\n");
      res.writeHead(503, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: false, message: "BLOCKED BY QA PROXY — wrong booking target" }));
    }
    console.log("── TARGET-CHECK PASSED: panditId === QA pandit — forwarding booking ──");
    console.log("BOOKING BODY:", body.slice(0, 1200));
  }

  // 3 · Direct notification posts still die; payments now flow (test keys).
  const NEVER_FIRE = [/\/notifications\b/];
  if (req.method !== "GET" && NEVER_FIRE.some((re) => re.test(req.url))) {
    console.log("\n╔══ CAPTURED AND BLOCKED — NOT FORWARDED ══");
    console.log("║ " + req.method + " " + req.url);
    console.log("║ BODY:");
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2).split("\n").map((l) => "║   " + l).join("\n"));
    } catch { console.log("║   " + body); }
    console.log("╚══════════════════════════════════════════\n");
    res.writeHead(503, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ success: false, message: "BLOCKED BY QA PROXY — payload captured, request not forwarded" }));
  }

  try {
    const fwd = {};
    // Preserve the caller's own content-type — multipart boundaries included.
    if (req.headers["content-type"]) fwd["content-type"] = req.headers["content-type"];
    if (req.headers.authorization) fwd.authorization = req.headers.authorization;
    const upstream = await fetch(UPSTREAM + req.url, {
      method: req.method,
      headers: fwd,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : raw,
    });
    let text = await upstream.text();

    if (mode === "empty" && req.url.includes("/pandits")) {
      const j = JSON.parse(text);
      if (j?.data?.pandits) { j.data.pandits = []; text = JSON.stringify(j); }
    }

    console.log(mode.toUpperCase().padEnd(6), req.method, req.url, "->", upstream.status, text.slice(0, 90));
    res.writeHead(upstream.status, { "Content-Type": "application/json" });
    res.end(text);
  } catch (e) {
    console.log("ERR   ", req.method, req.url, e.message);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: String(e.message) }));
  }
}).listen(3001, () => console.log("proxy on 3001 -> " + UPSTREAM + "  mode=live"));
