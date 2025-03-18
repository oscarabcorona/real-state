import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const SettingsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="auto-pay">Auto-pay</Label>
              <p className="text-sm text-muted-foreground">
                Allow tenants to enable automatic payments
              </p>
            </div>
            <Switch id="auto-pay" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="partial-payments">Partial Payments</Label>
              <p className="text-sm text-muted-foreground">
                Allow tenants to make partial rent payments
              </p>
            </div>
            <Switch id="partial-payments" />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="late-fees">Late Fees</Label>
              <p className="text-sm text-muted-foreground">
                Automatically add late fees for overdue payments
              </p>
            </div>
            <Switch id="late-fees" defaultChecked />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
