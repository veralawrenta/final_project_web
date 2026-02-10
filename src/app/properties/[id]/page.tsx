import PropertyDetail from '@/components/property/PropertyDetail'
import { Suspense } from 'react'

const PropertyIdPage = () => {
  return (
    <Suspense fallback={<div />}>
        <PropertyDetail />
    </Suspense>
  )
}

export default PropertyIdPage