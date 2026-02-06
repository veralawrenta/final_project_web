import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { RiArrowGoBackLine } from "react-icons/ri";

export const ProfileHeader = () => {
  const router = useRouter()
  return (
    <div className="flex items-start justify-between gap-4">
      {/* Left side */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      {/* Right side */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/")}
        className="shrink-0 font-semibold hover:bg-primary hover:text-primary-foreground"
      >
        <RiArrowGoBackLine className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
    </div>
  );
};