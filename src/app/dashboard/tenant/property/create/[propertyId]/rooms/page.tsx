import CreatePropertyStep2Page from "@/components/dashboard-tenant/property/property-forms/CreatePropertyPage-Client";

export default async function CreateRoomsPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const propertyIdNum = parseInt(propertyId);

  if (isNaN(propertyIdNum)) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Error:</strong> Invalid property ID. Please create a
            property first.
          </p>
        </div>
      </div>
    );
  }

  return <CreatePropertyStep2Page propertyId={propertyIdNum} />;
}
