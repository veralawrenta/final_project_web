"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGetTenantProperties } from "@/hooks/useProperty";
import { useGetTenantRooms } from "@/hooks/useRoom";
import { useCreateRoomNonAvailability } from "@/hooks/useRoomNonAvailability";
import {
  createMaintenanceBlockSchema,
  CreateMaintenanceBlockValues,
} from "@/lib/validator/dashboard.maintenance.schema";
import { formatLocalDate } from "@/lib/date/date";
import { Property } from "@/types/property";

const CreateMaintenanceBlockForm = () => {
  const router = useRouter();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  const { data: tenantProperties } = useGetTenantProperties();
  const properties: Property[] = tenantProperties?.data || [];

  const { data: tenantRooms } = useGetTenantRooms();
  const allRooms = tenantRooms?.data || [];

  const createBlock = useCreateRoomNonAvailability();

  const form = useForm<CreateMaintenanceBlockValues>({
    resolver: zodResolver(createMaintenanceBlockSchema),
    defaultValues: {
      roomId: "",
      startDate: undefined as unknown as Date,
      endDate: undefined as unknown as Date,
      reason: "",
      roomInventory: 1,
    },
  });
  const filteredRooms = selectedPropertyId
    ? allRooms.filter((room) => room.propertyId === Number(selectedPropertyId))
    : [];

  const watchedRoomId = form.watch("roomId");
  const selectedRoom = allRooms.find((r) => r.id === Number(watchedRoomId));

  const handleCancel = () => {
    router.push("/dashboard/tenant/maintenance");
  };

  const onSubmit = async (values: CreateMaintenanceBlockValues) => {
    try {
      await createBlock.mutateAsync({
        roomId: Number(values.roomId),
        body: {
          startDate: formatLocalDate(values.startDate),
          endDate: formatLocalDate(values.endDate),
          reason: values.reason,
          roomInventory: values.roomInventory,
        },
      });
      handleCancel();
    } catch (error) {
      console.error("Failed to create maintenance block:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          disabled={createBlock.isPending}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Schedule Maintenance
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details to block room availability for maintenance
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select
                  onValueChange={(value) => {
                    setSelectedPropertyId(value);
                    form.setValue("roomId", "");
                  }}
                  value={selectedPropertyId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
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
              </FormItem>

              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedPropertyId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="roomInventory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Units to Block
                    {selectedRoom && (
                      <span className="text-muted-foreground font-normal ml-1">
                        (max {selectedRoom.totalUnits})
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={selectedRoom?.totalUnits}
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason / Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what needs to be fixed or maintained..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createBlock.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createBlock.isPending}>
                {createBlock.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Maintenance"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
export default CreateMaintenanceBlockForm;
