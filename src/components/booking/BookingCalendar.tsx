// src/components/booking/BookingCalendar.tsx
"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ selectedDate, onDateChange }) => {
  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline text-brand-navy">Select a Date</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateChange}
          className="rounded-md border"
          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
        />
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
