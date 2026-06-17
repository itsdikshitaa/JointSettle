#!/usr/bin/env python3
"""Update participant name placeholders in all locale files with culturally appropriate names."""

import json
import os
import glob

# Culturally appropriate participant names for each locale
# 5 names per locale: balanced between masculine, feminine, and diverse
LOCALE_NAMES = {
    "en-US":    ["Alex",       "Jordan",    "Taylor",    "Morgan",    "Riley"],
    "id":       ["Budi",       "Sari",      "Adi",       "Dewi",      "Rudi"],
    "cs-CZ":    ["Jakub",      "Eliška",    "Tomáš",     "Anna",      "Adam"],
    "pt-BR":    ["João",       "Maria",     "Pedro",     "Ana",       "Lucas"],
    "uk-UA":    ["Олександр",  "Марія",     "Дмитро",    "Олена",     "Андрій"],
    "ru-RU":    ["Александр",  "Анна",      "Дмитрий",   "Елена",     "Максим"],
    "zh-TW":    ["小明",       "小華",      "大偉",      "美玲",      "志明"],
    "zh-CN":    ["小明",       "小红",      "小刚",      "丽华",      "伟强"],
    "es":       ["Alejandro",  "Sofía",     "Carlos",    "Lucía",     "Miguel"],
    "eu":       ["Jon",        "Ane",       "Mikel",     "Maite",     "Iker"],
    "pt":       ["João",       "Maria",     "Tiago",     "Inês",      "Rafael"],
    "de-DE":    ["Max",        "Laura",     "Felix",     "Mia",       "Noah"],
    "he":       ["יוסף",       "רחל",       "דוד",       "שרה",       "משה"],
    "ro":       ["Andrei",     "Maria",     "Alexandru", "Elena",     "Ștefan"],
    "ko":       ["민수",       "지은",      "영호",      "수진",      "준호"],
    "fr-FR":    ["Lucas",      "Emma",      "Léo",       "Chloé",     "Gabriel"],
    "fi":       ["Eino",       "Aino",      "Väinö",     "Helmi",     "Onni"],
    "tr-TR":    ["Mehmet",     "Ayşe",      "Ali",       "Fatma",     "Ahmet"],
    "ca":       ["Pau",        "Laia",      "Marc",      "Júlia",     "Pol"],
    "nl-NL":    ["Sem",        "Lotte",     "Daan",      "Sophie",    "Lukas"],
    "it-IT":    ["Leonardo",   "Sofia",     "Francesco", "Giulia",    "Alessandro"],
    "pl-PL":    ["Jakub",      "Zuzanna",   "Antoni",    "Maja",      "Jan"],
    "ja-JP":    ["太郎",       "花子",      "次郎",      "美咲",      "健一"],
}

MESSAGES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "messages")


def update_locale_file(filepath: str, names: list[str]) -> bool:
    """Update participant name placeholders in a locale file. Returns True if changed."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    participants = data.get("GroupForm", {}).get("Participants", {})
    if not participants:
        print(f"  ⚠️  No GroupForm.Participants section found in {filepath}")
        return False

    # Remove old keys if they exist
    participants.pop("John", None)
    participants.pop("Jane", None)
    participants.pop("Jack", None)

    # Set consistent name1-name5 keys
    participants["name1"] = names[0]
    participants["name2"] = names[1]
    participants["name3"] = names[2]
    participants["name4"] = names[3]
    participants["name5"] = names[4]

    # Write back with pretty formatting, matching existing style
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"  ✅ Set: {names[0]}, {names[1]}, {names[2]}, {names[3]}, {names[4]}")
    return True


def main():
    print("Updating participant name placeholders for all locales...\n")
    updated = 0
    skipped = 0

    for filepath in sorted(glob.glob(os.path.join(MESSAGES_DIR, "*.json"))):
        locale = os.path.splitext(os.path.basename(filepath))[0]
        names = LOCALE_NAMES.get(locale)

        if names is None:
            print(f"  ⏭️  Skipping {locale} (no name mapping defined)")
            skipped += 1
            continue

        print(f"📁 {locale}:")
        if update_locale_file(filepath, names):
            updated += 1
        else:
            skipped += 1

    print(f"\n✅ Done! {updated} locales updated, {skipped} skipped.")


if __name__ == "__main__":
    main()
