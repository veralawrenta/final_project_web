'use client'

import PropertyDetails from '@/components/dashboard-tenant/property/id/PropertyIdDetails'
import PropertyGallery from '@/components/dashboard-tenant/property/id/PropertyIdGallery'
import RoomCard from '@/components/dashboard-tenant/property/id/PropertyIdRoomCard'
import { useGetTenantPropertyId } from '@/hooks/useProperty'
import { useParams } from 'next/navigation'

export default function PropertyPage() {
  const params = useParams()
  const propertyId = parseInt(params.id as string)
  
  const { data: property, isLoading, error } = useGetTenantPropertyId(propertyId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center">
          <p className="text-muted-foreground">Loading property...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center">
          <p className="text-destructive">Property not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4">
        <section className="mb-12">
          <PropertyGallery images={property.images} propertyName={property.name} />
        </section>

        {/* Property Details Section */}
        <section className="mb-12">
          <PropertyDetails property={property} />
        </section>

        {/* Rooms Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
          <div className="space-y-4">
            {property.rooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No rooms available</p>
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