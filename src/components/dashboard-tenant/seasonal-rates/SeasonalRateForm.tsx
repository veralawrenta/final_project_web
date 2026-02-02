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

interface RoomOption {
  id: number;
  name: string;
}

interface SeasonalRateFormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel: string;
  onCancel: () => void;
  /** When provided, shows a room selector (for create flow). */
  rooms?: RoomOption[];

  fields: {
    name: Path<TFieldValues>;
    startDate: Path<TFieldValues>;
    endDate: Path<TFieldValues>;
    fixedPrice: Path<TFieldValues>;
    roomId?: Path<TFieldValues>;
  };
}

export function SeasonalRateForm<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
  fields,
  rooms,
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
        {fields.roomId && rooms && rooms.length > 0 && (
          <FormField
            control={form.control}
            name={fields.roomId}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value != null ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={String(room.id)}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
