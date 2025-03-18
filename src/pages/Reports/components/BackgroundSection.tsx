import { AlertCircle, CheckCircle, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Fix the import path to use the absolute path
import type { ReportBackgroundAnalysis } from "@/pages/Reports/types";

interface BackgroundSectionProps {
  backgroundAnalysis: ReportBackgroundAnalysis;
}

export function BackgroundSection({
  backgroundAnalysis,
}: BackgroundSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-muted-foreground mr-2" />
          <CardTitle className="text-lg">Background Check</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Criminal Records</div>
          <div className="inline-flex items-center">
            {backgroundAnalysis.criminal_records ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <span className="ml-2">
              {backgroundAnalysis.criminal_records ? "Found" : "None Found"}
            </span>
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Eviction History</div>
          <div className="inline-flex items-center">
            {backgroundAnalysis.eviction_history ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <span className="ml-2">
              {backgroundAnalysis.eviction_history ? "Found" : "None Found"}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Recommendations</div>
          <ul className="space-y-2">
            {backgroundAnalysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2" />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
