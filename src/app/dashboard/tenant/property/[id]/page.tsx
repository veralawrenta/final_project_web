'use client'
import PropertyDetails from '@/components/dashboard-tenant/property/id/PropertyIdDetails'
import PropertyGallery from '@/components/dashboard-tenant/property/id/PropertyIdGallery'
import RoomCard from '@/components/dashboard-tenant/property/id/PropertyIdRoomCard'
import { useGetTenantPropertyId } from '@/hooks/useProperty'
import { useParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function PropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = Number(params.id);

  const { data: property, isLoading, error } = useGetTenantPropertyId(propertyId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading property...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Property not found</h2>
            <p className="text-muted-foreground mb-4">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/dashboard/tenant/property')}>
              Back to Properties
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        <section>
          <PropertyGallery 
            images={property.images || []} 
            propertyName={property.name} 
          />
        </section>
        <section>
          <PropertyDetails property={property} />
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
          <div className="space-y-4">
            {!property.rooms || property.rooms.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground text-lg mb-2">No rooms available</p>
                <p className="text-sm text-muted-foreground">
                  Add rooms to this property to make it bookable.
                </p>
              </div>
            ) : (
              property.rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}