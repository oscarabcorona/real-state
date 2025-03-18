import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="auto-pay" className="font-medium">
                Auto-pay
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow tenants to enable automatic payments
              </p>
            </div>
            <Switch id="auto-pay" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="partial-payments" className="font-medium">
                Partial Payments
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow tenants to make partial rent payments
              </p>
            </div>
            <Switch id="partial-payments" />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="late-fees" className="font-medium">
                Late Fees
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically add late fees for overdue payments
              </p>
            </div>
            <Switch id="late-fees" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="credit-card" className="font-medium">
                Credit Card
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow payments via credit card (3% processing fee)
              </p>
            </div>
            <Switch id="credit-card" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="ach-transfer" className="font-medium">
                ACH Transfer
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow payments via bank transfer (no fee)
              </p>
            </div>
            <Switch id="ach-transfer" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="cash" className="font-medium">
                Cash
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow cash payments (manual verification required)
              </p>
            </div>
            <Switch id="cash" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
