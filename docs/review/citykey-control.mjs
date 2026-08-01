// G2 CONTROL for F-J4-8's cityKey. The subject is the REAL production
// value: PanditProfile.location for the only verified pandit, as returned
// by GET /api/v1/pandits — "गाज़ियाबाद", nukta and all.
const CITY_ALIASES = {
  "दिल्ली": "delhi", "द्वारका": "dwarka", "रोहिणी": "rohini", "नोएडा": "noida",
  "गुड़गांव": "gurgaon", "गुरुग्राम": "gurgaon", "फरीदाबाद": "faridabad",
  "गाजियाबाद": "ghaziabad", "ग्रेटर नोएडा": "greater noida",
  "दक्षिण दिल्ली": "south delhi", "पूर्वी दिल्ली": "east delhi",
  "पश्चिमी दिल्ली": "west delhi", "उत्तरी दिल्ली": "north delhi",
  "हरिद्वार": "haridwar", "जयपुर": "jaipur", "वाराणसी": "varanasi", "काशी": "varanasi",
};
function cityKey(raw) {
  const s = String(raw ?? "").normalize("NFD").replace(/़/g, "").normalize("NFC").trim().toLowerCase();
  return CITY_ALIASES[s] ?? s;
}

let ok = true;
const eq = (label, a, b, want) => {
  const got = cityKey(a) === cityKey(b);
  const pass = got === want;
  ok = ok && pass;
  console.log(`  ${pass ? "✓" : "✗"} ${label.padEnd(56)} same=${String(got).padEnd(5)}${pass ? "" : ` EXPECTED ${want}`}`);
};

console.log("── SUBJECT PROOF: the real production string ──");
const PROD = "गाज़ियाबाद"; // verbatim from GET /pandits
console.log(`  production location .......... ${JSON.stringify(PROD)}`);
console.log(`  codepoints ................... ${[...PROD].map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase()).join(" ")}`);
console.log(`  cityKey(production) .......... ${JSON.stringify(cityKey(PROD))}`);
console.log("");

console.log("── THE DEFECT, and that it is closed ──");
eq("PRODUCTION गाज़ियाबाद  ==  Ghaziabad  (THE BUG)", PROD, "Ghaziabad", true);
eq("nukta-less गाजियाबाद   ==  Ghaziabad", "गाजियाबाद", "Ghaziabad", true);
eq("दिल्ली                 ==  Delhi", "दिल्ली", "Delhi", true);
eq("गुरुग्राम              ==  Gurgaon", "गुरुग्राम", "Gurgaon", true);
eq("ग्रेटर नोएडा           ==  Greater Noida", "ग्रेटर नोएडा", "Greater Noida", true);
eq("casing/whitespace      ==  ' ghaziabad '", "Ghaziabad", "  ghaziabad ", true);

console.log("");
console.log("── NEGATIVE CONTROLS: it must still tell cities APART ──");
eq("गाज़ियाबाद             !=  Delhi", PROD, "Delhi", false);
eq("Noida                  !=  Greater Noida", "Noida", "Greater Noida", false);
eq("दिल्ली                 !=  South Delhi", "दिल्ली", "South Delhi", false);
eq("unknown A              !=  unknown B", "Kanpur", "Lucknow", false);
eq("unknown == itself (no silent merge)", "Kanpur", "kanpur", true);

console.log("");
console.log("── THE GATE, evaluated as the wizard evaluates it ──");
const gateOpens = (panditCity, venueCity) => {
  const isOutstation = cityKey(panditCity) !== cityKey(venueCity);
  return { isOutstation, canContinue: !isOutstation || false /* no travelMode available */ };
};
for (const venue of ["Ghaziabad", "Delhi"]) {
  const g = gateOpens(PROD, venue);
  console.log(`  venue=${venue.padEnd(10)} outstation=${String(g.isOutstation).padEnd(5)} step-2 gate ${g.canContinue ? "OPENS" : "stays shut (travel needed)"}`);
}
console.log(`\n${ok ? "ALL CONTROLS PASSED" : "CONTROLS FAILED — do not trust the fix"}`);
process.exit(ok ? 0 : 1);
