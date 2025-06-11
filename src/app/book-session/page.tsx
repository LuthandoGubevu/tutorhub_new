// src/app/book-session/page.tsx
"use client";

import { useState } from 'react';
import BookingCalendar from '@/components/booking/BookingCalendar';
import TimeSlotPicker from '@/components/booking/TimeSlotPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import type { SubjectName, Booking } from '@/types';
import { subjects as availableSubjects, mockBookings } from '@/data/mockData';
import { format } from 'date-fns';

const BookSessionPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedSubject, setSelectedSubject] = useState<SubjectName | undefined>(undefined);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState<Booking | null>(null);

  const handleBooking = async () => {
    if (!user || !selectedDate || !selectedTime || !selectedSubject) {
      toast({ title: "Missing Information", description: "Please select a subject, date, and time.", variant: "destructive" });
      return;
    }
    setIsBooking(true);

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId: user.uid, // Changed from user.id to user.uid
      subject: selectedSubject,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      confirmed: true,
    };

    // Mock API call & update mock data
    await new Promise(resolve => setTimeout(resolve, 1500));
    mockBookings.push(newBooking);
    
    setConfirmedBookingDetails(newBooking);
    setBookingConfirmed(true);
    setIsBooking(false);
    toast({ title: "Booking Confirmed!", description: `Your ${selectedSubject} session is booked for ${format(selectedDate, "PPP")} at ${selectedTime}.`, className: "bg-brand-green text-white" });
    
    // Reset form partially for new booking, or redirect.
    // setSelectedDate(undefined);
    // setSelectedTime(undefined);
    // setSelectedSubject(undefined);
  };
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-brand-purple-blue" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="font-headline text-2xl text-brand-navy mb-4">Book a Tutoring Session</h1>
        <p>Please <Link href="/login" className="underline text-brand-purple-blue">login</Link> or <Link href="/register" className="underline text-brand-purple-blue">register</Link> to book a session.</p>
      </div>
    );
  }

  if (bookingConfirmed && confirmedBookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <Card className="w-full max-w-lg text-center shadow-xl rounded-lg">
          <CardHeader className="bg-brand-green p-6 rounded-t-lg">
            <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
            <CardTitle className="font-headline text-3xl text-white">Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <p className="text-lg text-foreground">Your 15-minute tutoring session for <span className="font-semibold text-brand-purple-blue">{confirmedBookingDetails.subject}</span> has been successfully booked.</p>
            <div className="text-left bg-gray-50 p-4 rounded-md space-y-1">
              <p><span className="font-semibold">Date:</span> {format(new Date(confirmedBookingDetails.date), "EEEE, MMMM dd, yyyy")}</p>
              <p><span className="font-semibold">Time:</span> {confirmedBookingDetails.time}</p>
            </div>
            <p className="text-sm text-muted-foreground">You will receive a confirmation email shortly (mock).</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 p-6">
            <Button className="w-full" asChild><Link href="/dashboard">Go to Dashboard</Link></Button>
            <Button variant="outline" className="w-full" onClick={() => { setBookingConfirmed(false); setConfirmedBookingDetails(null); setSelectedDate(undefined); setSelectedTime(undefined); setSelectedSubject(undefined); }}>Book Another Session</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <section className="text-center">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-brand-navy mb-4">
          Book a 1-on-1 Tutoring Session
        </h1>
        <p className="text-lg text-muted-foreground">
          Get personalized help from our expert tutors. Each session is 15 minutes.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div>
            <Label htmlFor="subject-select" className="text-base font-semibold mb-2 block">Choose Subject</Label>
            <Select 
              onValueChange={(value) => setSelectedSubject(value as SubjectName)} 
              value={selectedSubject}
              disabled={isBooking}
            >
              <SelectTrigger id="subject-select" className="w-full">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map(subject => (
                  <SelectItem key={subject.name} value={subject.name}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <BookingCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>
        <div className="space-y-6">
          <TimeSlotPicker selectedTime={selectedTime} onTimeSelect={setSelectedTime} disabled={!selectedDate || isBooking} />
        
          {selectedDate && selectedTime && selectedSubject && (
            <Card className="shadow-xl rounded-lg bg-gradient-to-br from-brand-purple-blue to-indigo-600 text-white">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center"><CalendarCheck className="mr-2 h-6 w-6"/>Confirm Booking</CardTitle>
                <CardDescription className="text-indigo-200">Please review your session details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Subject:</strong> {selectedSubject}</p>
                <p><strong>Date:</strong> {format(selectedDate, "EEEE, MMMM dd, yyyy")}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-brand-green hover:bg-brand-green/80 text-white font-bold py-3 text-lg" 
                  onClick={handleBooking} 
                  disabled={isBooking}
                >
                  {isBooking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Confirm 15-min Session
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookSessionPage;
