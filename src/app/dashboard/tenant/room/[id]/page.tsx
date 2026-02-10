"use client"
import RoomDetailsTenant from '@/components/dashboard-tenant/rooms/RoomDetailsTenant';
import { useGetRoomId } from '@/hooks/useRoom';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';


const RoomDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const roomId = Number(params.id)
  const { data: room, isLoading, isError, error } = useGetRoomId(roomId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-5xl">⚠️</div>
          <h2 className="text-2xl font-bold">Failed to Load Room</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred while loading the room details.'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground text-5xl">🏨</div>
          <h2 className="text-2xl font-bold">Room Not Found</h2>
          <p className="text-muted-foreground">
            The room you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <RoomDetailsTenant room={room} />
    </div>
  );
}

export default RoomDetailPage;