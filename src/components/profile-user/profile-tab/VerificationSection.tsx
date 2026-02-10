import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useResendVerification } from "@/hooks/useProfile";
import { CheckCircle, XCircle } from "lucide-react";

interface VerificationSectionProps {
  isVerified: boolean;
}

export const VerificationSection: React.FC<VerificationSectionProps> = ({
  isVerified,
}) => {
  const { mutate: resendVerification, isPending } = useResendVerification();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>
              Complete your profile verification
            </CardDescription>
          </div>
          <Badge variant={isVerified ? "default" : "secondary"}>
            {" "}
            {isVerified ? "Verified" : "Unverified"}{" "}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!isVerified ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Your email hasn't been verified yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => resendVerification()}
              disabled={isPending}
            >
              {isPending ? "Sending..." : "Verify Now"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-green-600">Your account is verified</p>
        )}
      </CardContent>
    </Card>
  );
};
