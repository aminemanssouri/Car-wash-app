export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Signup: undefined;
  WorkerDetail: { workerId: string };
  Booking: { workerId: string };
  BookingConfirmation: { bookingId: string };
  ForgotPassword: undefined;
  Help: undefined;
  Addresses: undefined;
  ServiceDetail: { serviceKey: string };
};

export type TabParamList = {
  Home: undefined;
  Services: undefined;
  Bookings: undefined;
  Profile: undefined;
  Settings: undefined;
};
