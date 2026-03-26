/**
 * Enhanced Voice Script Generator for HmarePanditJi Part 0
 * Generates all 1,845 scripts with 5 variants per screen
 * 
 * Usage: node generate-all-variants.js
 */

const fs = require('fs');
const path = require('path');

// All 15 languages with proper pacing
const LANGUAGES = [
  { code: 'hi-IN', name: 'Hindi', pace: 0.88, priority: 1 },
  { code: 'ta-IN', name: 'Tamil', pace: 0.86, priority: 2 },
  { code: 'te-IN', name: 'Telugu', pace: 0.87, priority: 3 },
  { code: 'bn-IN', name: 'Bengali', pace: 0.88, priority: 4 },
  { code: 'mr-IN', name: 'Marathi', pace: 0.89, priority: 5 },
  { code: 'gu-IN', name: 'Gujarati', pace: 0.88, priority: 6 },
  { code: 'kn-IN', name: 'Kannada', pace: 0.87, priority: 7 },
  { code: 'ml-IN', name: 'Malayalam', pace: 0.86, priority: 8 },
  { code: 'pa-IN', name: 'Punjabi', pace: 0.88, priority: 9 },
  { code: 'or-IN', name: 'Odia', pace: 0.87, priority: 10 },
  { code: 'en-IN', name: 'English (Indian)', pace: 0.90, priority: 11 },
  { code: 'hi-IN', name: 'Bhojpuri', pace: 0.88, priority: 12, fallback: true, fallbackFor: 'bhojpuri' },
  { code: 'hi-IN', name: 'Maithili', pace: 0.88, priority: 13, fallback: true, fallbackFor: 'maithili' },
  { code: 'hi-IN', name: 'Sanskrit', pace: 0.85, priority: 14, fallback: true, fallbackFor: 'sanskrit' },
  { code: 'hi-IN', name: 'Assamese', pace: 0.87, priority: 15, fallback: true, fallbackFor: 'assamese' },
];

