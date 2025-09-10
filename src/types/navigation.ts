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
  Notifications: undefined;
  ComingSoon: { feature?: string };
  SupportLegal: undefined;
  ServiceWorkers: { serviceKey: string };
  EditProfile: undefined;
  Profile: undefined;
};

export type TabParamList = {
  Home: undefined;
  Services: undefined;
  Bookings: undefined;
  Messaging: undefined;
  Store: undefined;
  Settings: undefined;
};
