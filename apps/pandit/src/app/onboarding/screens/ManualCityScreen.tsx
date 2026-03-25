'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { startListening, stopListening, speak, stopSpeaking } from '@/lib/voice-engine';

interface ManualCityScreenProps {
  language?: string;
  onLanguageChange?: () => void;
  onCitySelected: (city: string) => void;
  onBack: () => void;
}

const POPULAR_CITIES_ROW1 = ['दिल्ली', 'वाराणसी', 'पटना', 'लखनऊ'];
const POPULAR_CITIES_ROW2 = ['मुंबई', 'जयपुर', 'कोलकाता', 'हरिद्वार'];

// Expanded Hindi → English city name mapping (100+ major Indian cities)
const HINDI_TO_ENGLISH_CITIES: Record<string, string> = {
  // National Capital Region
  'दिल्ली': 'Delhi',
  'नई दिल्ली': 'New Delhi',
  'गुड़गांव': 'Gurgaon',
  'गुरुग्राम': 'Gurugram',
  'फरीदाबाद': 'Faridabad',
  'गाजियाबाद': 'Ghaziabad',
  'नोएडा': 'Noida',

  // Uttar Pradesh
  'वाराणसी': 'Varanasi',
  'काशी': 'Varanasi',
  'लखनऊ': 'Lucknow',
  'कानपुर': 'Kanpur',
  'आगरा': 'Agra',
  'इलाहाबाद': 'Prayagraj',
  'प्रयागराज': 'Prayagraj',
  'मेरठ': 'Meerut',
  'गोरखपुर': 'Gorakhpur',
  'फैजाबाद': 'Faizabad',
  'अयोध्या': 'Ayodhya',
  'मथुरा': 'Mathura',
  'वृंदावन': 'Vrindavan',
  'अलीगढ़': 'Aligarh',
  'बरेली': 'Bareilly',
  'अमरोहा': 'Amroha',
  'मुजफ्फरनगर': 'Muzaffarnagar',
  'सहारनपुर': 'Saharanpur',
  'मुरादाबाद': 'Moradabad',
  'रामपुर': 'Rampur',
  'शाहजहांपुर': 'Shahjahanpur',
  'लखीमपुर': 'Lakhimpur',
  'बहराइच': 'Bahraich',
  'गोंडा': 'Gonda',
  'बस्ती': 'Basti',
  'अंबेडकर नगर': 'Ambedkar Nagar',
  'सुल्तानपुर': 'Sultanpur',
  'प्रतापगढ़': 'Pratapgarh',
  'रायबरेली': 'Rae Bareli',
  'उन्नाव': 'Unnao',
  'हमीरपुर': 'Hamirpur',
  'महोबा': 'Mahoba',
  'बांदा': 'Banda',
  'चित्रकूट': 'Chitrakoot',
  'सतना': 'Satna',
  'फतेहपुर': 'Fatehpur',
  'कौशांबी': 'Kaushambi',
  'मिर्जापुर': 'Mirzapur',
  'सोनभद्र': 'Sonbhadra',
  'चंदौली': 'Chandauli',
  'गाजीपुर': 'Ghazipur',
  'बलिया': 'Ballia',
  'देवरिया': 'Deoria',
  'कुशीनगर': 'Kushinagar',
  'महाराजगंज': 'Maharajganj',
  'संत कबीर नगर': 'Sant Kabir Nagar',
  'सिद्धार्थनगर': 'Siddharthnagar',

  // Maharashtra
  'मुंबई': 'Mumbai',
  'बंबई': 'Mumbai',
  'पुणे': 'Pune',
  'नागपुर': 'Nagpur',
  'नाशिक': 'Nashik',
  'औरंगाबाद': 'Aurangabad',
  'सोलापुर': 'Solapur',
  'अमरावती': 'Amravati',
  'कोल्हापुर': 'Kolhapur',
  'सांगली': 'Sangli',
  'जालना': 'Jalna',
  'परभणी': 'Parbhani',
  'लातूर': 'Latur',
  'धुले': 'Dhule',
  'अहमदनगर': 'Ahmednagar',
  'चंद्रपुर': 'Chandrapur',
  'यवतमाल': 'Yavatmal',
  'अकोला': 'Akola',
  'वर्धा': 'Wardha',
  'भंडारा': 'Bhandara',
  'गोंदिया': 'Gondia',
  'गडचिरोली': 'Gadchiroli',

  // Rajasthan
  'जयपुर': 'Jaipur',
  'जोधपुर': 'Jodhpur',
  'उदयपुर': 'Udaipur',
  'कोटा': 'Kota',
  'बीकानेर': 'Bikaner',
  'अजमेर': 'Ajmer',
  'अलवर': 'Alwar',
  'भरतपुर': 'Bharatpur',
  'पाली': 'Pali',
  'सीकर': 'Sikar',
  'टोंक': 'Tonk',
  'बूंदी': 'Bundi',
  'चित्तौड़गढ़': 'Chittorgarh',
  'भीलवाड़ा': 'Bhilwara',
  'श्रीगंगानगर': 'Sri Ganganagar',
  'हनुमानगढ़': 'Hanumangarh',
  'झुंझुनूं': 'Jhunjhunu',
  'सवाई माधोपुर': 'Sawai Madhopur',
  'धौलपुर': 'Dholpur',
  'करौली': 'Karauli',
  'दौसा': 'Dausa',
  'नागौर': 'Nagaur',
  'जैसलमेर': 'Jaisalmer',
  'बाड़मेर': 'Barmer',
  'जालोर': 'Jalore',
  'सिरोही': 'Sirohi',
  'राजसमंद': 'Rajsamand',
  'डूंगरपुर': 'Dungarpur',
  'बांसवाड़ा': 'Banswara',

  // West Bengal
  'कोलकाता': 'Kolkata',
  'कलकत्ता': 'Kolkata',
  'हावड़ा': 'Howrah',
  'दुर्गापुर': 'Durgapur',
  'आसनसोल': 'Asansol',
  'सिलीगुड़ी': 'Siliguri',
  'मालदा': 'Malda',
  'बर्धमान': 'Bardhaman',
  'बहरामपुर': 'Baharampur',
  'हूगली': 'Hooghly',
  'खड़गपुर': 'Kharagpur',
  'जलपाईगुड़ी': 'Jalpaiguri',
  'रायगंज': 'Raiganj',
  'कृष्णानगर': 'Krishnanagar',
  'अलीपुरद्वार': 'Alipurduar',
  'पुरুলिया': 'Purulia',
  'बांकुड़ा': 'Bankura',
  'बिष्णुपुर': 'Bishnupur',

  // Uttarakhand
  'हरिद्वार': 'Haridwar',
  'ऋषिकेश': 'Rishikesh',
  'देहरादून': 'Dehradun',
  'नैनीताल': 'Nainital',
  'मसूरी': 'Mussoorie',
  'अल्मोड़ा': 'Almora',
  'रानीखेत': 'Ranikhet',
  'कौसानी': 'Kausani',
  'पौड़ी': 'Pauri',
  'टेहरी': 'Tehri',
  'उत्तरकाशी': 'Uttarkashi',
  'चमोली': 'Chamoli',
  'रुद्रप्रयाग': 'Rudraprayag',
  'बागेश्वर': 'Bageshwar',
  'चंपावत': 'Champawat',
  'पिथौरागढ़': 'Pithoragarh',

  // Madhya Pradesh
  'उज्जैन': 'Ujjain',
  'इंदौर': 'Indore',
  'भोपाल': 'Bhopal',
  'ग्वालियर': 'Gwalior',
  'जबलपुर': 'Jabalpur',
  'सांची': 'Sanchi',
  'खजुराहो': 'Khajuraho',
  'ओरछा': 'Orchha',
  'मांडू': 'Mandu',
  'भेड़ाघाट': 'Bhedaghat',
  'कटनी': 'Katni',
  'रीवा': 'Rewa',
  'शाहडोल': 'Shahdol',
  'छिंदवाड़ा': 'Chhindwara',
  'बेतूल': 'Betul',
  'होशंगाबाद': 'Hoshangabad',
  'विदिशा': 'Vidisha',
  'सागर': 'Sagar',
  'दमोह': 'Damoh',
  'टीकमगढ़': 'Tikamgarh',
  'नीमच': 'Neemuch',
  'मंदसौर': 'Mandsaur',
  'रतलाम': 'Ratlam',
  'झाबुआ': 'Jhabua',
  'अलीराजपुर': 'Alirajpur',
  'बारवानी': 'Barwani',
  'खंडवा': 'Khandwa',
  'बुरहानपुर': 'Burhanpur',

  // Bihar
  'पटना': 'Patna',
  'गया': 'Gaya',
  'बोधगया': 'Bodh Gaya',
  'नालंदा': 'Nalanda',
  'राजगीर': 'Rajgir',
  'वैशाली': 'Vaishali',
  'मुजफ्फरपुर': 'Muzaffarpur',
  'भागलपुर': 'Bhagalpur',
  'दरभंगा': 'Darbhanga',
  'पूर्णिया': 'Purnia',
  'बक्सर': 'Buxar',
  'सासाराम': 'Sasaram',
  'छपरा': 'Chhapra',
  'बेगूसराय': 'Begusarai',
  'मधुबनी': 'Madhubani',
  'सीतामढ़ी': 'Sitamarhi',
  'समस्तीपुर': 'Samastipur',
  'सहरसा': 'Saharsa',
  'सुपौल': 'Supaul',
  'अररिया': 'Araria',
  'किशनगंज': 'Kishanganj',
  'कटिहार': 'Katihar',
  'खगड़िया': 'Khagaria',
  'जमुई': 'Jamui',
  'झाझा': 'Jhajha',
  'नवादा': 'Nawada',

  // Gujarat
  'अहमदाबाद': 'Ahmedabad',
  'गांधीनगर': 'Gandhinagar',
  'सूरत': 'Surat',
  'वडोदरा': 'Vadodara',
  'राजकोट': 'Rajkot',
  'भावनगर': 'Bhavnagar',
  'जामनगर': 'Jamnagar',
  'जूनागढ़': 'Junagadh',
  'गिरनार': 'Girnar',
  'द्वारका': 'Dwarka',
  'सोमनाथ': 'Somnath',
  'वेरावल': 'Veraval',
  'पोरबंदर': 'Porbandar',
  'मोरबी': 'Morbi',
  'नवसारी': 'Navsari',
  'वलसाड': 'Valsad',
  'अंकलेश्वर': 'Ankleshwar',
  'भरूच': 'Bharuch',
  'खेड़ा': 'Kheda',
  'महेसाणा': 'Mehsana',
  'पाटन': 'Patan',
  'बनासकांठा': 'Banas Kantha',
  'साबरकांठा': 'Sabar Kantha',
  'पंचमहल': 'Panch Mahal',
  'दाहोद': 'Dahod',
  'व्यापरा': 'Vyara',

  // Tamil Nadu
  'चेन्नई': 'Chennai',
  'मद्रास': 'Chennai',
  'मदुरै': 'Madurai',
  'तिरुचिरापल्ली': 'Tiruchirappalli',
  'कोयंबतूर': 'Coimbatore',
  'सेलम': 'Salem',
  'तिरुनेलवेली': 'Tirunelveli',
  'तिरुपुर': 'Tirupur',
  'वेल्लोर': 'Vellore',
  'ईरोड': 'Erode',
  'तंजावुर': 'Thanjavur',
  'कांचीपुरम': 'Kanchipuram',
  'त्रिची': 'Trichy',
  'कुम्भकोणम': 'Kumbakonam',
  'चिदंबरम': 'Chidambaram',
  'रामेश्वरम': 'Rameswaram',
  'कन्याकुमारी': 'Kanyakumari',
  'नागरकोविल': 'Nagercoil',
  'होसुर': 'Hosur',
  'कृष्णगिरि': 'Krishnagiri',
  'धर्मपुरी': 'Dharmapuri',
  'करूर': 'Karur',
  'पुदुकोट्टै': 'Pudukkottai',
  'शिवगंगा': 'Sivaganga',
  'विरुधुनगर': 'Virudhunagar',
  'तूतुकुड़ी': 'Thoothukudi',
  'नमक्कल': 'Namakkal',
  'पेरामबलूर': 'Perambalur',
  'अरियलूर': 'Ariyalur',
  'कल्लाकुरिची': 'Kallakurichi',
  'विल्लुपुरम': 'Villupuram',
  'तिरुवन्नामलाई': 'Tiruvannamalai',
  'रानीपेट': 'Ranipet',
  'तिरुपत्तूर': 'Tirupathur',

  // Telangana
  'हैदराबाद': 'Hyderabad',
  'सिकंदराबाद': 'Secunderabad',
  'वारंगल': 'Warangal',
  'निजामाबाद': 'Nizamabad',
  'करिमनगर': 'Karimnagar',
  'खम्मम': 'Khammam',
  'महबूबनगर': 'Mahbubnagar',
  'नलगोंडा': 'Nalgonda',
  'आदिलाबाद': 'Adilabad',
  'रंगारेड्डी': 'Ranga Reddy',
  'मेदक': 'Medak',

  // Karnataka
  'बेंगलुरु': 'Bengaluru',
  'बैंगलोर': 'Bangalore',
  'मैसुरु': 'Mysuru',
  'मैसूर': 'Mysore',
  'मंगलुरु': 'Mangaluru',
  'मंगलोर': 'Mangalore',
  'हुबली': 'Hubli',
  'धारवाड़': 'Dharwad',
  'बेलगाम': 'Belgaum',
  'गुलबर्गा': 'Gulbarga',
  'बीदर': 'Bidar',
  'रायचूर': 'Raichur',
  'बेल्लारी': 'Bellary',
  'होसपेट': 'Hospet',
  'हम्पी': 'Hampi',
  'बादामी': 'Badami',
  'ऐहोल': 'Aihole',
  'पट्टदकल': 'Pattadakal',
  'गोकर्ण': 'Gokarna',
  'उडुपी': 'Udupi',
  'कुर्ग': 'Kodagu',
  'शिमोगा': 'Shimoga',
  'चित्रदुर्ग': 'Chitradurga',
  'तुमकुर': 'Tumkur',
  'कोलार': 'Kolar',

  // Punjab
  'अमृतसर': 'Amritsar',
  'लुधियाना': 'Ludhiana',
  'जालंधर': 'Jalandhar',
  'पटियाला': 'Patiala',
  'भटिंडा': 'Bathinda',
  'मोहाली': 'Mohali',
  'फिरोजपुर': 'Firozpur',
  'कपूरथला': 'Kapurthala',
  'होशियारपुर': 'Hoshiarpur',
  'गुरदासपुर': 'Gurdaspur',
  'पठानकोट': 'Pathankot',
  'मोगा': 'Moga',
  'अजितगढ़': 'Ajitgarh',
  'रूपनगर': 'Rupnagar',
  'फतेहगढ़ साहिब': 'Fatehgarh Sahib',
  'बरनाला': 'Barnala',
  'संगरूर': 'Sangrur',
  'फरीदकोट': 'Faridkot',
  'मुक्तसर': 'Muktsar',
  'फाजिल्का': 'Fazilka',

  // Haryana
  'चंडीगढ़': 'Chandigarh',
  'पानीपत': 'Panipat',
  'अंबाला': 'Ambala',
  'यमुनानगर': 'Yamunanagar',
  'रोहतक': 'Rohtak',
  'हिसार': 'Hisar',
  'करनाल': 'Karnal',
  'सोनीपत': 'Sonipat',
  'झज्जर': 'Jhajjar',
  'फतेहाबाद': 'Fatehabad',
  'सिरसा': 'Sirsa',
  'जींद': 'Jind',
  'कैथल': 'Kaithal',
  'कुरुक्षेत्र': 'Kurukshetra',
  'मेवात': 'Nuh',
  'पलवल': 'Palwal',
  'रेवाड़ी': 'Rewari',
  'महेंद्रगढ़': 'Mahendragarh',

  // Himachal Pradesh
  'शिमला': 'Shimla',
  'मनाली': 'Manali',
  'धर्मशाला': 'Dharmshala',
  'कुल्लू': 'Kullu',
  'कांगड़ा': 'Kangra',
  'चंबा': 'Chamba',
  'मंडी': 'Mandi',
  'बिलासपुर': 'Bilaspur',
  'सोलन': 'Solan',
  'सिरमौर': 'Sirmaur',
  'किन्नौर': 'Kinnaur',
  'लाहौल': 'Lahaul',
  'स्पीति': 'Spiti',

  // Jammu and Kashmir
  'श्रीनगर': 'Srinagar',
  'जम्मू': 'Jammu',
  'अनंतनाग': 'Anantnag',
  'बारामुला': 'Baramulla',
  'कुपवाड़ा': 'Kupwara',
  'पुंछ': 'Poonch',
  'राजौरी': 'Rajouri',
  'उधमपुर': 'Udhampur',
  'कठुआ': 'Kathua',
  'सांबा': 'Samba',
  'रियासी': 'Reasi',
  'डोडा': 'Doda',
  'रामबन': 'Ramban',
  'किश्तवाड़': 'Kishtwar',

  // Northeast
  'गुवाहाटी': 'Guwahati',
  'दिसपुर': 'Dispur',
  'शिलांग': 'Shillong',
  'इम्फाल': 'Imphal',
  'आइजोल': 'Aizawl',
  'कोहिमा': 'Kohima',
  'दीमापुर': 'Dimapur',
  'इटानगर': 'Itanagar',
  'अगरतला': 'Agartala',
  'गंगटोक': 'Gangtok',
  'नाथुला': 'Nathula',

  // Odisha
  'भुवनेश्वर': 'Bhubaneswar',
  'कटक': 'Cuttack',
  'पुरी': 'Puri',
  'कोणार्क': 'Konark',
  'बालासोर': 'Balasore',
  'संबलपुर': 'Sambalpur',
  'राउरकेला': 'Rourkela',
  'बेरहामपुर': 'Berhampur',
  'झारसुगुड़ा': 'Jharsuguda',

  // Kerala
  'तिरुवनंतपुरम': 'Thiruvananthapuram',
  'कोच्चि': 'Kochi',
  'कोचीन': 'Cochin',
  'कोझिकोड': 'Kozhikode',
  'कालीकट': 'Calicut',
  'थ्रिसुर': 'Thrissur',
  'कोल्लम': 'Kollam',
  'आलप्पुझा': 'Alappuzha',
  'पालक्काड़': 'Palakkad',
  'कन्नूर': 'Kannur',
  'कासरगोड': 'Kasaragod',
  'कोट्टयम': 'Kottayam',
  'इडुक्की': 'Idukki',
  'पथानमथिट्टा': 'Pathanamthitta',

  // Andhra Pradesh
  'विशाखापट्टनम': 'Visakhapatnam',
  'विजयवाड़ा': 'Vijayawada',
  'गुंटूर': 'Guntur',
  'नेल्लोर': 'Nellore',
  'कुरनूल': 'Kurnool',
  'राजमहेंद्रवरम': 'Rajahmundry',
  'तिरुपति': 'Tirupati',
  'काकीनाडा': 'Kakinada',
  'अनंतपुर': 'Anantapur',
  'चित्तूर': 'Chittoor',

  // Assam
  'सिलचर': 'Silchar',
  'जोरहाट': 'Jorhat',
  'दिब्रूगढ़': 'Dibrugarh',
  'तेजपुर': 'Tezpur',
  'नगांव': 'Nagaon',

  // Jharkhand
  'रांची': 'Ranchi',
  'जमशेदपुर': 'Jamshedpur',
  'धनबाद': 'Dhanbad',
  'बोक़ारो': 'Bokaro',
  'देवघर': 'Deoghar',
  'हजारीबाग': 'Hazaribag',
  'गिरिडीह': 'Giridih',
  'दुमका': 'Dumka',
};

