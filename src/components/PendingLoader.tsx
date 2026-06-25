import Image from "next/image";

type LoaderContext =
  | "transaction"
  | "review"
  | "property"
  | "room"
  | "maintenance"
  | "seasonalRate"
  | "booking"
  | "default";

interface PendingLoaderProps {
  context?: LoaderContext;
  message?: string;
}

const contextMessages: Record<LoaderContext, { label: string; sub: string }> = {
  transaction: {
    label: "Loading transactions...",
    sub: "Fetching your booking history",
  },
  review: {
    label: "Loading reviews...",
    sub: "Syncing your stay feedback",
  },
  property: {
    label: "Loading properties...",
    sub: "Gathering property listings",
  },
  room: {
    label: "Loading rooms...",
    sub: "Fetching available rooms",
  },
  maintenance: {
    label: "Loading maintenance...",
    sub: "Syncing maintenance records",
  },
  seasonalRate: {
    label: "Loading seasonal rates...",
    sub: "Calculating pricing periods",
  },
  booking: {
    label: "Loading bookings...",
    sub: "Retrieving reservation details",
  },
  default: {
    label: "Loading...",
    sub: "Please wait a moment",
  },
};

const PendingLoader = ({ context = "default", message }: PendingLoaderProps) => {
  const { label, sub } = contextMessages[context];

  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4 w-full border-2 border-dashed border-border/60 rounded-[3rem] bg-muted/5">
      <div className="relative h-20 w-20 animate-pulse">
        <Image
          src="/images/nuit-logo.png"
          fill
          alt="Loading..."
          className="object-contain"
          priority
        />
      </div>
      <div className="flex flex-col items-center space-y-2">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {message ?? sub}
        </p>
      </div>
    </div>
  );
};

export default PendingLoader;