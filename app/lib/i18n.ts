// Lightweight i18n. Cookie-driven locale, read by both server and client.
// Hindi/Kannada are best-effort — have a native speaker review before launch.
export const locales = ["en", "hi", "kn"] as const;
export type Locale = (typeof locales)[number];
export const localeNames: Record<Locale, string> = { en: "English", hi: "हिन्दी", kn: "ಕನ್ನಡ" };

type Entry = Record<Locale, string>;

const dict: Record<string, Entry> = {
  "nav.explore": { en: "Explore", hi: "एक्सप्लोर", kn: "ಅನ್ವೇಷಿಸಿ" },
  "nav.list": { en: "List your land", hi: "अपनी ज़मीन सूचीबद्ध करें", kn: "ನಿಮ್ಮ ಭೂಮಿ ಪಟ್ಟಿ ಮಾಡಿ" },
  "nav.buy": { en: "I want to buy", hi: "मुझे खरीदना है", kn: "ಖರೀದಿಸಲು ಬಯಸುತ್ತೇನೆ" },
  "nav.requirements": { en: "Requirements", hi: "आवश्यकताएँ", kn: "ಅಗತ್ಯಗಳು" },
  "nav.eligibility": { en: "Eligibility", hi: "पात्रता", kn: "ಅರ್ಹತೆ" },
  "nav.signin": { en: "Sign in", hi: "साइन इन करें", kn: "ಸೈನ್ ಇನ್" },
  "nav.signout": { en: "Sign out", hi: "साइन आउट", kn: "ಸೈನ್ ಔಟ್" },
  "nav.saved": { en: "Saved", hi: "सहेजे गए", kn: "ಉಳಿಸಲಾಗಿದೆ" },
  "nav.collections": { en: "Collections", hi: "संग्रह", kn: "ಸಂಗ್ರಹಗಳು" },
  "nav.myListings": { en: "My listings", hi: "मेरी सूचियाँ", kn: "ನನ್ನ ಪಟ್ಟಿಗಳು" },
  "nav.agent": { en: "Agent", hi: "एजेंट", kn: "ಏಜೆಂಟ್" },
  "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" },

  "search.placeholder": { en: "Search by village, taluka, or district…", hi: "गाँव, तालुका या ज़िले से खोजें…", kn: "ಗ್ರಾಮ, ತಾಲೂಕು ಅಥವಾ ಜಿಲ್ಲೆಯ ಮೂಲಕ ಹುಡುಕಿ…" },
  "search.button": { en: "Search", hi: "खोजें", kn: "ಹುಡುಕಿ" },

  "home.badge": { en: "🌿 The land marketplace built for trust", hi: "🌿 भरोसे के लिए बना ज़मीन बाज़ार", kn: "🌿 ವಿಶ್ವಾಸಕ್ಕಾಗಿ ನಿರ್ಮಿಸಿದ ಭೂ ಮಾರುಕಟ್ಟೆ" },
  "home.titlePre": { en: "Find trusted", hi: "भरोसेमंद", kn: "ವಿಶ್ವಾಸಾರ್ಹ" },
  "home.titleHighlight": { en: "agricultural land", hi: "कृषि भूमि खोजें", kn: "ಕೃಷಿ ಭೂಮಿ ಹುಡುಕಿ" },
  "home.subtitle": {
    en: "Verified listings with legal clarity and real boundaries — so you can buy farmland with confidence.",
    hi: "कानूनी स्पष्टता और वास्तविक सीमाओं के साथ सत्यापित लिस्टिंग — ताकि आप भरोसे के साथ कृषि भूमि खरीद सकें।",
    kn: "ಕಾನೂನು ಸ್ಪಷ್ಟತೆ ಮತ್ತು ನೈಜ ಗಡಿಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿದ ಪಟ್ಟಿಗಳು — ನೀವು ವಿಶ್ವಾಸದಿಂದ ಕೃಷಿ ಭೂಮಿ ಖರೀದಿಸಬಹುದು.",
  },
  "home.listFree": { en: "List your land for free", hi: "अपनी ज़मीन मुफ़्त में सूचीबद्ध करें", kn: "ನಿಮ್ಮ ಭೂಮಿಯನ್ನು ಉಚಿತವಾಗಿ ಪಟ್ಟಿ ಮಾಡಿ" },
  "home.postBuy": { en: "Post what you want to buy", hi: "आप क्या खरीदना चाहते हैं पोस्ट करें", kn: "ನೀವು ಏನು ಖರೀದಿಸಬೇಕೆಂದು ಪೋಸ್ಟ್ ಮಾಡಿ" },
  "home.statListings": { en: "listings", hi: "सूचियाँ", kn: "ಪಟ್ಟಿಗಳು" },
  "home.statBuyers": { en: "buyer requirements", hi: "खरीदार आवश्यकताएँ", kn: "ಖರೀದಿದಾರ ಅಗತ್ಯಗಳು" },
  "home.budget25": { en: "Under ₹25 lakh", hi: "₹25 लाख से कम", kn: "₹25 ಲಕ್ಷದೊಳಗೆ" },
  "home.budget50": { en: "Under ₹50 lakh", hi: "₹50 लाख से कम", kn: "₹50 ಲಕ್ಷದೊಳಗೆ" },
  "home.budget100": { en: "Under ₹1 crore", hi: "₹1 करोड़ से कम", kn: "₹1 ಕೋಟಿಯೊಳಗೆ" },
  "home.p.orchard": { en: "Orchards", hi: "बाग", kn: "ತೋಟಗಳು" },
  "home.p.farmhouse": { en: "Farmhouse land", hi: "फार्महाउस भूमि", kn: "ಫಾರ್ಮ್‌ಹೌಸ್ ಭೂಮಿ" },
  "home.p.irrigated": { en: "Irrigated farmland", hi: "सिंचित कृषि भूमि", kn: "ನೀರಾವರಿ ಕೃಷಿಭೂಮಿ" },
  "home.p.na": { en: "NA-converted", hi: "एनए-परिवर्तित", kn: "ಎನ್‌ಎ-ಪರಿವರ್ತಿತ" },

  "home.needsTitle": { en: "Browse by what matters", hi: "जो मायने रखता है उसके अनुसार देखें", kn: "ಮುಖ್ಯವಾದದ್ದರ ಪ್ರಕಾರ ಹುಡುಕಿ" },
  "home.needsSub": { en: "Jump straight to land that fits how you'll use it.", hi: "सीधे उस ज़मीन तक पहुँचें जो आपके उपयोग के अनुकूल हो।", kn: "ನೀವು ಬಳಸುವ ರೀತಿಗೆ ಹೊಂದುವ ಭೂಮಿಗೆ ನೇರವಾಗಿ ಹೋಗಿ." },
  "home.need.verified": { en: "Verified listings", hi: "सत्यापित सूचियाँ", kn: "ಪರಿಶೀಲಿತ ಪಟ್ಟಿಗಳು" },
  "home.need.verifiedSub": { en: "Checked by our team", hi: "हमारी टीम द्वारा जाँची गई", kn: "ನಮ್ಮ ತಂಡದಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ" },
  "home.need.water": { en: "Borewell water", hi: "बोरवेल पानी", kn: "ಬೋರ್‌ವೆಲ್ ನೀರು" },
  "home.need.waterSub": { en: "Assured irrigation", hi: "सुनिश्चित सिंचाई", kn: "ಖಚಿತ ನೀರಾವರಿ" },
  "home.need.highway": { en: "Highway access", hi: "हाईवे पहुँच", kn: "ಹೆದ್ದಾರಿ ಸಂಪರ್ಕ" },
  "home.need.highwaySub": { en: "Easy to reach", hi: "पहुँचने में आसान", kn: "ತಲುಪಲು ಸುಲಭ" },
  "home.need.orchards": { en: "Orchards", hi: "बाग", kn: "ತೋಟಗಳು" },
  "home.need.orchardsSub": { en: "Mango, coconut & more", hi: "आम, नारियल और बहुत कुछ", kn: "ಮಾವು, ತೆಂಗು ಮತ್ತು ಹೆಚ್ಚು" },
  "home.need.budget": { en: "Budget picks", hi: "बजट विकल्प", kn: "ಬಜೆಟ್ ಆಯ್ಕೆಗಳು" },
  "home.need.budgetSub": { en: "Under ₹25 lakh", hi: "₹25 लाख से कम", kn: "₹25 ಲಕ್ಷದೊಳಗೆ" },
  "home.need.largest": { en: "Largest plots", hi: "सबसे बड़े प्लॉट", kn: "ಅತಿದೊಡ್ಡ ಪ್ಲಾಟ್‌ಗಳು" },
  "home.need.largestSub": { en: "Most acreage first", hi: "सबसे ज़्यादा रकबा पहले", kn: "ಹೆಚ್ಚು ವಿಸ್ತೀರ್ಣ ಮೊದಲು" },

  "home.justListed": { en: "Just listed", hi: "अभी सूचीबद्ध", kn: "ಈಗ ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ" },
  "home.justListedSub": { en: "The newest land on Bhūmi.", hi: "Bhūmi पर सबसे नई ज़मीन।", kn: "Bhūmi ನಲ್ಲಿ ಹೊಸ ಭೂಮಿ." },
  "common.viewAll": { en: "View all →", hi: "सभी देखें →", kn: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ →" },
  "home.regionsTitle": { en: "Browse land by region", hi: "क्षेत्र के अनुसार ज़मीन देखें", kn: "ಪ್ರದೇಶದ ಪ್ರಕಾರ ಭೂಮಿ ಹುಡುಕಿ" },
  "home.regionsSub": { en: "Explore agricultural land in these districts.", hi: "इन ज़िलों में कृषि भूमि एक्सप्लोर करें।", kn: "ಈ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಕೃಷಿ ಭೂಮಿ ಅನ್ವೇಷಿಸಿ." },

  "home.pillar.verified": { en: "Verified listings", hi: "सत्यापित सूचियाँ", kn: "ಪರಿಶೀಲಿತ ಪಟ್ಟಿಗಳು" },
  "home.pillar.verifiedBody": { en: "Every listing shows its trust status. Know what has been checked before you call.", hi: "हर सूची अपनी भरोसा स्थिति दिखाती है। कॉल करने से पहले जानें कि क्या जाँचा गया है।", kn: "ಪ್ರತಿ ಪಟ್ಟಿ ತನ್ನ ವಿಶ್ವಾಸ ಸ್ಥಿತಿಯನ್ನು ತೋರಿಸುತ್ತದೆ. ಕರೆ ಮಾಡುವ ಮೊದಲು ಏನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಎಂದು ತಿಳಿಯಿರಿ." },
  "home.pillar.legal": { en: "Legal clarity", hi: "कानूनी स्पष्टता", kn: "ಕಾನೂನು ಸ್ಪಷ್ಟತೆ" },
  "home.pillar.legalBody": { en: "Can you buy farmland in this state? We answer with sources, not guesses.", hi: "क्या आप इस राज्य में कृषि भूमि खरीद सकते हैं? हम अनुमान नहीं, स्रोतों के साथ उत्तर देते हैं।", kn: "ಈ ರಾಜ್ಯದಲ್ಲಿ ನೀವು ಕೃಷಿ ಭೂಮಿ ಖರೀದಿಸಬಹುದೇ? ನಾವು ಊಹೆಯಿಂದಲ್ಲ, ಮೂಲಗಳಿಂದ ಉತ್ತರಿಸುತ್ತೇವೆ." },
  "home.pillar.boundaries": { en: "Real boundaries", hi: "वास्तविक सीमाएँ", kn: "ನೈಜ ಗಡಿಗಳು" },
  "home.pillar.boundariesBody": { en: "See actual land on satellite maps, not just address pins.", hi: "सिर्फ़ पते के पिन नहीं, सैटेलाइट मानचित्र पर वास्तविक ज़मीन देखें।", kn: "ಕೇವಲ ವಿಳಾಸ ಪಿನ್‌ಗಳಲ್ಲ, ಉಪಗ್ರಹ ನಕ್ಷೆಗಳಲ್ಲಿ ನೈಜ ಭೂಮಿಯನ್ನು ನೋಡಿ." },

  "footer.buy": { en: "Buy land", hi: "ज़मीन खरीदें", kn: "ಭೂಮಿ ಖರೀದಿಸಿ" },
  "footer.howItWorks": { en: "How it works", hi: "यह कैसे काम करता है", kn: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ" },
  "footer.tools": { en: "Tools", hi: "उपकरण", kn: "ಉಪಕರಣಗಳು" },
  "footer.faq": { en: "FAQ", hi: "सामान्य प्रश्न", kn: "ಪದೇಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು" },
  "footer.about": { en: "About", hi: "हमारे बारे में", kn: "ನಮ್ಮ ಬಗ್ಗೆ" },
  "footer.privacy": { en: "Privacy", hi: "गोपनीयता", kn: "ಗೌಪ್ಯತೆ" },
  "footer.terms": { en: "Terms", hi: "शर्तें", kn: "ನಿಯಮಗಳು" },
  "footer.tagline": { en: "© 2026 Bhūmi · Trusted land marketplace", hi: "© 2026 Bhūmi · भरोसेमंद ज़मीन बाज़ार", kn: "© 2026 Bhūmi · ವಿಶ್ವಾಸಾರ್ಹ ಭೂ ಮಾರುಕಟ್ಟೆ" },
};

export function t(locale: Locale, key: string): string {
  const e = dict[key];
  return e ? e[locale] ?? e.en : key;
}
