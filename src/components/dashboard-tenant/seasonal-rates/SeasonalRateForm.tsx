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

interface SeasonalRateFormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel: string;
  onCancel: () => void;
  properties?: PropertyOption[];

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
}: SeasonalRateFormProps<TFieldValues>) {
  const startDate = form.watch(fields.startDate) as Date | undefined;
  const endDate = form.watch(fields.endDate) as Date | undefined;
  const dateRange: DateRange | undefined =
    startDate && endDate
      ? { from: startDate, to: endDate }
      : startDate
      ? { from: startDate, to: undefined }
      : undefined;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {properties.length > 0 && fields.propertyId && (
        <FormField
            control={form.control}
            name={fields.propertyId}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select
                  onValueChange={(value) => {
                    // Set propertyId and clear roomId
                    field.onChange(Number(value));
                    if (fields.roomId) {
                      form.setValue(fields.roomId, null as never);
                    }
                  }}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem
                        key={property.id}
                        value={property.id.toString()}
                      >
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
                  onFocus={(e) => {
                    if (e.target.value === "0") {
                      e.target.value = "";
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          <Button
            type="submit"
            disabled={isSubmitting}
            className="relative flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <span>{isSubmitting ? "Processing..." : submitLabel}</span>
          </Button>
        </div>
      </form>
    </Form>
  );
}
