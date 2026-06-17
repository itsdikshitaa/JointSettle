/**
 * Country/region-specific participant names, keyed by ISO-4217 currency code.
 *
 * When a user selects a currency in the group form, the participant input
 * placeholders change to names culturally associated with that currency's
 * primary country/region — reactively, without a page reload.
 *
 * Each entry has 5 common, recognizable names from that region,
 * balanced across masculine, feminine, and diverse names.
 */

export const CURRENCY_NAMES: Record<string, [string, string, string, string, string]> = {
  // ── Americas ──────────────────────────────────────────────────────────────
  USD: ["Alex", "Jordan", "Taylor", "Morgan", "Riley"],
  CAD: ["Liam", "Emma", "Noah", "Olivia", "William"],
  BRL: ["João", "Maria", "Pedro", "Ana", "Lucas"],
  MXN: ["Alejandro", "Sofía", "Carlos", "Lucía", "Miguel"],
  ARS: ["Mateo", "Valentina", "Benicio", "Cami", "Lautaro"],
  COP: ["Santiago", "Valeria", "Julián", "Mariana", "Mateo"],
  CLP: ["Benjamín", "Isidora", "Emilio", "Florencia", "Alonso"],

  // ── Europe ────────────────────────────────────────────────────────────────
  EUR: ["Lukas", "Emma", "Liam", "Sofia", "Noah"],
  GBP: ["Oliver", "Amelia", "James", "Charlotte", "George"],
  CHF: ["Lukas", "Emma", "Noah", "Mia", "Elias"],
  SEK: ["Erik", "Anna", "Lars", "Emma", "Karl"],
  NOK: ["Olav", "Ingrid", "Lars", "Emma", "Erik"],
  DKK: ["Mikkel", "Freja", "Lukas", "Emma", "Noah"],
  ISK: ["Jón", "Guðrún", "Sigurður", "Anna", "Ólafur"],
  PLN: ["Jakub", "Zuzanna", "Antoni", "Maja", "Jan"],
  CZK: ["Jakub", "Eliška", "Tomáš", "Anna", "Adam"],
  HUF: ["István", "Anna", "Gábor", "Katalin", "Péter"],
  RON: ["Andrei", "Maria", "Alexandru", "Elena", "Ștefan"],
  BGN: ["Georgi", "Maria", "Ivan", "Elena", "Dimitar"],
  TRY: ["Mehmet", "Ayşe", "Ali", "Fatma", "Ahmet"],

  // ── Asia-Pacific ──────────────────────────────────────────────────────────
  JPY: ["太郎", "花子", "次郎", "美咲", "健一"],
  CNY: ["小明", "小红", "小刚", "丽华", "伟强"],
  KRW: ["민수", "지은", "영호", "수진", "준호"],
  INR: ["Aarav", "Priya", "Arjun", "Neha", "Vikram"],
  IDR: ["Budi", "Sari", "Adi", "Dewi", "Rudi"],
  PHP: ["Juan", "Maria", "Jose", "Ana", "Miguel"],
  SGD: ["Wei Ming", "Siti", "Raj", "Mei Ling", "Ahmad"],
  HKD: ["Wing", "Ka Yan", "Ming", "Sze", "Chi Ho"],
  THB: ["Somsak", "Malee", "Somchai", "Suda", "Boonmee"],
  NZD: ["Oliver", "Charlotte", "Jack", "Lily", "George"],
  AUD: ["Jack", "Olivia", "Thomas", "Emily", "James"],

  // ── Middle East / Africa ──────────────────────────────────────────────────
  ILS: ["יוסף", "רחל", "דוד", "שרה", "משה"],
  ZAR: ["Thando", "Naledi", "Sipho", "Zanele", "Kagiso"],
}

/**
 * Get 5 culturally appropriate participant names for the given currency code.
 * Falls back to neutral/international names for unknown currencies.
 */
export function getNamesForCurrency(currencyCode: string | undefined | null): [string, string, string, string, string] {
  if (!currencyCode) return ["Alex", "Jordan", "Taylor", "Morgan", "Riley"]
  return CURRENCY_NAMES[currencyCode] ?? ["Alex", "Jordan", "Taylor", "Morgan", "Riley"]
}
