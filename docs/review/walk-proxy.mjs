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

  let body = "";
  for await (const chunk of req) body += chunk;

  /* ═══ ASSERT-VISIBLE-NEVER-FIRE ═══════════════════════════════════
     TANYA IS OFF LIMITS — ABSOLUTE. She is a real person and the only
     VERIFIED pandit, so POST /bookings would create a real row and send
     a real notification to a real phone. J4b needs the SUBMIT PAYLOAD,
     not the submission. These paths are captured in full and then KILLED
     HERE — the request never leaves this process. The payload is the
     evidence; the booking is not mine to create. J9 owns that, and its
     test-pandit gate is unpassed. */
  const NEVER_FIRE = [/\/bookings\b/, /\/payments\//, /\/notifications\b/];
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
    const upstream = await fetch(UPSTREAM + req.url, {
      method: req.method,
      headers: { "Content-Type": "application/json", ...(req.headers.authorization ? { authorization: req.headers.authorization } : {}) },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : body,
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
