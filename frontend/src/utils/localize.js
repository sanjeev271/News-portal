import i18n from "../i18n";

const CATEGORY_KEYS = {
  world: "category_world",
  business: "category_business",
  technology: "category_technology",
  sports: "category_sports",
  culture: "category_culture",
  opinion: "category_opinion",
  science: "category_science",
  politics: "category_politics",
};

export function localizedCategoryName(category) {
  if (!category) return "";
  if (i18n.language === "ne") {
    if (category.nameNe) return category.nameNe;
    const key = CATEGORY_KEYS[category.slug];
    if (key) {
      const translated = i18n.t(key);
      if (translated !== key) return translated;
    }
  }
  return category.name || "";
}

export function currentLocale() {
  return i18n.language === "ne" ? "ne" : "en";
}

export function matchesLocale(itemLocale) {
  if (!itemLocale) return true;
  return itemLocale === currentLocale();
}

/** Keep first occurrence of each Mongo _id in a list (avoids duplicate React keys). */
export function dedupeById(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const id = item?._id;
    if (!id) return true;
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
