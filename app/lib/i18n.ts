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
};

export function t(locale: Locale, key: string): string {
  const e = dict[key];
  return e ? e[locale] ?? e.en : key;
}
