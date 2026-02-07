'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Edit2, Check, Loader2, Users, Bed, DollarSign, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';


export interface SavedRoom {
  id: number;              
  name: string;            
  description: string;    
  basePrice: number;       
  totalGuests: number;    
  totalUnits: number;      
  images: ImageData[];
}

const roomSchema = z.object({
  name: z.string().min(1, "Room name is required").max(100),
  description: z.string().min(1, "Description is required"),
  basePrice: z.number().min(1, "Price must be greater than 0"),
  totalGuests: z.number().min(1, "Must accommodate at least 1 guest").max(20),
  totalUnits: z.number().min(1, "Must have at least 1 unit").max(100),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface CreatePropertyStep2Props {
  onComplete: (rooms: SavedRoom[]) => void; 
  onBack: () => void;                        
  onCancel: () => void;                    
  isLoading?: boolean;                   
}

export function CreatePropertyStep2({
  onComplete,
  onBack,
  onCancel,
  isLoading,
}: CreatePropertyStep2Props) {
  
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [roomImages, setRoomImages] = useState<ImageData[]>([]);

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 100000, 
      totalGuests: 2,
      totalUnits: 1,
    },
  });

  const handleAddNewRoom = () => {

    form.reset({
      name: '',
      description: '',
      basePrice: 100000,
      totalGuests: 2,
      totalUnits: 1,
    });
    setRoomImages([]);
    setEditingRoomId(null);
    setShowForm(true);
  };

  const handleEditRoom = (room: SavedRoom) => {
    form.reset({
      name: room.name,
      description: room.description,
      basePrice: room.basePrice,
      totalGuests: room.totalGuests,
      totalUnits: room.totalUnits,
    });
    setRoomImages(room.images);
    setEditingRoomId(room.id);
    setShowForm(true);
  };

  const handleDeleteRoom = (roomId: number) => {
    setSavedRooms(savedRooms.filter((r) => r.id !== roomId));
  };

  const handleSaveRoom = (data: RoomFormData) => {

    if (roomImages.length === 0) {
      alert('Please upload at least one room image');
      return;
    }

    if (editingRoomId) {
      setSavedRooms(
        savedRooms.map((room) =>
          room.id === editingRoomId
            ? {
                ...room,
                name: data.name,
                description: data.description,
                basePrice: data.basePrice,
                totalGuests: data.totalGuests,
                totalUnits: data.totalUnits,
                images: roomImages,
              }
            : room
        )
      );
    } else {
      const newRoom: SavedRoom = {
        id: Date.now(),
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        totalGuests: data.totalGuests,
        totalUnits: data.totalUnits,
        images: roomImages,
      };
      setSavedRooms([...savedRooms, newRoom]);
    }
    setShowForm(false);
    setEditingRoomId(null);
    setRoomImages([]);
    form.reset();
  };

  const handleSaveAndAddAnother = (data: RoomFormData) => {
    if (roomImages.length === 0) {
      alert('Please upload at least one room image');
      return;
    };

    const newRoom: SavedRoom = {
      id: Date.now(),
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      totalGuests: data.totalGuests,
      totalUnits: data.totalUnits,
      images: roomImages,
    };
    setSavedRooms([...savedRooms, newRoom]);

    form.reset({
      name: '',
      description: '',
      basePrice: 100000,
      totalGuests: 2,
      totalUnits: 1,
    });
    setRoomImages([]);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRoomId(null);
    setRoomImages([]);
    form.reset();
  };

  const handleComplete = () => {
    if (savedRooms.length === 0) {
      alert('Please add at least one room');
      return;
    }
    onComplete(savedRooms);
  };

  const incrementField = (field: 'totalGuests' | 'totalUnits', max: number) => {
    const current = form.getValues(field);
    if (current < max) form.setValue(field, current + 1);
  };

  const decrementField = (field: 'totalGuests' | 'totalUnits', min: number) => {
    const current = form.getValues(field);
    if (current > min) form.setValue(field, current - 1);
  };

  return (
    <div className="space-y-6">      
      <div>
        <h1 className="text-3xl font-bold">Create Property</h1>
        <p className="text-muted-foreground">Step 2 of 2: Add Rooms</p>
      </div>

      <div className="flex gap-2">
        <div className="h-2 flex-1 rounded-full bg-primary" />
        <div className="h-2 flex-1 rounded-full bg-primary" />
      </div>
      {savedRooms.length > 0 && !showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Added Rooms ({savedRooms.length})</CardTitle>
                <CardDescription>Your rooms are ready to publish</CardDescription>
              </div>
              <Button onClick={handleAddNewRoom} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedRooms.map((room) => (
              <div
                key={room.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                  {room.images[0] && (
                    <img
                      src={room.images[0].preview}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{room.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {room.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <Badge variant="secondary" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      (formatCurrency{room.basePrice})/night
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {room.totalGuests} guests
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Bed className="h-3 w-3" />
                      {room.totalUnits} units
                    </Badge>
                    <Badge variant="outline">
                      {room.images.length} image{room.images.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditRoom(room)}
                    title="Edit room"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRoom(room.id)}
                    className="text-destructive hover:text-destructive"
                    title="Delete room"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingRoomId ? 'Edit Room' : 'Add New Room'}
            </CardTitle>
            <CardDescription>
              {editingRoomId
                ? 'Update room details and images'
                : 'Fill in room details and upload images'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                
                {/* Room Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Deluxe Ocean View Suite" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the room amenities, view, bed type, etc."
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-3 gap-6">
                  
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (per night) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              Rp
                            </span>
                            <Input
                              type="number"
                              className="pl-10"
                              placeholder="100000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Total Guests - With increment/decrement buttons */}
                  <FormField
                    control={form.control}
                    name="totalGuests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Guests *</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => decrementField('totalGuests', 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              className="text-center"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => incrementField('totalGuests', 20)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Total Units - With increment/decrement buttons */}
                  <FormField
                    control={form.control}
                    name="totalUnits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Units *</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => decrementField('totalUnits', 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              className="text-center"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => incrementField('totalUnits', 100)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Room Images */}
                <div className="space-y-2">
                  <ImageUploader
                    images={roomImages}
                    onImagesChange={setRoomImages}
                    maxImages={10}
                    label="Room Images"
                    showCoverBadge={true}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                  
                  {/* Cancel Button - Only show if we have saved rooms */}
                  {savedRooms.length > 0 && (
                    <Button type="button" variant="outline" onClick={handleCancelForm}>
                      Cancel
                    </Button>
                  )}

                  {/* Save & Add Another - Only show when creating new room */}
                  {!editingRoomId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={form.handleSubmit(handleSaveAndAddAnother)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Save & Add Another
                    </Button>
                  )}

                  {/* Save Room Button */}
                  <Button type="button" onClick={form.handleSubmit(handleSaveRoom)}>
                    {editingRoomId ? 'Update Room' : 'Save Room'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        // Show "Add First Room" button if no rooms yet and form is hidden
        savedRooms.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bed className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No rooms added yet</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Add at least one room to continue
              </p>
              <Button onClick={handleAddNewRoom}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Room
              </Button>
            </CardContent>
          </Card>
        )
      )}

      {/* ============================================ */}
      {/* NAVIGATION BUTTONS */}
      {/* ============================================ */}

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
        
        {/* Back Button */}
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Right Side Buttons */}
        <div className="flex gap-3">
          
          {/* Cancel Button */}
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          {/* Complete & Publish Button */}
          <Button
            onClick={handleComplete}
            disabled={savedRooms.length === 0 || isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Check className="h-4 w-4 mr-2" />
            Complete & Publish
          </Button>
        </div>
      </div>
    </div>
  );
}