export type Role = "ADMIN" | "RECEPTION" | "CUSTOMER";

export type ReservationStatus =
  | "BOOKED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED";

export type RoomType = "SINGLE" | "DOUBLE" | "DELUXE" | "SUITE";

export interface AuthResponse {
  token: string;
  username: string;
  role: Role;
}

export interface ReservationResponse {
  reservationNo: string;
  customerId: string;
  guestName: string;
  address?: string;
  contactNo: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BillResponse {
  reservationNo: string;
  guestName: string;
  nights: number;
  roomType: RoomType;
  ratePerNight: number;
  subtotal: number;
  total: number;
}

export interface DashboardMetricsResponse {
  totalReservations: number;
  upcomingCheckInsNext7Days: number;
  upcomingCheckOutsNext7Days: number;
  revenueInRange: number;
}

export interface ReservationSummaryResponse {
  byRoomType: Record<RoomType, number>;
  byStatus: Record<ReservationStatus, number>;
}

export interface RevenueSummaryResponse {
  revenueByRoomType: Record<RoomType, number>;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
}
