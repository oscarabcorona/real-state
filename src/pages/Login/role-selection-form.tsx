import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RoleSelectionFormProps {
  error: string;
  isLoading: boolean;
  onSubmit: (selectedRole: string, workspaceName: string) => Promise<void>;
}

export function RoleSelectionForm({
  error,
  isLoading,
  onSubmit,
}: RoleSelectionFormProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [workspaceName, setWorkspaceName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedRole, workspaceName);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold">Complete Your Account</h1>
        <p className="text-sm text-muted-foreground">
          Select your role to continue
        </p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="animate-in fade-in-50 duration-300"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-3">
          <RadioGroup
            value={selectedRole}
            onValueChange={setSelectedRole}
            className="gap-3"
          >
            <div className="flex items-start space-x-2 rounded-md border p-3 hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="tenant" id="tenant" />
              <div className="flex flex-col gap-1">
                <Label htmlFor="tenant" className="font-medium cursor-pointer">
                  I am a Tenant
                </Label>
                <p className="text-sm text-muted-foreground">
                  Looking to rent a property
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 rounded-md border p-3 hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="lessor" id="lessor" />
              <div className="flex flex-col gap-1 w-full">
                <Label htmlFor="lessor" className="font-medium cursor-pointer">
                  I am a Property Owner
                </Label>
                <p className="text-sm text-muted-foreground">
                  I want to manage my properties
                </p>

                {selectedRole === "lessor" && (
                  <div className="mt-3">
                    <Label
                      htmlFor="workspace-name"
                      className="text-sm font-medium"
                    >
                      Workspace Name
                    </Label>
                    <Input
                      id="workspace-name"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="My Properties"
                      className="mt-1.5 h-10"
                    />
                  </div>
                )}
              </div>
            </div>
          </RadioGroup>
        </div>

        <Button
          type="submit"
          className="w-full h-10"
          disabled={
            isLoading ||
            !selectedRole ||
            (selectedRole === "lessor" && !workspaceName.trim())
          }
        >
          {isLoading ? "Processing..." : "Complete Setup"}
        </Button>
      </form>
    </div>
  );
}
