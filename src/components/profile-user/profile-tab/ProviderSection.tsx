import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProviderSectionProps {
  provider?: "GOOGLE" | "CREDENTIAL";
}

export const ProviderSection: React.FC<ProviderSectionProps> = ({ provider }) => {
  const isGoogle = provider === "GOOGLE";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Provider</CardTitle>
        <CardDescription>Shows which provider you used to sign up</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          {isGoogle ? (
            <>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">G</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Google</p>
                <p className="text-sm text-muted-foreground">
                  Your account is managed by Google
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-slate-700">B</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Credentials</p>
                <p className="text-sm text-muted-foreground">
                  Your account uses email and password
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};