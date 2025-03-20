import { UseFormReturn } from "react-hook-form";
import { PropertyFormValues } from "../../types";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";

interface SyndicationOption {
  name: string;
  key: "zillow" | "trulia" | "realtor" | "hotpads";
  color: string;
  letter: string;
}

interface SyndicationFieldProps {
  form: UseFormReturn<PropertyFormValues>;
  option: SyndicationOption;
}

export function SyndicationField({ form, option }: SyndicationFieldProps) {
  const { name, key, color, letter } = option;

  return (
    <FormItem className="flex flex-row items-center justify-between">
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center mr-3`}
        >
          <span className={`text-${color}-600 font-bold`}>{letter}</span>
        </div>
        <FormLabel>{name}</FormLabel>
      </div>
      <FormControl>
        <Switch
          checked={form.watch(`syndication.${key}`)}
          onCheckedChange={(checked) =>
            form.setValue(`syndication.${key}`, checked)
          }
        />
      </FormControl>
    </FormItem>
  );
}
