"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetTenantProperties } from "@/hooks/useProperty";
import { useGetTenantRooms } from "@/hooks/useRoom";
import {
  useGetRoomNonAvailability,
  useUpdateRoomNonAvailability,
} from "@/hooks/useRoomNonAvailability";
import { formatLocalDate, parseISODate } from "@/lib/date/date";
import { cn } from "@/lib/utils";
import {
  updateMaintenanceBlockSchema,
  UpdateMaintenanceBlockValues,
} from "@/lib/validator/dashboard.maintenance.schema";
import { TenantProperty } from "@/types/property";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function UpdateMaintenanceBlockPage() {
  const router = useRouter();
  const params = useParams();
  const roomNonAvailabilityId = Number(params.id);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  const { data: tenantProperties } = useGetTenantProperties();
  const properties: TenantProperty[] = tenantProperties?.data || [];

  const { data: tenantRooms } = useGetTenantRooms();
  const allRooms = tenantRooms?.data || [];

  const { data: allBlocks, isLoading: blocksLoading } =
    useGetRoomNonAvailability({
      page: 1,
      take: 100,
    });
  const blockData = allBlocks?.data?.find(
    (b) => b.id === roomNonAvailabilityId
  );

  const updateBlock = useUpdateRoomNonAvailability();

  const form = useForm<UpdateMaintenanceBlockValues>({
    resolver: zodResolver(updateMaintenanceBlockSchema),
    defaultValues: {
      startDate: undefined as unknown as Date,
      endDate: undefined as unknown as Date,
      reason: "",
      roomInventory: 1,
    },
  });

  useEffect(() => {
    if (blockData) {
      const room = allRooms.find((r) => r.id === blockData.room?.id);
      if (!room) return;

      if (room.propertyId !== undefined) {
        setSelectedPropertyId(String(room.propertyId));
      }
      setSelectedRoomId(String(blockData.room?.id));

      const startDate = parseISODate(blockData.startDate);
      const endDate = parseISODate(blockData.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("❌ Invalid dates after parsing!");
        return;
      }

      form.reset({
        startDate,
        endDate,
        reason: blockData.reason || "",
        roomInventory: blockData.roomInventory,
      });
    }
  }, [blockData, allRooms, form]);

  const filteredRooms = selectedPropertyId
    ? allRooms.filter((room) => room.propertyId === Number(selectedPropertyId))
    : [];

  const selectedRoom = allRooms.find((r) => r.id === Number(selectedRoomId));

  const handleCancel = () => {
    router.push("/dashboard/tenant/maintenance");
  };

  const onSubmit = async (values: UpdateMaintenanceBlockValues) => {
    try {
      await updateBlock.mutateAsync({
        id: roomNonAvailabilityId,
        body: {
          startDate: values.startDate
            ? formatLocalDate(values.startDate)
            : undefined,
          endDate: values.endDate ? formatLocalDate(values.endDate) : undefined,
          reason: values.reason,
          roomInventory: values.roomInventory,
        },
      });
      handleCancel();
    } catch (error) {
      console.error("Failed to update maintenance block:", error);
    }
  };
  if (blocksLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading maintenance block...</p>
      </div>
    );
  }

  if (!blockData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Maintenance block not found
        </p>
        <Button onClick={handleCancel}>Back to Maintenance</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          disabled={updateBlock.isPending}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Edit Maintenance Block
          </h1>
          <p className="text-muted-foreground mt-1">
            Update maintenance block details
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select value={selectedPropertyId} disabled>
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

              <FormItem>
                <FormLabel>Room</FormLabel>
                <Select value={selectedRoomId} disabled>
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
              </FormItem>
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
                            {field.value && !isNaN(field.value.getTime()) ? (
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
                            {field.value && !isNaN(field.value.getTime()) ? (
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

            {/* Room Inventory */}
            <FormField
              control={form.control}
              name="roomInventory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="totalUnits">
                    Units to Block
                    {selectedRoom && (
                      <span className="text-muted-foreground font-normal ml-1">
                        (max {selectedRoom.totalUnits})
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="totalUnits"
                      type="number"
                      min={1}
                      max={selectedRoom?.totalUnits}
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === ""?"" : Number(e.target.value))}
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
                  <FormLabel>Reason / Description</FormLabel>
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
                disabled={updateBlock.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateBlock.isPending}>
                {updateBlock.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Maintenance"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
