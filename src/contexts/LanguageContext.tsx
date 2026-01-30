import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SupportedLanguage, getTranslation, languageNames } from "@/lib/i18n";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  languageNames: typeof languageNames;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem("saarthi_language");
    return (saved as SupportedLanguage) || "en";
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("saarthi_language", lang);
  };

  const t = (key: string) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