// Screen definitions with 5 variants each
const SCREENS = [
  {
    screenId: 'S-0.1',
    screenName: 'Swagat Welcome',
    description: 'Welcome Pandit Ji to HmarePanditJi platform',
    fileName: '09_S-0.1_Swagat.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'नमस्ते पंडित जी। HmarePanditJi पर आपका बहुत-बहुत स्वागत है।', english: 'Hello Pandit Ji. A warm welcome to HmarePanditJi.' },
          { hindi: 'यह platform आपके लिए ही बना है।', english: 'This platform is made just for you.' },
          { hindi: 'अगले दो मिनट में हम देखेंगे कि यह app आपकी आमदनी में क्या बदलाव ला सकता है।', english: 'In the next two minutes, we will see what changes this app can bring to your income.' },
          { hindi: 'हमारा Mool Mantra याद रखिए — App पंडित के लिए है, पंडित App के लिए नहीं।', english: 'Remember our Mool Mantra — App is for Pandit, not Pandit for App.' },
          { hindi: 'अगर सीधे Registration करना हो तो Skip बोलें। नहीं तो जानें बोलें।', english: 'If you want to register directly, say Skip. Otherwise, say Learn More.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, HmarePanditJi में आपका स्वागत है।', english: 'Pandit Ji, welcome to HmarePanditJi.' },
          { hindi: 'यह app विशेष रूप से आपकी सेवा के लिए डिज़ाइन किया गया है।', english: 'This app is specially designed for your service.' },
          { hindi: 'आइए, जानते हैं कि यह platform आपकी ज़िंदगी कैसे आसान बना सकता है।', english: 'Let us know how this platform can make your life easier.' },
          { hindi: 'याद रखिए — हमारा उद्देश्य है आपकी आय बढ़ाना और सम्मान बढ़ाना।', english: 'Remember — our goal is to increase your income and respect.' },
          { hindi: 'शुरू करने के लिए Continue बोलें या Skip बोलें।', english: 'Say Continue or say Skip to start.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'सादर नमस्कार पंडित जी। HmarePanditJi परिवार में आपका हार्दिक स्वागत है।', english: 'Warm greetings Pandit Ji. A hearty welcome to HmarePanditJi family.' },
          { hindi: 'यह पहल आपके कल्याण और विकास के लिए शुरू की गई है।', english: 'This initiative is started for your welfare and development.' },
          { hindi: 'थोड़ी ही देर में आप जान जाएंगे कि यह app आपके लिए कैसे फायदेमंद है।', english: 'In a short while you will know how this app is beneficial for you.' },
          { hindi: 'हमारा सिद्धांत सरल है — पहले पंडित, बाद में technology।', english: 'Our principle is simple — first Pandit, then technology.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें या जानकारी के लिए जानें बोलें।', english: 'Say Continue to proceed or say Learn More for information.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'नमस्ते पंडित जी। HmarePanditJi पर आपका स्वागत है।', english: 'Namaste Pandit Ji. Welcome to HmarePanditJi.' },
          { hindi: 'हम खुश हैं कि आप हमारे साथ जुड़े हैं।', english: 'We are happy that you are connected with us.' },
          { hindi: 'यह service आपकी सुविधा और आय वृद्धि के लिए बनाई गई है।', english: 'This service is created for your convenience and income growth.' },
          { hindi: 'विश्वास रखिए, हम आपके साथ हैं।', english: 'Have faith, we are with you.' },
          { hindi: 'Registration के लिए Skip बोलें या_details के लिए जानें बोलें।', english: 'Say Skip for registration or say Learn More for details.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, HmarePanditJi में आपका बहुत-बहुत अभिनंदन है।', english: 'Pandit Ji, a warm welcome to HmarePanditJi.' },
          { hindi: 'आपका आगमन हमारे लिए गौरव की बात है।', english: 'Your arrival is a matter of pride for us.' },
          { hindi: 'आइए, साथ चलें और नई ऊंचाइयों को छूएं।', english: 'Let us walk together and touch new heights.' },
          { hindi: 'हमारा वादा — बेहतर income, बेहतर respect, बेहतर life।', english: 'Our promise — better income, better respect, better life.' },
          { hindi: 'शुरुआत करने के लिए Continue या Skip बोलें।', english: 'Say Continue or Skip to begin.' },
        ],
      },
    ],
  },
  {
    screenId: 'S-0.2',
    screenName: 'Income Hook',
    description: 'Show Pandit Ji their potential income increase',
    fileName: '10_S-0.2_Income_Hook.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'पंडित जी, क्या आप जानते हैं कि आप साल में कितना कमा सकते हैं?', english: 'Pandit Ji, do you know how much you can earn in a year?' },
          { hindi: 'हमारे platform पर औसतन एक पंडित जी ₹50,000 से ₹1,00,000 प्रति माह कमाते हैं।', english: 'On our platform, an average Pandit Ji earns ₹50,000 to ₹1,00,000 per month.' },
          { hindi: 'यह app आपको हर महीने कम से कम 10-15 नए bookings दिला सकता है।', english: 'This app can get you at least 10-15 new bookings every month.' },
          { hindi: 'तो चलिए, शुरू करते हैं और आपकी आमदनी बढ़ाते हैं।', english: 'So let us start and increase your income.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें।', english: 'Say Continue to proceed.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, क्या आप अपनी आय दोगुनी करना चाहेंगे?', english: 'Pandit Ji, would you like to double your income?' },
          { hindi: 'हमारे साथ जुड़े पंडित जी पहले से दुगना कमा रहे हैं।', english: 'Pandit Ji connected with us are earning double than before.' },
          { hindi: 'हर रोज़ नए bookings, हर रोज़ नई कमाई।', english: 'New bookings every day, new earnings every day.' },
          { hindi: 'आप भी इस सफलता का हिस्सा बन सकते हैं।', english: 'You too can be part of this success.' },
          { hindi: 'जानने के लिए Details बोलें या Continue बोलें।', english: 'Say Details to know more or say Continue.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'पंडित जी, एक महीने में ₹50,000 से ₹1,00,000 कमाना कैसा रहेगा?', english: 'Pandit Ji, how would it be to earn ₹50,000 to ₹1,00,000 in a month?' },
          { hindi: 'यह सपना नहीं, हकीकत है।', english: 'This is not a dream, it is reality.' },
          { hindi: 'हमारा platform आपको यह मौका देता है।', english: 'Our platform gives you this opportunity.' },
          { hindi: 'बस थोड़ा सा साथ और आप तैयार हैं।', english: 'Just a little support and you are ready.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें।', english: 'Say Continue to proceed.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'पंडित जी, आपकी विद्वता का उचित मूल्य मिलना चाहिए।', english: 'Pandit Ji, your expertise should get proper value.' },
          { hindi: 'हम यही सुनिश्चित करते हैं — उचित दक्षिणा, उचित सम्मान।', english: 'We ensure this — proper dakshina, proper respect.' },
          { hindi: 'औसतन पंडित जी महीने के ₹75,000 कमाते हैं।', english: 'On average Pandit Ji earn ₹75,000 per month.' },
          { hindi: 'आप भी इसमें शामिल हो सकते हैं।', english: 'You too can join this.' },
          { hindi: 'शुरू करने के लिए Continue बोलें।', english: 'Say Continue to start.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, क्या आप जानते हैं आपकी कमाई की क्षमता क्या है?', english: 'Pandit Ji, do you know what is your earning potential?' },
          { hindi: 'एक अनुमान के अनुसार, आप साल का ₹6 लाख से ₹12 लाख कमा सकते हैं।', english: 'According to an estimate, you can earn ₹6 lakh to ₹12 lakh per year.' },
          { hindi: 'यह सब संभव है HmarePanditJi के साथ।', english: 'All this is possible with HmarePanditJi.' },
          { hindi: 'चलिए, इस सफर को शुरू करते हैं।', english: 'Let us start this journey.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें।', english: 'Say Continue to proceed.' },
        ],
      },
    ],
  },
  {
    screenId: 'S-0.3',
    screenName: 'Fixed Dakshina',
    description: 'Explain fixed dakshina pricing model',
    fileName: '11_S-0.3_Fixed_Dakshina.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'पंडित जी, हमारे platform पर Fixed Dakshina मॉडल है।', english: 'Pandit Ji, our platform has a Fixed Dakshina model.' },
          { hindi: 'यानी हर पूजा के लिए एक तय दक्षिणा पहले से ही तय होती है।', english: 'This means a fixed dakshina is predetermined for each puja.' },
          { hindi: 'इससे आपको पता होता है कि आपको कितनी दक्षिणा मिलेगी।', english: 'This way you know how much dakshina you will receive.' },
          { hindi: 'कोई झगड़ा नहीं, कोई असमंजस नहीं।', english: 'No arguments, no confusion.' },
          { hindi: 'समझने के लिए हां बोलें। आगे बढ़ने के लिए Continue बोलें।', english: 'Say Yes to understand. Say Continue to proceed.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, Fixed Dakshina का मतलब है पहले से तय कीमत।', english: 'Pandit Ji, Fixed Dakshina means predetermined price.' },
          { hindi: 'ग्राहक को पता है, आपको पता है — सब स्पष्ट है।', english: 'Customer knows, you know — everything is clear.' },
          { hindi: 'कोई बहस नहीं, कोई अनबन नहीं।', english: 'No debate, no disagreement.' },
          { hindi: 'शांति से पूजा करें, दक्षिणा पाएं।', english: 'Do puja peacefully, receive dakshina.' },
          { hindi: 'जानने के लिए Details बोलें या Continue बोलें।', english: 'Say Details to know more or say Continue.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'पंडित जी, दक्षिणा को लेकर कभी असमंजस हुआ है?', english: 'Pandit Ji, have you ever been confused about dakshina?' },
          { hindi: 'हमारा Fixed Dakshina system इस समस्या का हल है।', english: 'Our Fixed Dakshina system is the solution to this problem.' },
          { hindi: 'हर पूजा की कीमत पहले से तय।', english: 'Price of every puja is predetermined.' },
          { hindi: 'आपको चिंता नहीं, बस सेवा करनी है।', english: 'You do not have to worry, just serve.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें।', english: 'Say Continue to proceed.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'पंडित जी, हमारा मॉडल सरल है — Fixed Dakshina।', english: 'Pandit Ji, our model is simple — Fixed Dakshina.' },
          { hindi: 'यह पारदर्शी है, यह निष्पक्ष है।', english: 'This is transparent, this is fair.' },
          { hindi: 'ग्राहक platform पर भुगतान करते हैं।', english: 'Customers pay on the platform.' },
          { hindi: 'आपको पूरी दक्षिणा मिलती है।', english: 'You get the full dakshina.' },
          { hindi: 'समझ गए तो हां बोलें या Continue बोलें।', english: 'If understood, say Yes or say Continue.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, Fixed Dakshina से आपकी आय स्थिर रहती है।', english: 'Pandit Ji, Fixed Dakshina keeps your income stable.' },
          { hindi: 'कोई उतार-चढ़ाव नहीं, कोई अनिश्चितता नहीं।', english: 'No ups and downs, no uncertainty.' },
          { hindi: 'हर पूजा के लिए निश्चित राशि।', english: 'Fixed amount for every puja.' },
          { hindi: 'यह आपके सम्मान की रक्षा करता है।', english: 'This protects your respect.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें।', english: 'Say Continue to proceed.' },
        ],
      },
    ],
  },
  {
    screenId: 'S-0.4',
    screenName: 'Online Revenue',
    description: 'Explain online payment and revenue sharing',
    fileName: '12_S-0.4_Online_Revenue.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'पंडित जी, अब आप ऑनलाइन भी दक्षिणा प्राप्त कर सकते हैं।', english: 'Pandit Ji, now you can receive dakshina online too.' },
          { hindi: 'यह पैसा सीधे आपके bank account में आएगा।', english: 'This money will come directly to your bank account.' },
          { hindi: 'हम केवल 10% commission लेते हैं, बाकी 90% आपका।', english: 'We take only 10% commission, the remaining 90% is yours.' },
          { hindi: 'हर हफ्ते payment सीधे आपके account में।', english: 'Every week payment directly to your account.' },
          { hindi: 'जानने के लिए Details बोलें। आगे बढ़ने के लिए Continue बोलें।', english: 'Say Details to know more. Say Continue to proceed.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, digital युग में ऑनलाइन payment ज़रूरी है।', english: 'Pandit Ji, in digital age online payment is necessary.' },
          { hindi: 'ग्राहक UPI, card, या net banking से भुगतान कर सकते हैं।', english: 'Customers can pay via UPI, card, or net banking.' },
          { hindi: 'आपको 90% मिलता है, हम 10% लेते हैं।', english: 'You get 90%, we take 10%.' },
          { hindi: 'हर सोमवार payment आपके account में।', english: 'Every Monday payment in your account.' },
          { hindi: 'Details के लिए Details बोलें या Continue बोलें।', english: 'Say Details for details or say Continue.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'पंडित जी, ऑनलाइन payment सुरक्षित और आसान है।', english: 'Pandit Ji, online payment is safe and easy.' },
          { hindi: 'नकदी की चिंता नहीं, सुरक्षा की चिंता नहीं।', english: 'No cash worry, no security worry.' },
          { hindi: 'सीधे bank account में पैसा।', english: 'Money directly in bank account.' },
          { hindi: 'हमारा commission केवल 10%।', english: 'Our commission only 10%.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें।', english: 'Say Continue to proceed.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'पंडित जी, 90% दक्षिणा आपकी, 10% हमारा commission।', english: 'Pandit Ji, 90% dakshina yours, 10% our commission.' },
          { hindi: 'यह पारदर्शी system है।', english: 'This is transparent system.' },
          { hindi: 'हर transaction का विवरण आपको मिलता है।', english: 'You get details of every transaction.' },
          { hindi: 'कभी भी check कर सकते हैं।', english: 'You can check anytime.' },
          { hindi: 'जानने के लिए Details बोलें या Continue बोलें।', english: 'Say Details to know more or say Continue.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, ऑनलाइन payment से आपकी सुविधा बढ़ती है।', english: 'Pandit Ji, online payment increases your convenience.' },
          { hindi: 'ग्राहक आसानी से भुगतान करते हैं।', english: 'Customers pay easily.' },
          { hindi: 'आप आसानी से प्राप्त करते हैं।', english: 'You receive easily.' },
          { hindi: 'हर हफ्ते settlement, हर हफ्ते income।', english: 'Every week settlement, every week income.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें।', english: 'Say Continue to proceed.' },
        ],
      },
    ],
  },
  {
    screenId: 'S-0.5',
    screenName: 'Backup Pandit',
    description: 'Explain backup pandit feature',
    fileName: '13_S-0.5_Backup_Pandit.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'पंडित जी, अगर कभी आप किसी पूजा में नहीं जा सकते, तो क्या होगा?', english: 'Pandit Ji, what if sometimes you cannot go for a puja?' },
          { hindi: 'हमारा Backup Pandit feature आपको इस समस्या से बचाता है।', english: 'Our Backup Pandit feature saves you from this problem.' },
          { hindi: 'आप किसी भरोसेमंद साथी पंडित को backup बना सकते हैं।', english: 'You can make a trusted fellow pandit your backup.' },
          { hindi: 'वह आपकी जगह पूजा करेगा और आप commission पाएंगे।', english: 'He will do the puja in your place and you will get commission.' },
          { hindi: 'जानने के लिए Backup बोलें। आगे बढ़ने के लिए Continue बोलें।', english: 'Say Backup to know more. Say Continue to proceed.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, कभी-कभी हम सभी busy होते हैं।', english: 'Pandit Ji, sometimes we all are busy.' },
          { hindi: 'उस समय के लिए हमारा Backup Pandit feature है।', english: 'For that time we have Backup Pandit feature.' },
          { hindi: 'आप किसी colleague को backup बनाएं।', english: 'Make a colleague your backup.' },
          { hindi: 'वह पूजा करेगा, आप commission पाएं।', english: 'He will do puja, you get commission.' },
          { hindi: 'Details के लिए Backup बोलें या Continue बोलें।', english: 'Say Backup for details or say Continue.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'पंडित जी, booking cancel करना पड़े तो नुकसान होता है।', english: 'Pandit Ji, if booking has to be cancelled, there is loss.' },
          { hindi: 'Backup Pandit से booking नहीं टूटती।', english: 'With Backup Pandit, booking does not break.' },
          { hindi: 'आपका backup साथी पूजा करता है।', english: 'Your backup partner does the puja.' },
          { hindi: 'ग्राहक खुश, आप खुश।', english: 'Customer happy, you happy.' },
          { hindi: 'जानने के लिए Backup बोलें या Continue बोलें।', english: 'Say Backup to know more or say Continue.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'पंडित जी, Backup Pandit feature smart है।', english: 'Pandit Ji, Backup Pandit feature is smart.' },
          { hindi: 'आप unavailable हैं तो backup automatically assign होता है।', english: 'If you are unavailable, backup is automatically assigned.' },
          { hindi: 'ग्राहक को पता भी नहीं चलता।', english: 'Customer does not even know.' },
          { hindi: 'आपको commission मिलता रहता है।', english: 'You keep getting commission.' },
          { hindi: 'Details के लिए Backup बोलें या Continue बोलें।', english: 'Say Backup for details or say Continue.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, Backup Pandit से आपकी income नहीं रुकती।', english: 'Pandit Ji, with Backup Pandit your income does not stop.' },
          { hindi: 'आपकी absence में भी कमाई चलती रहती है।', english: 'Even in your absence, earnings keep going.' },
          { hindi: 'यह passive income का source है।', english: 'This is a source of passive income.' },
          { hindi: 'एक बार setup करें, फिर भूल जाएं।', english: 'Setup once, then forget.' },
          { hindi: 'जानने के लिए Backup बोलें या Continue बोलें।', english: 'Say Backup to know more or say Continue.' },
        ],
      },
    ],
  },
  {
    screenId: 'S-0.6',
    screenName: 'Instant Payment',
    description: 'Explain instant payment feature',
    fileName: '14_S-0.6_Instant_Payment.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'पंडित जी, अब आपको payment का इंतज़ार नहीं करना पड़ेगा।', english: 'Pandit Ji, now you do not have to wait for payment.' },
          { hindi: 'पूजा पूरी होने के तुरंत बाद payment आपके account में।', english: 'Payment in your account immediately after puja completion.' },
          { hindi: 'UPI, Bank Transfer, या Wallet — जैसे चाहें वैसे पाएं।', english: 'UPI, Bank Transfer, or Wallet — receive as you wish.' },
          { hindi: 'सुरक्षित, तेज़, और भरोसेमंद।', english: 'Secure, fast, and trustworthy.' },
          { hindi: 'जानने के लिए Payment बोलें। आगे बढ़ने के लिए Continue बोलें।', english: 'Say Payment to know more. Say Continue to proceed.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, Instant Payment का मतलब तुरंत पैसा।', english: 'Pandit Ji, Instant Payment means immediate money.' },
          { hindi: 'पूजा खत्म, payment तुरंत।', english: 'Puja finished, payment immediately.' },
          { hindi: 'कोई इंतज़ार नहीं, कोई delay नहीं।', english: 'No wait, no delay.' },
          { hindi: 'सीधे आपके account में।', english: 'Directly in your account.' },
          { hindi: 'Details के लिए Payment बोलें या Continue बोलें।', english: 'Say Payment for details or say Continue.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'पंडित जी, payment में कितना समय लगता है?', english: 'Pandit Ji, how much time does payment take?' },
          { hindi: 'हमारा Instant Payment feature — तुरंत payment।', english: 'Our Instant Payment feature — immediate payment.' },
          { hindi: 'पूजा के बाद 5 मिनट में payment।', english: 'Payment in 5 minutes after puja.' },
          { hindi: 'यह हमारा वादा है।', english: 'This is our promise.' },
          { hindi: 'जानने के लिए Payment बोलें या Continue बोलें।', english: 'Say Payment to know more or say Continue.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'पंडित जी, Instant Payment से cash flow बेहतर होता है।', english: 'Pandit Ji, Instant Payment improves cash flow.' },
          { hindi: 'आपको तुरंत पैसा मिलता है।', english: 'You get money immediately.' },
          { hindi: 'आप अपनी ज़रूरत के हिसाब से use कर सकते हैं।', english: 'You can use as per your need.' },
          { hindi: 'यह financial freedom है।', english: 'This is financial freedom.' },
          { hindi: 'Details के लिए Payment बोलें या Continue बोलें।', english: 'Say Payment for details or say Continue.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, Instant Payment feature unique है।', english: 'Pandit Ji, Instant Payment feature is unique.' },
          { hindi: 'दूसरे platform पर इंतज़ार करना पड़ता है।', english: 'On other platforms you have to wait.' },
          { hindi: 'हम तुरंत payment करते हैं।', english: 'We pay immediately.' },
          { hindi: 'यह हमारा विशेष वादा है।', english: 'This is our special promise.' },
          { hindi: 'जानने के लिए Payment बोलें या Continue बोलें।', english: 'Say Payment to know more or say Continue.' },
        ],
      },
    ],
  },
  {
    screenId: 'S-0.7',
    screenName: 'Voice Nav Demo',
    description: 'Demonstrate voice navigation feature',
    fileName: '15_S-0.7_Voice_Nav_Demo.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'पंडित जी, यह app आपकी आवाज़ से चलता है।', english: 'Pandit Ji, this app runs on your voice.' },
          { hindi: 'बस बोलें — हां, नहीं, Skip, Continue, या Details।', english: 'Just say — Yes, No, Skip, Continue, or Details.' },
          { hindi: 'अगर बोलना पसंद नहीं, तो बटन भी हैं।', english: 'If you do not like speaking, there are buttons too.' },
          { hindi: 'चलिए, एक बार try करते हैं।', english: 'Let us try it once.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें या Continue बटन दबाएं।', english: 'Say Continue or press Continue button to proceed.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, Voice Navigation से app चलाना आसान है।', english: 'Pandit Ji, running app with Voice Navigation is easy.' },
          { hindi: 'बस command बोलें, app समझ जाएगा।', english: 'Just speak command, app will understand.' },
          { hindi: 'हाँ, नहीं, आगे, पीछे — सब बोल सकते हैं।', english: 'Yes, no, forward, backward — can say all.' },
          { hindi: 'कोशिश करें, आपको पसंद आएगा।', english: 'Try it, you will like it.' },
          { hindi: 'शुरू करने के लिए Continue बोलें।', english: 'Say Continue to start.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'पंडित जी, Voice feature खास बुजुर्ग पंडित जी के लिए है।', english: 'Pandit Ji, Voice feature is specially for elderly Pandit Ji.' },
          { hindi: 'बिना छुए, बिना टाइप किए सब हो जाता है।', english: 'Without touching, without typing everything happens.' },
          { hindi: 'बस बोलना है, बस।', english: 'Just have to speak, that is it.' },
          { hindi: 'आवाज़ पहचानती है Hindi और English दोनों।', english: 'Voice recognizes both Hindi and English.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें।', english: 'Say Continue to proceed.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'पंडित जी, Voice Navigation smart है।', english: 'Pandit Ji, Voice Navigation is smart.' },
          { hindi: 'यह आपकी आवाज़ पहचानता है।', english: 'It recognizes your voice.' },
          { hindi: 'धीरे बोलें, ज़ोर से बोलें — सब समझता है।', english: 'Speak slowly, speak loudly — understands all.' },
          { hindi: 'चलिए, अनुभव करें।', english: 'Let us experience.' },
          { hindi: 'Continue बोलें या बटन दबाएं।', english: 'Say Continue or press button.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, Voice feature से app और भी आसान हो जाता है।', english: 'Pandit Ji, with Voice feature app becomes even easier.' },
          { hindi: 'आपको कुछ करने की ज़रूरत नहीं।', english: 'You do not need to do anything.' },
          { hindi: 'बस बोलें, app करेगा।', english: 'Just speak, app will do.' },
          { hindi: 'यह technology आपकी सेवा में।', english: 'This technology is in your service.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें।', english: 'Say Continue to proceed.' },
        ],
      },
    ],
  },
  {
    screenId: 'S-0.8',
    screenName: 'Dual Mode',
    description: 'Explain dual mode (voice + touch)',
    fileName: '16_S-0.8_Dual_Mode.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'पंडित जी, इस app में दो modes हैं — Voice Mode और Touch Mode।', english: 'Pandit Ji, this app has two modes — Voice Mode and Touch Mode.' },
          { hindi: 'Voice Mode में बोलकर control करें।', english: 'In Voice Mode, control by speaking.' },
          { hindi: 'Touch Mode में बटन दबाकर control करें।', english: 'In Touch Mode, control by pressing buttons.' },
          { hindi: 'कभी भी Settings में जाकर mode बदल सकते हैं।', english: 'You can change mode anytime in Settings.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें या बटन दबाएं।', english: 'Say Continue or press button to proceed.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, Dual Mode से आप choice पाते हैं।', english: 'Pandit Ji, Dual Mode gives you choice.' },
          { hindi: 'जब बोलना हो, Voice Mode use करें।', english: 'When you want to speak, use Voice Mode.' },
          { hindi: 'जब चुप रहना हो, Touch Mode use करें।', english: 'When you want to stay quiet, use Touch Mode.' },
          { hindi: 'दोनों modes equally अच्छे हैं।', english: 'Both modes are equally good.' },
          { hindi: 'आपकी पसंद, आपकी मर्जी।', english: 'Your choice, your wish.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'पंडित जी, कभी-कभी शोर-शराबे में बोलना मुश्किल होता है।', english: 'Pandit Ji, sometimes it is difficult to speak in noise.' },
          { hindi: 'उस समय Touch Mode काम आता है।', english: 'At that time Touch Mode is useful.' },
          { hindi: 'शांत जगह पर Voice Mode use करें।', english: 'Use Voice Mode in quiet place.' },
          { hindi: 'दोनों modes available हैं।', english: 'Both modes are available.' },
          { hindi: 'जैसा आपको सुविधाजनक लगे।', english: 'As you find convenient.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'पंडित जी, Dual Mode feature flexible है।', english: 'Pandit Ji, Dual Mode feature is flexible.' },
          { hindi: 'एक ही app, दो तरीके।', english: 'Same app, two ways.' },
          { hindi: 'आपकी सुविधा के अनुसार।', english: 'As per your convenience.' },
          { hindi: 'कभी भी switch कर सकते हैं।', english: 'Can switch anytime.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें।', english: 'Say Continue to proceed.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, Dual Mode से app और भी user-friendly है।', english: 'Pandit Ji, with Dual Mode app is more user-friendly.' },
          { hindi: 'हर उम्र के पंडित जी use कर सकते हैं।', english: 'Pandit Ji of all ages can use.' },
          { hindi: 'हर पसंद के पंडित जी use कर सकते हैं।', english: 'Pandit Ji of all preferences can use.' },
          { hindi: 'यह inclusive design है।', english: 'This is inclusive design.' },
          { hindi: 'आपके लिए बना है।', english: 'It is made for you.' },
        ],
      },
    ],
  },
  {
    screenId: 'S-0.9',
    screenName: 'Travel Calendar',
    description: 'Explain travel calendar feature',
    fileName: '17_S-0.9_Travel_Calendar.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'पंडित जी, Travel Calendar से आप अपने bookings को आसानी से manage कर सकते हैं।', english: 'Pandit Ji, with Travel Calendar you can easily manage your bookings.' },
          { hindi: 'कौन सी पूजा कब और कहां है, सब एक जगह दिखता है।', english: 'Which puja when and where, everything shows in one place.' },
          { hindi: 'आप अपनी availability भी set कर सकते हैं।', english: 'You can also set your availability.' },
          { hindi: 'ताकि आपको ज़रूरत से ज़्यादा bookings न मिलें।', english: 'So that you do not get too many bookings.' },
          { hindi: 'जानने के लिए Calendar बोलें। आगे बढ़ने के लिए Continue बोलें।', english: 'Say Calendar to know more. Say Continue to proceed.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, Calendar feature आपकी planning आसान बनाता है।', english: 'Pandit Ji, Calendar feature makes your planning easy.' },
          { hindi: 'सभी bookings एक नज़र में।', english: 'All bookings in one view.' },
          { hindi: 'कब कहां जाना है, सब पता चलता है।', english: 'When where to go, everything is known.' },
          { hindi: 'Travel time भी दिखता है।', english: 'Travel time also shows.' },
          { hindi: 'Details के लिए Calendar बोलें या Continue बोलें।', english: 'Say Calendar for details or say Continue.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'पंडित जी, Travel Calendar smart है।', english: 'Pandit Ji, Travel Calendar is smart.' },
          { hindi: 'यह automatically travel time calculate करता है।', english: 'It automatically calculates travel time.' },
          { hindi: 'ताकि आप समय पर पहुंचें।', english: 'So that you reach on time.' },
          { hindi: 'कोई overlap नहीं, कोई confusion नहीं।', english: 'No overlap, no confusion.' },
          { hindi: 'जानने के लिए Calendar बोलें या Continue बोलें।', english: 'Say Calendar to know more or say Continue.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'पंडित जी, Calendar से आप long-term plan बना सकते हैं।', english: 'Pandit Ji, with Calendar you can make long-term plan.' },
          { hindi: 'कौन से दिन available हैं, कौन से दिन busy।', english: 'Which days are available, which days are busy.' },
          { hindi: 'सब कुछ organize है।', english: 'Everything is organized.' },
          { hindi: 'यह आपका personal assistant है।', english: 'This is your personal assistant.' },
          { hindi: 'Details के लिए Calendar बोलें या Continue बोलें।', english: 'Say Calendar for details or say Continue.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, Travel Calendar से work-life balance बनता है।', english: 'Pandit Ji, with Travel Calendar work-life balance is maintained.' },
          { hindi: 'आप family time plan कर सकते हैं।', english: 'You can plan family time.' },
          { hindi: 'आप rest time plan कर सकते हैं।', english: 'You can plan rest time.' },
          { hindi: 'यह holistic management है।', english: 'This is holistic management.' },
          { hindi: 'जानने के लिए Calendar बोलें या Continue बोलें।', english: 'Say Calendar to know more or say Continue.' },
        ],
      },
    ],
  },
  {
    screenId: 'S-0.10',
    screenName: 'Video Verification',
    description: 'Explain video verification process',
    fileName: '18_S-0.10_Video_Verification.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'पंडित जी, सुरक्षा के लिए हम video verification करते हैं।', english: 'Pandit Ji, for safety we do video verification.' },
          { hindi: 'यह सुनिश्चित करता है कि असली पंडित जी ही platform पर हैं।', english: 'This ensures that only real Pandit Ji are on the platform.' },
          { hindi: 'बस 2 मिनट का video call होगा।', english: 'Just a 2 minute video call.' },
          { hindi: 'आपकी documents verify होंगे और profile approve होगा।', english: 'Your documents will be verified and profile approved.' },
          { hindi: 'जानने के लिए Verification बोलें। आगे बढ़ने के लिए Continue बोलें।', english: 'Say Verification to know more. Say Continue to proceed.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, Video Verification simple process है।', english: 'Pandit Ji, Video Verification is simple process.' },
          { hindi: 'हमारी team आपसे video call पर मिलेगी।', english: 'Our team will meet you on video call.' },
          { hindi: 'बस अपने documents दिखाएं।', english: 'Just show your documents.' },
          { hindi: '5 मिनट में verification complete।', english: 'Verification complete in 5 minutes.' },
          { hindi: 'Details के लिए Verification बोलें या Continue बोलें।', english: 'Say Verification for details or say Continue.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'पंडित जी, Verification से platform secure रहता है।', english: 'Pandit Ji, Verification keeps platform secure.' },
          { hindi: 'fake profiles नहीं आ सकते।', english: 'Fake profiles cannot come.' },
          { hindi: 'आपकी safety हमारी priority है।', english: 'Your safety is our priority.' },
          { hindi: 'यह ज़रूरी step है।', english: 'This is necessary step.' },
          { hindi: 'जानने के लिए Verification बोलें या Continue बोलें।', english: 'Say Verification to know more or say Continue.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'पंडित जी, Video Verification convenient है।', english: 'Pandit Ji, Video Verification is convenient.' },
          { hindi: 'आपको कहीं जाने की ज़रूरत नहीं।', english: 'You do not need to go anywhere.' },
          { hindi: 'घर बैठे verification हो जाता है।', english: 'Verification happens sitting at home.' },
          { hindi: 'समय बचता है, पैसा बचता है।', english: 'Time saves, money saves.' },
          { hindi: 'Details के लिए Verification बोलें या Continue बोलें।', english: 'Say Verification for details or say Continue.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, Verification के बाद आपका profile trusted बनता है।', english: 'Pandit Ji, after verification your profile becomes trusted.' },
          { hindi: 'ग्राहक ज़्यादा भरोसा करते हैं।', english: 'Customers trust more.' },
          { hindi: 'bookings ज़्यादा मिलते हैं।', english: 'Get more bookings.' },
          { hindi: 'यह आपके फायदे का है।', english: 'This is for your benefit.' },
          { hindi: 'जानने के लिए Verification बोलें या Continue बोलें।', english: 'Say Verification to know more or say Continue.' },
        ],
      },
    ],
  },
  {
    screenId: 'S-0.11',
    screenName: '4 Guarantees',
    description: 'Explain 4 platform guarantees',
    fileName: '19_S-0.11_4_Guarantees.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'पंडित जी, हम आपको 4 Guarantees देते हैं।', english: 'Pandit Ji, we give you 4 Guarantees.' },
          { hindi: 'पहला — Fixed Dakshina, कोई झगड़ा नहीं।', english: 'First — Fixed Dakshina, no arguments.' },
          { hindi: 'दूसरा — Instant Payment, तुरंत पैसा।', english: 'Second — Instant Payment, money immediately.' },
          { hindi: 'तीसरा — Respectful Treatment, हमेशा इज़्ज़त।', english: 'Third — Respectful Treatment, always respect.' },
          { hindi: 'चौथा — 24/7 Support, हमेशा मदद के लिए तैयार। आगे बढ़ने के लिए Continue बोलें।', english: 'Fourth — 24/7 Support, always ready to help. Say Continue to proceed.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, 4 Guarantees हमारा वादा है।', english: 'Pandit Ji, 4 Guarantees is our promise.' },
          { hindi: 'Fixed Dakshina — price clarity।', english: 'Fixed Dakshina — price clarity.' },
          { hindi: 'Instant Payment — immediate money।', english: 'Instant Payment — immediate money.' },
          { hindi: 'Respectful Treatment — always honor।', english: 'Respectful Treatment — always honor.' },
          { hindi: '24/7 Support — always available। Continue बोलें।', english: '24/7 Support — always available. Say Continue.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'पंडित जी, 4 Guarantees से आपका भरोसा बढ़ता है।', english: 'Pandit Ji, with 4 Guarantees your trust increases.' },
          { hindi: 'हर guarantee आपके हित के लिए।', english: 'Every guarantee for your benefit.' },
          { hindi: 'हर guarantee आपकी सुरक्षा के लिए।', english: 'Every guarantee for your safety.' },
          { hindi: 'हम आपके साथ हैं।', english: 'We are with you.' },
          { hindi: 'हमेशा आपके साथ। Continue बोलें।', english: 'Always with you. Say Continue.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'पंडित जी, 4 Guarantees unique हैं।', english: 'Pandit Ji, 4 Guarantees are unique.' },
          { hindi: 'दूसरे platform पर नहीं मिलते।', english: 'Not available on other platforms.' },
          { hindi: 'यह हमारा competitive edge है।', english: 'This is our competitive edge.' },
          { hindi: 'आपका फायदा है।', english: 'It is your benefit.' },
          { hindi: 'आगे बढ़ने के लिए Continue बोलें।', english: 'Say Continue to proceed.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, 4 Guarantees लिखित में हैं।', english: 'Pandit Ji, 4 Guarantees are in writing.' },
          { hindi: 'हम इन्हें follow करते हैं।', english: 'We follow them.' },
          { hindi: 'कभी नहीं टूटते।', english: 'Never break.' },
          { hindi: 'यह हमारा commitment है।', english: 'This is our commitment.' },
          { hindi: 'आपके प्रति हमारा वादा। Continue बोलें।', english: 'Our promise to you. Say Continue.' },
        ],
      },
    ],
  },
  {
    screenId: 'S-0.12',
    screenName: 'Final CTA',
    description: 'Final call to action for registration',
    fileName: '20_S-0.12_Final_CTA.ts',
    variants: [
      {
        variantId: 1,
        lines: [
          { hindi: 'पंडित जी, अब आप तैयार हैं HmarePanditJi join करने के लिए।', english: 'Pandit Ji, now you are ready to join HmarePanditJi.' },
          { hindi: 'Registration में केवल 5 मिनट लगेंगे।', english: 'Registration will take only 5 minutes.' },
          { hindi: 'आज ही join करें और अपनी आमदनी बढ़ाना शुरू करें।', english: 'Join today and start increasing your income.' },
          { hindi: 'हमारा वादा है — बेहतर income, बेहतर respect, बेहतर life।', english: 'Our promise — better income, better respect, better life.' },
          { hindi: 'Register करने के लिए Register बोलें या Register बटन दबाएं।', english: 'Say Register or press Register button to register.' },
        ],
      },
      {
        variantId: 2,
        lines: [
          { hindi: 'पंडित जी, आपका सफर शुरू होने वाला है।', english: 'Pandit Ji, your journey is about to begin.' },
          { hindi: 'एक नया अध्याय, नई उम्मीदें।', english: 'A new chapter, new hopes.' },
          { hindi: 'Registration बस एक click दूर।', english: 'Registration is just a click away.' },
          { hindi: 'आज ही शुरू करें।', english: 'Start today itself.' },
          { hindi: 'Register बोलें या Register बटन दबाएं।', english: 'Say Register or press Register button.' },
        ],
      },
      {
        variantId: 3,
        lines: [
          { hindi: 'पंडित जी, HmarePanditJi परिवार का हिस्सा बनें।', english: 'Pandit Ji, become part of HmarePanditJi family.' },
          { hindi: 'हज़ारों पंडित जी already joined हैं।', english: 'Thousands of Pandit Ji already joined.' },
          { hindi: 'आप भी शामिल हों।', english: 'You also join.' },
          { hindi: 'एक बड़ा community, एक बड़ा platform।', english: 'A big community, a big platform.' },
          { hindi: 'Register बोलें या Register बटन दबाएं।', english: 'Say Register or press Register button.' },
        ],
      },
      {
        variantId: 4,
        lines: [
          { hindi: 'पंडित जी, यह opportunity मत गंवाएं।', english: 'Pandit Ji, do not miss this opportunity.' },
          { hindi: 'आज का decision कल की success है।', english: 'Today decision is tomorrow success.' },
          { hindi: 'Registration free है।', english: 'Registration is free.' },
          { hindi: 'कोई risk नहीं।', english: 'No risk.' },
          { hindi: 'Register बोलें या Register बटन दबाएं।', english: 'Say Register or press Register button.' },
        ],
      },
      {
        variantId: 5,
        lines: [
          { hindi: 'पंडित जी, हम आपका इंतज़ार कर रहे हैं।', english: 'Pandit Ji, we are waiting for you.' },
          { hindi: 'आइए, साथ चलें।', english: 'Come, let us walk together.' },
          { hindi: 'आइए, साथ बढ़ें।', english: 'Come, let us grow together.' },
          { hindi: 'आइए, नई ऊंचाइयों को छूएं।', english: 'Come, let us touch new heights.' },
          { hindi: 'Register बोलें या Register बटन दबाएं।', english: 'Say Register or press Register button.' },
        ],
      },
    ],
  },
];

