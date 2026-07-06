import { argv, exit } from 'process';

if (argv.length < 3) {
  console.log("Usage: node scripts/smoke.mjs <api-base-url>");
  console.log("Example: node scripts/smoke.mjs http://localhost:8080");
  exit(1);
}

const baseUrl = argv[2].replace(/\/$/, "");

console.log(`Starting smoke tests against: ${baseUrl}\n`);

const results = {
  health: { pass: false, details: "" },
  otp_send: { pass: false, details: "" },
  auth: { pass: false, details: "" },
  tts: { pass: false, details: "" }
};

let token = null;

try {
  // 1. GET /health
  const healthRes = await fetch(`${baseUrl}/health`);
  const healthStatus = healthRes.status;
  if (healthStatus === 200) {
    const body = await healthRes.json();
    if (body && body.ok === true) {
      results.health.pass = true;
      results.health.details = `ok=true (status 200)`;
      console.log("✅ health");
    } else {
      results.health.details = `body.ok is not true: ${JSON.stringify(body)}`;
      console.log(`❌ health: ${results.health.details}`);
    }
  } else {
    results.health.details = `status ${healthStatus}`;
    console.log(`❌ health: status ${healthStatus}`);
  }
} catch (err) {
  results.health.details = err.message;
  console.log(`❌ health: ${err.message}`);
}

try {
  // 2. POST /api/v1/auth/otp/send
  const sendOtpRes = await fetch(`${baseUrl}/api/v1/auth/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "+919999999999" })
  });
  const sendStatus = sendOtpRes.status;
  const sendBody = await sendOtpRes.json().catch(() => ({}));
  if (sendStatus === 200 || sendStatus === 429) {
    results.otp_send.pass = true;
    results.otp_send.details = `status ${sendStatus}`;
    console.log(`✅ otp/send (${sendStatus})`);
  } else {
    results.otp_send.details = `status ${sendStatus}, body: ${JSON.stringify(sendBody)}`;
    console.log(`❌ otp/send: ${results.otp_send.details}`);
  }
} catch (err) {
  results.otp_send.details = err.message;
  console.log(`❌ otp/send: ${err.message}`);
}

try {
  // 3. POST /api/v1/auth/otp/verify
  const verifyRes = await fetch(`${baseUrl}/api/v1/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "+919999999999",
      otp: "123456",
      role: "PANDIT"
    })
  });
  const verifyStatus = verifyRes.status;
  const verifyBody = await verifyRes.json().catch(() => ({}));
  if (verifyStatus === 200) {
    token = verifyBody?.data?.token;
    if (token) {
      results.auth.pass = true;
      results.auth.details = "token acquired";
      console.log("✅ auth");
    } else {
      results.auth.details = `token missing in response body: ${JSON.stringify(verifyBody)}`;
      console.log(`❌ auth: ${results.auth.details}`);
    }
  } else {
    results.auth.details = `status ${verifyStatus}, body: ${JSON.stringify(verifyBody)}`;
    console.log(`❌ auth: ${results.auth.details}`);
  }
} catch (err) {
  results.auth.details = err.message;
  console.log(`❌ auth: ${err.message}`);
}

try {
  // 4. POST /api/v1/voice/tts
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const ttsRes = await fetch(`${baseUrl}/api/v1/voice/tts`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text: "नमस्ते पंडित जी" })
  });
  const ttsStatus = ttsRes.status;
  if (ttsStatus === 200) {
    const contentType = ttsRes.headers.get("content-type") || "";
    let bytes = 0;
    if (contentType.includes("application/json")) {
      const body = await ttsRes.json();
      const audioStr = body?.data?.audio || "";
      bytes = Buffer.from(audioStr, "base64").length;
    } else {
      const buf = await ttsRes.arrayBuffer();
      bytes = buf.byteLength;
    }
    results.tts.pass = true;
    results.tts.details = `${bytes} bytes`;
    console.log(`✅ tts (${bytes} bytes)`);
  } else {
    const errBody = await ttsRes.text().catch(() => "");
    results.tts.details = `status ${ttsStatus}, body: ${errBody}`;
    console.log(`❌ tts: ${results.tts.details}`);
  }
} catch (err) {
  results.tts.details = err.message;
  console.log(`❌ tts: ${err.message}`);
}

console.log("\n====================================");
console.log("SMOKE TEST SUMMARY");
console.log("====================================");
console.table(
  Object.keys(results).map(key => ({
    Test: key,
    Status: results[key].pass ? "PASS" : "FAIL",
    Details: results[key].details
  }))
);

const allPassed = Object.values(results).every(r => r.pass);
if (allPassed) {
  console.log("\n🎉 ALL TESTS PASSED!");
  exit(0);
} else {
  console.log("\n❌ SOME TESTS FAILED!");
  exit(1);
}
