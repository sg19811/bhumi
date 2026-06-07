// Maps a listing's district (free text) to a covered legal state, so listings
// can deep-link to the right /legal/state guide. Best-effort, case-insensitive;
// returns null when there's no confident match (caller falls back to generic links).

const DISTRICTS_BY_STATE: Record<string, string[]> = {
  karnataka: [
    "bengaluru urban", "bengaluru rural", "bangalore", "bengaluru", "mysuru", "mysore", "mandya", "hassan",
    "tumakuru", "tumkur", "hubballi", "dharwad", "belagavi", "belgaum", "ballari", "bellary", "kalaburagi",
    "gulbarga", "shivamogga", "shimoga", "chikkamagaluru", "chitradurga", "kolar", "chikkaballapur",
    "ramanagara", "udupi", "dakshina kannada", "mangaluru", "uttara kannada", "davanagere", "vijayapura",
    "bijapur", "bagalkot", "raichur", "koppal", "gadag", "haveri", "chamarajanagar", "kodagu", "bidar", "yadgir",
  ],
  maharashtra: [
    "pune", "nashik", "nasik", "mumbai", "mumbai suburban", "thane", "nagpur", "aurangabad", "chhatrapati sambhajinagar",
    "satara", "kolhapur", "ahmednagar", "ahilyanagar", "solapur", "sangli", "amravati", "latur", "nanded",
    "jalgaon", "raigad", "ratnagiri", "sindhudurg", "beed", "dhule", "akola", "chandrapur", "palghar",
  ],
  tamil_nadu: [
    "chennai", "coimbatore", "madurai", "tiruchirappalli", "trichy", "salem", "tirunelveli", "erode", "vellore",
    "thanjavur", "kancheepuram", "kanchipuram", "tiruppur", "dindigul", "cuddalore", "nagapattinam", "thoothukudi",
    "krishnagiri", "namakkal", "villupuram", "karur", "sivaganga", "virudhunagar",
  ],
  andhra_pradesh: [
    "visakhapatnam", "vizag", "vijayawada", "guntur", "krishna", "ntr", "nellore", "kurnool", "anantapur", "ananthapuramu",
    "kadapa", "ysr kadapa", "chittoor", "tirupati", "east godavari", "west godavari", "prakasam", "srikakulam",
    "vizianagaram", "eluru", "bapatla", "palnadu", "nandyal",
  ],
  kerala: [
    "thiruvananthapuram", "trivandrum", "kollam", "pathanamthitta", "alappuzha", "alleppey", "kottayam", "idukki",
    "ernakulam", "kochi", "cochin", "thrissur", "palakkad", "malappuram", "kozhikode", "calicut", "wayanad",
    "kannur", "kasaragod",
  ],
};

const LOOKUP: Record<string, string> = {};
for (const [state, districts] of Object.entries(DISTRICTS_BY_STATE)) {
  for (const d of districts) LOOKUP[d] = state;
}

export function districtToState(district?: string | null): string | null {
  if (!district) return null;
  return LOOKUP[district.trim().toLowerCase()] ?? null;
}