// Translation placeholders for regional languages
// In production, these would be replaced with actual translations
const TRANSLATION_TEMPLATES = {
  'ta-IN': (text) => `[Tamil] ${text}`,
  'te-IN': (text) => `[Telugu] ${text}`,
  'bn-IN': (text) => `[Bengali] ${text}`,
  'mr-IN': (text) => `[Marathi] ${text}`,
  'gu-IN': (text) => `[Gujarati] ${text}`,
  'kn-IN': (text) => `[Kannada] ${text}`,
  'ml-IN': (text) => `[Malayalam] ${text}`,
  'pa-IN': (text) => `[Punjabi] ${text}`,
  'or-IN': (text) => `[Odia] ${text}`,
  'en-IN': (text) => text, // English stays same
  'bhojpuri': (text) => `[Bhojpuri] ${text}`,
  'maithili': (text) => `[Maithili] ${text}`,
  'sanskrit': (text) => `[Sanskrit] ${text}`,
  'assamese': (text) => `[Assamese] ${text}`,
};

function generateScriptFile(screen) {
  let content = `/**
 * ${screen.screenId}: ${screen.screenName}
 * Description: ${screen.description}
 * Total: 375 scripts (15 languages × 5 variants × 5 lines)
 * Generated: ${new Date().toISOString()}
 * 
 * Variants: 5 (for A/B testing)
 * Languages: 15 (all Indian major languages)
 */

export interface VoiceScript {
  id: string;
  variant: number;
  text: string;
  romanTransliteration: string;
  englishMeaning: string;
  speaker: string;
  pace: number;
  pauseAfterMs: number;
  maxDurationS: number;
  emotionalTone: string;
  fallback?: boolean;
  fallbackFor?: string;
}

export interface ScreenScripts {
  screenId: string;
  screenName: string;
  description: string;
  totalVariants: number;
  totalLanguages: number;
  totalScripts: number;
  scripts: {
    [languageCode: string]: VoiceScript[];
  };
}

export const ${screen.screenId.replace(/-/g, '_').toUpperCase()}: ScreenScripts = {
  screenId: '${screen.screenId}',
  screenName: '${screen.screenName}',
  description: '${screen.description}',
  totalVariants: 5,
  totalLanguages: 15,
  totalScripts: 375,

  scripts: {
`;

  // Generate for each language
  LANGUAGES.forEach((lang, langIndex) => {
    const isPrimary = langIndex === 0; // Hindi is primary
    const isFallback = lang.fallback || false;

    content += `    // ==================== ${lang.name} (${lang.code}) - Priority ${lang.priority} ${isPrimary ? '(PRIMARY)' : ''}${isFallback ? '(FALLBACK)' : ''} ====================
    '${lang.code}': [
`;

    // Generate all 5 variants for this language
    screen.variants.forEach((variant, varIdx) => {
      variant.lines.forEach((line, lineIndex) => {
        let text = line.hindi;
        let romanTransliteration = line.english;

        // For non-Hindi languages, use translation template
        if (!isPrimary) {
          const langKey = lang.name.toLowerCase();
          const translator = TRANSLATION_TEMPLATES[langKey];
          if (translator) {
            text = translator(line.hindi);
            romanTransliteration = `[${lang.name}] ${line.english}`;
          }
        }

        const scriptId = `${screen.screenId}-line-${lineIndex + 1}-v${variant.variantId}`;
        content += `      {
        id: '${scriptId}',
        variant: ${variant.variantId},
        text: '${text.replace(/'/g, "\\'")}',
        romanTransliteration: '${romanTransliteration.replace(/'/g, "\\'")}',
        englishMeaning: '${line.english.replace(/'/g, "\\'")}',
        speaker: 'ratan',
        pace: ${lang.pace},
        pauseAfterMs: ${lineIndex < variant.lines.length - 1 ? 1000 : 500},
        maxDurationS: 8,
        emotionalTone: 'warm_respectful',${isFallback ? `
        fallback: true,
        fallbackFor: '${lang.fallbackFor}',` : ''}
      },
`;
      });
    });

    content += `    ],
`;
  });

  content += `  },
};

export default ${screen.screenId.replace(/-/g, '_').toUpperCase()};
`;

  return content;
}

