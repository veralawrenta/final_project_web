// components/property/PropertyDetails.tsx
'use client'

import { MapPin, Home, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { TenantPropertyId } from '@/types/property'

interface PropertyDetailsProps {
  property: TenantPropertyId
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const isPublished = property.status === 'PUBLISHED'
  const hasMaintenance = property.hasMaintenance
  const hasSeasonalRates = property.hasSeasonalRate
  const hasImages = property.hasPropertyImages
  const hasPublishableRoom = property.hasPublishableRoom

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold">{property.name}</h1>
        
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{property.address}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Home className="w-4 h-4" />
              <span>{property.city}</span>
            </div>
          </div>


          <div className="flex gap-2 flex-col sm:flex-row flex-wrap justify-end">
            <Badge
              variant={isPublished ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {isPublished ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Published
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Draft
                </>
              )}
            </Badge>
            
            {hasMaintenance && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Maintenance
              </Badge>
            )}
            
            {hasSeasonalRates && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Seasonal Rates
              </Badge>
            )}
          </div>
        </div>


        <p className="text-lg text-muted-foreground leading-relaxed">
          {property.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Property Type</h3>
          <p className="text-2xl font-bold capitalize text-primary">
            {property.propertyType}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Category</h3>
          <p className="text-2xl font-bold capitalize">
            {property.category || 'Not specified'}
          </p>
        </Card>


        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold mb-3">Address</h3>
          <p className="text-sm text-muted-foreground">{property.address}</p>
        </Card>
      </div>

      <Card className="p-6 bg-muted/50 border border-border">
        <h3 className="font-semibold mb-4">Property Status Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div>
            <p className="text-xs text-muted-foreground mb-1">Property Images</p>
            <p className="font-semibold">
              {hasImages ? '✓ Available' : '✗ Missing'}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Published Room</p>
            <p className="font-semibold">
              {hasPublishableRoom ? '✓ Available' : '✗ Missing'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Maintenance</p>
            <p className="font-semibold">
              {hasMaintenance ? '✓ Active' : '✗ None'}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Seasonal Rates</p>
            <p className="font-semibold">
              {hasSeasonalRates ? '✓ Active' : '✗ None'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}