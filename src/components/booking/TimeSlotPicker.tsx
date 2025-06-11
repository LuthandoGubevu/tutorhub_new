// src/components/booking/TimeSlotPicker.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock time slots
const MOCK_TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

interface TimeSlotPickerProps {
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  disabled?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ selectedTime, onTimeSelect, disabled }) => {
  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline text-brand-navy">Select a Time Slot</CardTitle>
      </CardHeader>
      <CardContent>
        {disabled ? (
          <p className="text-muted-foreground text-center">Please select a date first.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {MOCK_TIME_SLOTS.map((slot) => (
              <Button
                key={slot}
                variant={selectedTime === slot ? "default" : "outline"}
                className={cn(
                  "w-full",
                  selectedTime === slot && "bg-brand-purple-blue text-white hover:bg-brand-purple-blue/90"
                )}
                onClick={() => onTimeSelect(slot)}
              >
                {slot}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSlotPicker;
