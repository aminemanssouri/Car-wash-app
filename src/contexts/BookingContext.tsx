import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BookingData {
  // Worker info
  workerId: string;
  workerName: string;
  basePrice: number;
  
  // Location
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Date & Time
  date: string;
  time: string;
  
  // Vehicle info
  carType: string;
  carBrand: string;
  carModel?: string;
  carYear?: string;
  carColor?: string;
  carBrandId?: number;
  carModelId?: number;
  
  // Payment
  paymentMethod: string;
  
  // Additional info
  notes: string;
  
  // Calculated
  finalPrice: number;
}

interface BookingContextType {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  resetBookingData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

const defaultBookingData: BookingData = {
  workerId: '',
  workerName: '',
  basePrice: 0,
  address: '',
  date: '',
  time: '',
  carType: '',
  carBrand: '',
  carModel: '',
  carYear: '',
  carColor: '',
  paymentMethod: 'cash',
  notes: '',
  finalPrice: 0,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<BookingData>(defaultBookingData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // DateTime, Vehicle, Location, Payment, Review

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const resetBookingData = () => {
    setBookingData(defaultBookingData);
    setCurrentStep(1);
  };

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        updateBookingData,
        resetBookingData,
        currentStep,
        setCurrentStep,
        totalSteps,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
