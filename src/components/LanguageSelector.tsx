import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupportedLanguage } from "@/lib/i18n";

const LanguageSelector = () => {
  const { language, setLanguage, languageNames, t } = useLanguage();

  const languages = Object.entries(languageNames) as [SupportedLanguage, string][];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{languageNames[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
          {t("general.selectLanguage")}
        </div>
        {languages.map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code)}
            className="flex items-center justify-between"
          >
            <span>{name}</span>
            {language === code && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
