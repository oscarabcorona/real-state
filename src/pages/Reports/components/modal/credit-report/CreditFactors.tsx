import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface CreditFactorsProps {
  factors: string[];
}

export function CreditFactors({ factors }: CreditFactorsProps) {
  return (
    <div className="mt-4 border-t pt-3">
      <h4 className="text-sm font-medium mb-2 flex items-center">
        Key Factors
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3 text-muted-foreground ml-1.5" />
            </TooltipTrigger>
            <TooltipContent>
              These factors influence your credit score
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h4>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {factors.map((factor) => (
          <div key={factor} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs">{factor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
