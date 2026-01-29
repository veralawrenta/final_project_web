import { useCreateProperty } from "@/hooks/useProperty";
import { createPropertySchema } from "@/lib/validator/dashboard.create-property.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import MapComponent from "./MapComponent";


const CreateProperty = () => {

  const { mutateAsync: createProperty, isPending } = useCreateProperty();

  const form = useForm<z.infer<typeof createPropertySchema>>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: undefined,
      cityId: undefined,
      address: "",
      latitude: undefined,
      longitude: undefined,
      propertyType: undefined,
      amenities: [],
      propertyImages: [],
    },
  });

  async function onSubmit(values: z.infer<typeof createPropertySchema>) {
    const property = await createProperty({
    name: values.name,
    description: values.description,
    categoryId: values.categoryId,
    cityId: values.cityId,
    address: values.address,
    latitude: values.latitude,
    longitude: values.longitude,
    propertyType: values.propertyType,
    });
    const propertyId = property.id;
    console.log("Created property with ID:", propertyId);

    if (values.propertyImages?.length) {
      const formData = new F
    }
  };

  return (
    <div>
      
      <MapComponent
        latitude={form.watch("latitude")}
        longitude={form.watch("longitude")}
        onLocationSelect={(lat, lng, address) => {
          form.setValue("latitude", lat);
          form.setValue("longitude", lng);
          if (address) {
            form.setValue("address", address);
          }
        }}
        height="500px"
        className="mt-4"
      />
    </div>
  );
};

export default CreateProperty;
