import { useLocale } from "@/hooks/useLocale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: "en-US", name: "English" },
  { code: "es", name: "Español" },
];

export const LanguageSelector = () => {
  const { locale, changeLocale } = useLocale();

  // Log current locale to debug
  console.log("Current locale:", locale);

  // Find the current language display name
  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (value: string) => {
    console.log("Changing language to:", value);
    changeLocale(value);
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue>{currentLanguage.name}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
