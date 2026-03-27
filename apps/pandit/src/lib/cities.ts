/**
 * City mappings for Hindi to English translation
 * Used in Manual City Selection screen
 */

export const HINDI_TO_ENGLISH_CITIES: Record<string, string> = {
  // Popular cities
  'वाराणसी': 'Varanasi',
  'दिल्ली': 'Delhi',
  'मुंबई': 'Mumbai',
  'कोलकाता': 'Kolkata',
  'चेन्नई': 'Chennai',
  'बेंगलुरु': 'Bengaluru',
  'हैदराबाद': 'Hyderabad',
  'पटना': 'Patna',
  
  // Uttar Pradesh
  'लखनऊ': 'Lucknow',
  'कानपुर': 'Kanpur',
  'आगरा': 'Agra',
  'प्रयागराज': 'Prayagraj',
  'इलाहाबाद': 'Allahabad',
  'गोरखपुर': 'Gorakhpur',
  'नोएडा': 'Noida',
  'ग्रेटर नोएडा': 'Greater Noida',
  'गाजियाबाद': 'Ghaziabad',
  'फरीदाबाद': 'Faridabad',
  'गुरुग्राम': 'Gurugram',
  'गुड़गांव': 'Gurgaon',
  'मेरठ': 'Meerut',
  'बरेली': 'Bareilly',
  'अलीगढ़': 'Aligarh',
  'मथुरा': 'Mathura',
  'हरिद्वार': 'Haridwar',
  'ऋषिकेश': 'Rishikesh',
  'देहरादून': 'Dehradun',
  
  // Bihar
  'गया': 'Gaya',
  'भागलपुर': 'Bhagalpur',
  'मुजफ्फरपुर': 'Muzaffarpur',
  'दरभंगा': 'Darbhanga',
  'पुरनिया': 'Purnia',
  'बिहार शरीफ': 'Bihar Sharif',
  'अररिया': 'Araria',
  
  // Rajasthan
  'जयपुर': 'Jaipur',
  'जोधपुर': 'Jodhpur',
  'उदयपुर': 'Udaipur',
  'कोटा': 'Kota',
  'अजमेर': 'Ajmer',
  'बीकानेर': 'Bikaner',
  'अलवर': 'Alwar',
  
  // Madhya Pradesh
  'भोपाल': 'Bhopal',
  'इंदौर': 'Indore',
  'ग्वालियर': 'Gwalior',
  'जबलपुर': 'Jabalpur',
  'उज्जैन': 'Ujjain',
  
  // Maharashtra
  'पुणे': 'Pune',
  'नागपुर': 'Nagpur',
  'नाशिक': 'Nashik',
  'औरंगाबाद': 'Aurangabad',
  
  // Gujarat
  'अहमदाबाद': 'Ahmedabad',
  'सूरत': 'Surat',
  'वडोदरा': 'Vadodara',
  'राजकोट': 'Rajkot',
  
  // West Bengal
  'सिलीगुड़ी': 'Siliguri',
  'दुर्गापुर': 'Durgapur',
  'हावड़ा': 'Howrah',
  
  // Tamil Nadu
  'मदुरै': 'Madurai',
  'कोयंबटूर': 'Coimbatore',
  'तिरुचिरापल्ली': 'Trichy',
  
  // Karnataka
  'बैंगलोर': 'Bangalore',
  'मैसूर': 'Mysuru',
  'हुबली': 'Hubli',
  
  // Kerala
  'कोच्चि': 'Kochi',
  'तिरुवनंतपुरम': 'Thiruvananthapuram',
  'कोझिकोड': 'Kozhikode',
  'थ्रिसूर': 'Thrissur',
  
  // Punjab
  'चंडीगढ़': 'Chandigarh',
  'अमृतसर': 'Amritsar',
  'लुधियाना': 'Ludhiana',
  'जालंधर': 'Jalandhar',
  
  // Haryana
  'पानीपत': 'Panipat',
  'अंबाला': 'Ambala',
  
  // Odisha
  'भुवनेश्वर': 'Bhubaneswar',
  'कटक': 'Cuttack',
  
  // Assam
  'गुवाहाटी': 'Guwahati',
  'दिसपुर': 'Dispur',
  
  // Jharkhand
  'रांची': 'Ranchi',
  'जमशेदपुर': 'Jamshedpur',
  'धनबाद': 'Dhanbad',
};

/**
 * Get English city name from Hindi input
 */
export function getEnglishCity(hindiCity: string): string {
  return HINDI_TO_ENGLISH_CITIES[hindiCity] || hindiCity;
}

/**
 * Get all available cities (Hindi names)
 */
export function getAllCities(): string[] {
  return Object.keys(HINDI_TO_ENGLISH_CITIES);
}
