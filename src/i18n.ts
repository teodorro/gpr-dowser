import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next) // wires i18next into React
  .init({
    lng: "en", // default language
    fallbackLng: "en", // if a key is missing in current lang, fall back here
    resources: {
      en: {
        translation: {
          file_1: "File 1",
          file_2: "File 2",
          file_3: "File 3 very long filename",
          file_4: "File 4 very long filename",
          file_5: "File 5",
          English: "English",
          Russian: "Russian",
        },
      },
      ru: {
        translation: {
          file_1: "Файл 1",
          file_2: "Файл 2",
          file_3: "Файл 3 очень длинное имя",
          file_4: "Файл 4 очень длинное имя",
          file_5: "Файл 5",
          English: "Английский",
          Russian: "Русский",
        },
      },
    },
  });

export default i18n;
