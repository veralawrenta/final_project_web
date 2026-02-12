"use client";
import { Button } from "@/components/ui/button";
import { useGetCities } from "@/hooks/useGetCities";
import {
  formatLocalDate,
  fromDateString,
  normalizeLocalDate,
} from "@/lib/date/date";
import { City } from "@/types/city";
import { MapPin, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";

export function SearchBar() {
  const router = useRouter();
  const [cityId, setCityId] = useQueryState("cityId", parseAsInteger);
  const [localCitySearch, setLocalCitySearch] = useState("");

  const [checkIn, setCheckIn] = useQueryState("checkIn", { defaultValue: "" });
  const [checkOut, setCheckOut] = useQueryState("checkOut", {
    defaultValue: "",
  });
  const [guests, setGuests] = useQueryState(
    "guests",
    parseAsInteger.withDefault(1)
  );

  const [debouncedCitySearch] = useDebounceValue(localCitySearch, 300);
  const { data: cities, isLoading: loadingCities } =
    useGetCities(debouncedCitySearch);

  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [checkInDate, setCheckInDate] = useState<Date | null>(
    checkIn ? normalizeLocalDate(fromDateString(checkIn)) : null
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(
    checkOut ? normalizeLocalDate(fromDateString(checkOut)) : null
  );

  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (checkIn) {
      setCheckInDate(normalizeLocalDate(fromDateString(checkIn)));
    }
  }, [checkIn]);

  useEffect(() => {
    if (checkOut) {
      setCheckOutDate(normalizeLocalDate(fromDateString(checkOut)));
    }
  }, [checkOut]);

  const handleCitySelect = (city: City) => {
    setCityId(city.id);
    setLocalCitySearch(city.name);
    setShowCityDropdown(false);
  };

  const handleCheckInChange = (date: Date | null) => {
    if (!date) return;
    const normalized = normalizeLocalDate(date);
    setCheckInDate(normalized);
    setCheckIn(formatLocalDate(normalized));

    if (checkOutDate && checkOutDate <= normalized) {
      setCheckOutDate(null);
      setCheckOut("");
    }
  };

  const handleCheckOutChange = (date: Date | null) => {
    if (!date) return;
    const normalized = normalizeLocalDate(date);
    setCheckOutDate(normalized);
    setCheckOut(formatLocalDate(normalized));
  };

  const handleSearch = () => {
    if (!checkIn || !checkOut || !guests) {
      toast.error("Please fill in all fields");
      return;
    }

    const checkInDateObj = fromDateString(checkIn);
    const checkOutDateObj = fromDateString(checkOut);

    if (checkOutDateObj <= checkInDateObj) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
    });
    
    if (cityId) {
      params.set('cityId', cityId.toString());
    }
  

    router.push(
      `/properties?cityId=${cityId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    );
  };

  const handleClearSearch = () => {
    setCityId(null);
    setLocalCitySearch("");
    setCheckIn("");
    setCheckOut("");
    setGuests(1);
    setCheckInDate(null);
    setCheckOutDate(null);
  };

  const today = normalizeLocalDate(new Date());

  return (
    <div className="w-full max-w-4xl mx-auto -mt-8 md:-mt-12 relative z-10 px-4">
      <div className="glass rounded-2xl p-4 md:p-6 shadow-strong border-2 border-slate-100 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative" ref={cityDropdownRef}>
            <label className="block text-xs font-semibold mb-1.5 px-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10" />
              <input
                type="text"
                value={localCitySearch}
                placeholder={
                  loadingCities ? "Loading cities..." : "Search city..."
                }
                disabled={loadingCities}
                onFocus={() => setShowCityDropdown(true)}
                onChange={(e) => {
                  setLocalCitySearch(e.target.value);
                  setCityId(null);
                  setShowCityDropdown(true);
                }}
                className="w-full pl-10 pr-10 py-3 bg-secondary rounded-xl text-sm"
              />
              {localCitySearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalCitySearch("");
                    setCityId(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {showCityDropdown && (
                <div className="absolute z-50 mt-1 w-full rounded-xl bg-background border shadow-lg max-h-60 overflow-auto">
                  {loadingCities && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Searching destinations...
                    </div>
                  )}

                  {!loadingCities && !cities?.length && localCitySearch && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      No destinations found
                    </div>
                  )}

                  {cities?.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 px-2">
              Check-in
            </label>
            <DatePicker
              selected={checkInDate}
              onChange={handleCheckInChange}
              minDate={today}
              dateFormat="MMM dd, yyyy"
              placeholderText="Select date"
              className="w-full px-4 py-3 bg-secondary rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 px-2">
              Check-out
            </label>
            <DatePicker
              selected={checkOutDate}
              onChange={handleCheckOutChange}
              minDate={
                checkInDate ? new Date(checkInDate.getTime() + 86400000) : today
              }
              disabled={!checkInDate}
              dateFormat="MMM dd, yyyy"
              placeholderText="Select date"
              className="w-full px-4 py-3 bg-secondary rounded-xl text-sm"
            />
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1.5 px-2">
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-4 py-3 bg-secondary rounded-xl text-sm"
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} Guest{i > 0 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <Button className="h-12 w-12" onClick={handleSearch}>
              <Search className="h-5 w-5 " />
            </Button>
          </div>
        </div>

        {(cityId || checkIn || checkOut || guests > 1) && (
          <div className="mt-4 text-center">
            <button
              onClick={handleClearSearch}
              className="text-xs hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
