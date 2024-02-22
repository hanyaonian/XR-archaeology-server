import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      //網頁載入時去下載語言檔的位置
      loadPath: "/locales/{{lng}}.json",
    },
    fallbackLng: "en",
    lng: "en",
    interpolation: {
      // not needed for react as it escapes by default
      escapeValue: false,
    },
  });

export default i18n;
