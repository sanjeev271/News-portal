import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      home: "Home",
      trending: "Trending",
      liveTV: "Live TV",
      bookmarks: "Bookmarks",
      search: "Search news...",
      searchNav: "Search",
      login: "Login",
      register: "Sign Up",
      logout: "Logout",
      publish: "Publish",
      dashboard: "Dashboard",
      latestNews: "Latest News",
      breaking: "Breaking",
      trendingNews: "Trending News",
      readMore: "Read More",
      comments: "Comments",
      live: "Live",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      language: "Language",
      noResults: "No results found",
      bookmarked: "Bookmarked",
      addBookmark: "Save",
      adminPanel: "Admin Panel",
      articles: "Articles",
      categories: "Categories",
      users: "Users",
      ads: "Advertisements",
      seo: "SEO Settings",
      reporters: "Reporters",
      liveBroadcast: "Live Broadcast",
      videoNews: "Video News",
      photoGallery: "Photo Gallery"
    }
  },
  hi: {
    translation: {
      home: "होम",
      trending: "ट्रेंडिंग",
      liveTV: "लाइव टीवी",
      bookmarks: "बुकमार्क",
      search: "समाचार खोजें...",
      searchNav: "खोज",
      login: "लॉगिन",
      register: "साइन अप",
      logout: "लॉगआउट",
      publish: "प्रकाशित करें",
      dashboard: "डैशबोर्ड",
      latestNews: "ताज़ा समाचार",
      breaking: "ब्रेकिंग",
      trendingNews: "ट्रेंडिंग समाचार",
      readMore: "और पढ़ें",
      comments: "टिप्पणियाँ",
      live: "लाइव",
      darkMode: "डार्क मोड",
      lightMode: "लाइट मोड",
      language: "भाषा",
      noResults: "कोई परिणाम नहीं",
      bookmarked: "सहेजा गया",
      addBookmark: "सहेजें",
      adminPanel: "एडमिन पैनल",
      articles: "लेख",
      categories: "श्रेणियाँ",
      users: "उपयोगकर्ता",
      ads: "विज्ञापन",
      seo: "SEO सेटिंग्स",
      reporters: "रिपोर्टर",
      liveBroadcast: "लाइव प्रसारण",
      videoNews: "वीडियो समाचार",
      photoGallery: "फोटो गैलरी"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
