// All voice prompts in Hindi for each tutorial step (0–15)
export const VOICE_PROMPTS: Record<number, string> = {
  0: "Namaste Pandit Ji. HmarePanditJi par aapka bahut-bahut swagat hai. Ye platform aapke liye hi bana hai. Agle kuch minutes mein hum dekhenge ki yeh app aapke jeevan aur aamdani mein kya badlav la sakta hai. Humara Mool Mantra yaad rakhiye: App Pandit ke liye hai, Pandit app ke liye nahi. Agar aap seedhe registration shuru karna chahte hain to Skip bolein, nahi to Janein bolkar humare saath bane rahein.",
  1: "Sabse pehle baat karte hain aapki aamdani ki. HmarePanditJi aapko aise kai tareeke deta hai jo aapki kamai ko badhate hain, aur wo bhi bina kisi jhanjhat ke.",
  2: "Feature Highlight: Fixed Dakshina aur Zero Negotiation. Har pooja ke liye Pandit apni fixed dakshina khud set karte hain. Customer ko pata hai kitna dena hai, aur Pandit ko pata hai kitna milega. Ab koi negotiation nahi. Isse aapka samman banta hai aur waqt bachta hai.",
  3: "Feature Highlight: Online Revenue Streams. Do naye income streams — Ghar Baithe Pooja aur Pandit Se Baat. Ghar Baithe Pooja mein aap video call se pooja karwa sakte hain, fixed dakshina, income potential rupaye 2000 se 5000 per pooja. Pandit Se Baat mein aap phone, video ya chat par salah de sakte hain, 20 se 50 rupaye prati minute. Isse aapki mahine ki aamdani 40,000 rupaye tak badh sakti hai.",
  4: "Feature Highlight: Backup Pandit Opportunity — Zero Risk Income. Jab bhi koi booking hoti hai jisme customer ne backup protection liya hai, aapko backup Pandit banne ka offer milta hai. Agar main Pandit ne pooja kar li, to aapko 2,000 rupaye guarantee fee milegi bina kuch kiye. Agar main Pandit cancel ho gaye, to aapko poori booking amount plus 2,000 rupaye bonus milega.",
  5: "Feature Highlight: Instant Payment aur Transparent Earnings. Jaise hi pooja ya call samapt hoti hai, payment turant aapke bank account mein credit ho jata hai. Aapko poori kamai ka detail breakdown milta hai.",
  6: "Ab baat karte hain aapki rozmarra ki suvidha ki. Yeh app aapke daily kaam ko kitna aasaan bana deta hai.",
  7: "Feature Highlight: Voice-First Navigation aur Language Selection. App aapki aawaz se chalta hai. Har feature, har sawaal ka jawab aap bolkar de sakte hain. Agar kabhi shor ho ya aap bolna nahi chahte, to screen par Keyboard button hamesha maujood hai. Aur yaad rahe, agar aap kabhi chahein ki app ki aawaz band ho, to upar Mute button dabakar aap meri awaaz band kar sakte hain. Isse aapke voice commands nahi band hote, sirf app ka bolna band hota hai.",
  8: "Feature Highlight: Dual-Mode Entry. Smartphone wale Pandit ko full functionality milegi. Keypad phone wale Pandit ke liye IVR Call System set ho jayega — nai booking aane par phone aayega, number dabakar accept ya reject kar sakte hain.",
  9: "Feature Highlight: Automated Travel Itinerary. Booking confirm hote hi, aapki preferences ke hisaab se detailed travel plan ban jayega. GPS based updates customer ko bhi jayenge.",
  10: "Feature Highlight: Automated Calendar aur Blackout Dates. Jab aap available na hon, wo dates set kar sakte hain. Platform un dino booking block kar dega. Double booking ka khatra khatam.",
  11: "Ab baat karte hain vishwas aur aapki pehchan ki. Platform aapki visheshata ko kaise ujagar karta hai.",
  12: "Feature Highlight: Pooja-Specific Video Verification. Har us pooja ke liye aapka video verify hota hai jo aap karte hain. Customer dekhega ki aap verified hain aur kitni baar us pooja ko perform kiya hai.",
  13: "Feature Highlight: Professional Public Profile. Aapki shiksha, anubhav, visheshtayein, bhashayen, gotra — sab kuch profile par dikhega. Do-tarfa ratings — customer aapko rate karega, aur aap bhi customer ko rate kar sakte hain.",
  14: "Ab aapko yaad dilate hain HmarePanditJi ke chaar guarantees. Pehla: Samman — Verified badge, high ratings, zero negotiation. Doosra: Suvidha — Voice-first navigation, mute control, IVR support, auto-itinerary. Teesra: Suraksha — Fixed income, instant payment, fair penalty system. Chautha: Samridhi — Offline aur Online dono, multiple income streams, backup fees.",
  15: "Yah tha HmarePanditJi ka parichay. Ab aap seedhe registration par ja sakte hain. Kya aap registration shuru karna chahenge? Haan bolein ya Baad Mein bolein.",
};

// Valid voice commands per screen and what they map to
export type TutorialCommand = "NEXT" | "BACK" | "SKIP" | "REPEAT" | "MUTE" | "KEYBOARD" | "YES" | "LATER";

export const VALID_COMMANDS: Record<number, Partial<Record<TutorialCommand, string[]>>> = {
  0: {
    NEXT:     ["janein", "janein", "learn", "haan", "shuru", "start"],
    SKIP:     ["skip", "skip karen", "skiip"],
    MUTE:     ["mute", "band", "chup", "awaaz band"],
    KEYBOARD: ["keyboard", "type", "likho"],
  },
  15: {
    YES:      ["haan", "yes", "registration", "shuru", "aage"],
    LATER:    ["baad mein", "baad", "later", "nahi"],
    BACK:     ["back", "peechhe", "wapas"],
    MUTE:     ["mute", "band"],
    REPEAT:   ["repeat", "dobara", "phir se"],
    KEYBOARD: ["keyboard", "type"],
  },
};

const DEFAULT_COMMANDS: Partial<Record<TutorialCommand, string[]>> = {
  NEXT:     ["next", "aage", "aagey", "chalein", "agla", "haan", "theek", "ok"],
  BACK:     ["back", "peechhe", "wapas", "peeche"],
  SKIP:     ["skip", "skip karen", "chhod do"],
  REPEAT:   ["repeat", "dobara", "phir se", "sun"],
  MUTE:     ["mute", "band", "chup", "awaaz band", "unmute", "awaaz chalu"],
  KEYBOARD: ["keyboard", "type", "likho"],
};

export function getCommandsForStep(step: number): Partial<Record<TutorialCommand, string[]>> {
  return VALID_COMMANDS[step] ?? DEFAULT_COMMANDS;
}

export function matchCommand(transcript: string, step: number): TutorialCommand | null {
  const t = transcript.toLowerCase().trim();
  const commands = getCommandsForStep(step);
  for (const [cmd, keywords] of Object.entries(commands)) {
    for (const kw of keywords as string[]) {
      if (t.includes(kw)) return cmd as TutorialCommand;
    }
  }
  return null;
}
