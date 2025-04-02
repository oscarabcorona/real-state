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

  return (
    <Select value={locale} onValueChange={changeLocale} defaultValue="en-US">
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          {languages.find((lang) => lang.code === locale)?.name || "English"}
        </SelectValue>
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