export default function ManualCityScreen({ onCitySelected, onBack, onLanguageChange }: ManualCityScreenProps) {
  const [cityInput, setCityInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      speak("Kripya apna shehar bolein ya neeche diye gaye shahron mein se chunein.", "hi-IN");
    }, 600);
    return () => {
      clearTimeout(timer);
      stopListening();
      stopSpeaking();
    };
  }, []);

  const handleMicTap = () => {
    setVoiceError('');
    setIsListening(true);
    setCityInput('');

    const cleanup = startListening({
      language: 'hi-IN',
      onStateChange: (s) => {
        if (s === 'IDLE' || s === 'SUCCESS' || s === 'FAILURE') {
          setIsListening(false);
        }
      },
      onResult: (result) => {
        setCityInput(result.transcript);
        setIsListening(false);
        if (result.isFinal && result.transcript.length > 1) {
          setTimeout(() => onCitySelected(result.transcript), 800);
        }
      },
      onError: (err) => {
        setIsListening(false);
        if (err === 'NOT_SUPPORTED') setVoiceError('आवाज़ इस ब्राउज़र में काम नहीं करती। नीचे से शहर चुनें।');
        else if (err === 'TIMEOUT') setVoiceError('समय समाप्त। फिर कोशिश करें।');
        else if (err !== 'MIC_OFF_WHILE_SPEAKING') setVoiceError('आवाज़ नहीं सुनाई दी। फिर कोशिश करें।');
      },
    });
    return cleanup;
  };

  return (
    <main className="relative mx-auto min-h-dvh max-w-[390px] flex flex-col overflow-hidden bg-surface-base shadow-xl w-full">
      {/* Top Bar with Prominent Om Symbol */}
      <header className="flex flex-col items-center pt-6 pb-2 px-4">
        {/* Large Om Symbol - Trust Signal for Vedic App */}
        <div className="mb-2">
          <span className="text-[80px] font-bold font-body text-saffron animate-gentle-float" aria-label="पवित्र ओम प्रतीक">
            ॐ
          </span>
        </div>
        <div className="flex items-center gap-2 font-bold font-body text-[28px] text-text-primary">
          <span className="text-[40px] text-saffron">ॐ</span>
          <span>HmarePanditJi</span>
        </div>
      </header>

      {/* Back and Language Row */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Back button with haptic feedback and larger touch target */}
        <button
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            onBack();
          }}
          aria-label="पीछे जाएं"
          className="min-h-[72px] min-w-[72px] p-1 active:opacity-50 text-text-primary focus:ring-4 focus:ring-saffron focus:outline-none rounded-full hover:bg-surface-muted"
        >
          <svg fill="none" height="40" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="40">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        {/* Language switcher with text label - ACC-009 FIX: Larger touch target */}
        <button
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            onLanguageChange?.();
          }}
          aria-label="भाषा बदलें / Change Language"
          className="min-h-[72px] px-6 flex items-center gap-3 text-[24px] font-bold font-body text-text-primary active:opacity-50 focus:ring-4 focus:ring-saffron focus:outline-none border-3 border-border-default rounded-2xl bg-surface-card hover:bg-surface-muted transition-colors shadow-card"
        >
          <span>हिन्दी</span>
          <span className="text-[24px] text-text-secondary">/</span>
          <span>English</span>
        </button>
      </div>

      {/* Content Area */}
      <section className="flex-grow px-6 pt-4 flex flex-col gap-6">

        {/* Reassurance and Title */}
        <div className="text-center space-y-2">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[28px] font-body text-saffron font-bold">
            कोई बात नहीं।
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[40px] font-body font-bold leading-tight text-text-primary">
            अपना शहर बताइए
          </motion.h1>
        </div>

        {/* Voice Input Box - Haptic feedback */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            handleMicTap();
          }}
          className="relative bg-saffron-lt border-3 border-saffron rounded-2xl p-6 flex items-center gap-5 cursor-pointer overflow-hidden shadow-card active:scale-95 transition-transform min-h-[120px]"
        >
          <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
            {isListening && (
              <>
                {/* More visible pulse animation for bright sunlight */}
                <motion.div
                  animate={{ scale: [0.8, 1.8], opacity: [1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-saffron border-4 border-saffron/50 rounded-full"
                />
                <motion.div
                  animate={{ scale: [0.8, 1.8], opacity: [1, 0.3] }}
                  transition={{ duration: 1.5, delay: 0.3, repeat: Infinity }}
                  className="absolute inset-0 bg-saffron border-4 border-saffron/50 rounded-full"
                />
              </>
            )}
            <div className="relative bg-saffron rounded-full p-4 z-10">
              <svg fill="none" height="40" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="40">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[30px] font-body font-bold text-text-primary truncate">
              {isListening ? 'सुन रहा हूँ...' : (cityInput || 'अपना शहर बोलें')}
            </span>
            <span className="text-[24px] font-body text-saffron font-medium">जैसे: &apos;वाराणसी&apos; या &apos;दिल्ली&apos;</span>
          </div>
        </motion.div>

        {/* Voice error */}
        {voiceError && (
          <p className="text-error text-[26px] font-body text-center font-bold -mt-2">{voiceError}</p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 text-[24px] font-body font-bold text-saffron/60">
          <div className="h-[3px] flex-grow bg-surface-dim"></div>
          <span>या नीचे से चुनें</span>
          <div className="h-[3px] flex-grow bg-surface-dim"></div>
        </div>

        {/* Text Search Bar */}
        <div className="relative bg-surface-card border-3 border-border-default rounded-2xl px-6 py-5 flex items-center gap-4 shadow-card min-h-[96px]">
          <svg fill="none" height="40" stroke="#FF8C00" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="40">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="text-[30px] font-body text-text-primary bg-transparent outline-none w-full placeholder-text-placeholder font-bold"
            placeholder="अपना शहर लिखें..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && cityInput.trim().length > 1) {
                const englishCity = HINDI_TO_ENGLISH_CITIES[cityInput.trim()] || cityInput.trim();
                onCitySelected(englishCity);
              }
            }}
          />
          {cityInput.trim().length > 1 && (
            <button
              onClick={() => {
                const englishCity = HINDI_TO_ENGLISH_CITIES[cityInput.trim()] || cityInput.trim();
                onCitySelected(englishCity);
              }}
              className="bg-saffron text-white text-[26px] font-body font-bold px-8 py-5 min-h-[80px] rounded-2xl active:scale-95 shrink-0 focus:ring-4 focus:ring-saffron focus:outline-none shadow-btn-saffron"
            >
              ठीक है
            </button>
          )}
        </div>

        {/* Popular Cities */}
        <div className="space-y-4">
          <h2 className="text-[28px] font-body font-bold text-text-secondary">लोकप्रिय शहर</h2>

          {[POPULAR_CITIES_ROW1, POPULAR_CITIES_ROW2].map((row, rIdx) => (
            <div key={rIdx} className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {row.map((city, cIdx) => (
                <motion.button
                  key={cIdx}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * (rIdx * 4 + cIdx) }}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10);
                    const englishCity = HINDI_TO_ENGLISH_CITIES[city] || city;
                    onCitySelected(englishCity);
                  }}
                  className="whitespace-nowrap px-10 py-5 min-h-[88px] bg-surface-card border-3 border-saffron text-text-primary rounded-2xl font-body font-bold text-[28px] active:bg-saffron-light shrink-0 focus:ring-4 focus:ring-saffron focus:outline-none hover:border-saffron/60 shadow-card"
                >
                  {city}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Voice Status Footer */}
      <footer className="mt-auto px-6 pb-8 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isListening && (
            <>
              <div className="flex items-end gap-2 h-8">
                <div className="w-3 bg-saffron rounded-full animate-voice-bar"></div>
                <div className="w-3 bg-saffron rounded-full animate-voice-bar-2 h-full"></div>
                <div className="w-3 bg-saffron rounded-full animate-voice-bar-3"></div>
              </div>
              <span className="text-[26px] font-body text-text-primary font-bold">सुन रहा हूँ...</span>
            </>
          )}
        </div>

        {/* Keyboard toggle button with larger touch target */}
        <button
          aria-label="Toggle keyboard"
          onClick={() => inputRef.current?.focus()}
          className="min-h-[72px] min-w-[72px] p-4 bg-surface-card rounded-2xl shadow-card border-3 border-border-default active:scale-95 transition-transform focus:ring-4 focus:ring-saffron focus:outline-none"
        >
          <svg fill="none" height="40" stroke="#FF8C00" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="40">
            <rect height="16" rx="2" width="20" x="2" y="4"></rect>
            <path d="M6 8h.01"></path><path d="M10 8h.01"></path><path d="M14 8h.01"></path><path d="M18 8h.01"></path>
            <path d="M8 12h.01"></path><path d="M12 12h.01"></path><path d="M16 12h.01"></path>
            <path d="M7 16h10"></path>
          </svg>
        </button>
      </footer>
    </main>
  );
}