function generateAllScripts() {
  const outputDir = __dirname;

  console.log('🚀 Generating enhanced voice scripts for Part 0 (all variants)...');
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`📊 Total screens: ${SCREENS.length}`);
  console.log(`🌍 Languages: ${LANGUAGES.length}`);
  console.log(`🔄 Variants per screen: 5`);
  console.log(`📝 Scripts per screen: ${5 * 5 * 15} (15 langs × 5 variants × 5 lines)`);
  console.log(`📈 Total scripts: ${SCREENS.length * 5 * 5 * 15}`);
  console.log('');

  SCREENS.forEach((screen, index) => {
    const content = generateScriptFile(screen);
    const filePath = path.join(outputDir, screen.fileName);

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ [${index + 1}/${SCREENS.length}] Generated: ${screen.fileName}`);
  });

  console.log('');
  console.log('🎉 Generation complete!');
  console.log(`📦 Total files created: ${SCREENS.length}`);
  console.log(`📊 Total scripts: ${SCREENS.length * 375}`);
  console.log('');
  console.log('📊 Script Count Breakdown:');
  console.log(`   - S-0.1: ${5 * 5 * 15} scripts (75 per variant × 5 variants)`);
  console.log(`   - S-0.2 to S-0.12: ${11 * 5 * 5 * 15} scripts`);
  console.log(`   - TOTAL: ${SCREENS.length * 375} scripts`);
  console.log('');
  console.log('⚠️  NOTE: These scripts have translation placeholders.');
  console.log('   Replace [Language] placeholders with actual translations.');
}

// Run generator
generateAllScripts();
