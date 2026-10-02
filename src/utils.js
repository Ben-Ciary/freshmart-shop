export const money = (n) =>
  `KSh ${Number(n).toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;

const EMOJI = {
  Dairy: "🥛",
  Bakery: "🍞",
  Fruit: "🍌",
  Grains: "🌾",
  Vegetables: "🍅",
  Drinks: "🧃",
  Snacks: "🍪",
  Meat: "🥩",
  Household: "🧴",
  Beverages: "🥤",
  Cooking: "🍳",
};

// Product name is checked first (most specific), then the category
const BY_NAME = [
  ["toilet", "🧻"],
  ["water", "💧"],
  ["juice", "🧃"],
  ["soda", "🥤"],
  ["milk", "🥛"],
  ["egg", "🥚"],
  ["bread", "🍞"],
  ["banana", "🍌"],
  ["apple", "🍎"],
  ["tomato", "🍅"],
  ["onion", "🧅"],
  ["rice", "🍚"],
  ["sugar", "🧂"],
  ["cooking oil", "🫒"],
  ["biscuit", "🍪"],
  ["crisps", "🥔"],
  ["chicken", "🍗"],
  ["beef", "🥩"],
  ["soap", "🧴"],
];

export const emojiFor = (name = "", category = "") => {
  const n = name.toLowerCase();
  const hit = BY_NAME.find(([word]) => n.includes(word));
  return hit ? hit[1] : EMOJI[category] || "🛍️";
};

export function pickupSlots() {
  const slots = [];
  const now = new Date();
  const fmt = (h) => `${String(h).padStart(2, "0")}:00`;
  for (let h = Math.max(8, now.getHours() + 2); h <= 20; h++)
    slots.push(`Today, ${fmt(h)}`);
  for (let h = 8; h <= 20; h++) slots.push(`Tomorrow, ${fmt(h)}`);
  return slots;
}
