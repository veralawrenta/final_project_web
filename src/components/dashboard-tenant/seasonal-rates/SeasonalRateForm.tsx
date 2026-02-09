"use client";

import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { DateRange } from "react-day-picker";

interface PropertyOption {
  id: number;
  name: string;
}

interface RoomOption {
  id: number;
  name: string;
  propertyId: number;
  propertyName: string;
}

interface SeasonalRateFormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel: string;
  onCancel: () => void;
  /** List of properties available */
  properties?: PropertyOption[];
  /** List of rooms available (with property info) */
  rooms?: RoomOption[];

  fields: {
    name: Path<TFieldValues>;
    startDate: Path<TFieldValues>;
    endDate: Path<TFieldValues>;
    fixedPrice: Path<TFieldValues>;
    roomId?: Path<TFieldValues>;
    propertyId?: Path<TFieldValues>;
  };
}

export function SeasonalRateForm<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
  fields,
  properties = [],
  rooms = [],
}: SeasonalRateFormProps<TFieldValues>) {
  const startDate = form.watch(fields.startDate) as Date | undefined;
  const endDate = form.watch(fields.endDate) as Date | undefined;
  const dateRange: DateRange | undefined =
    startDate && endDate
      ? { from: startDate, to: endDate }
      : startDate
        ? { from: startDate, to: undefined }
        : undefined;

  // Group rooms by property for better organization
  const roomsByProperty = rooms.reduce((acc, room) => {
    if (!acc[room.propertyName]) {
      acc[room.propertyName] = [];
    }
    acc[room.propertyName].push(room);
    return acc;
  }, {} as Record<string, RoomOption[]>);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Property or Room Selector */}
        {(properties.length > 0 || rooms.length > 0) && (
          <FormField
            control={form.control}
            name={fields.propertyId || fields.roomId!}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apply to</FormLabel>
                <Select
                  onValueChange={(value) => {
                    // Parse the value: "property-{id}" or "room-{id}"
                    const [type, id] = value.split("-");
                    
                    if (type === "property") {
                      // Clear roomId and set propertyId
                      if (fields.roomId) {
                        form.setValue(fields.roomId, null as never);
                      }
                      if (fields.propertyId) {
                        form.setValue(fields.propertyId, Number(id) as never);
                      }
                    } else if (type === "room") {
                      // Clear propertyId and set roomId
                      if (fields.propertyId) {
                        form.setValue(fields.propertyId, null as never);
                      }
                      if (fields.roomId) {
                        form.setValue(fields.roomId, Number(id) as never);
                      }
                    }
                  }}
                  value={
                    form.watch(fields.propertyId as Path<TFieldValues>)
                      ? `property-${form.watch(fields.propertyId as Path<TFieldValues>)}`
                      : form.watch(fields.roomId as Path<TFieldValues>)
                        ? `room-${form.watch(fields.roomId as Path<TFieldValues>)}`
                        : ""
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property or specific room" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Property options - applies to all rooms */}
                    {properties.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Entire Property (All Rooms)
                        </div>
                        {properties.map((property) => (
                          <SelectItem
                            key={`property-${property.id}`}
                            value={`property-${property.id}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{property.name}</span>
                              <span className="text-xs text-muted-foreground">
                                (All rooms)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}

                    {/* Room options - grouped by property */}
                    {rooms.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2 border-t">
                          Individual Rooms
                        </div>
                        {Object.entries(roomsByProperty).map(([propertyName, propertyRooms]) => (
                          <div key={propertyName}>
                            <div className="px-2 py-1 text-xs text-muted-foreground italic">
                              {propertyName}
                            </div>
                            {propertyRooms.map((room) => (
                              <SelectItem
                                key={`room-${room.id}`}
                                value={`room-${room.id}`}
                                className="pl-6"
                              >
                                {room.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select an entire property to apply rates to all rooms, or choose a specific room
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Name */}
        <FormField
          control={form.control}
          name={fields.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Holiday Peak" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={fields.fixedPrice}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per night</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date range: one picker for both start and end */}
        <FormField
          control={form.control}
          name={fields.startDate}
          render={({ field: startField }) => (
            <FormItem>
              <FormLabel>Date range</FormLabel>
              <FormControl>
                <DateRangePicker
                  value={dateRange}
                  onSelect={(range) => {
                    if (range?.from) startField.onChange(range.from);
                    if (fields.endDate && range?.to) {
                      form.setValue(fields.endDate, range.to as never);
                    }
                  }}
                  placeholder="Pick start and end date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}