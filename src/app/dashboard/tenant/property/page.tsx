"use client"
import PropertyManagementTab from '@/components/dashboard-tenant/PropertyManagementTab';
import { useRouter } from 'next/navigation';

const PropertyManagementPage = () => {
  const router = useRouter();

  const handleAddProperty = () => {
    router.push('/dashboard/tenant/property/create');
  };

  const handleEditProperty = (propertyId: number) => {
    router.push(`/dashboard/tenant/property/update/${propertyId}`);
  };

  const handleViewProperty = (propertyId: number) => {
    router.push(`/dashboard/tenant/property/${propertyId}`);
  };

  return (
    <PropertyManagementTab
      onAddProperty={handleAddProperty}
      onEditProperty={handleEditProperty}
      onViewProperty={handleViewProperty}
    />
  );
};

export default PropertyManagementPage;