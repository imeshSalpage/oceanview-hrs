package com.example.demo.reservation.dto;

import java.time.Instant;
import java.time.LocalDate;

import com.example.demo.reservation.ReservationStatus;
import com.example.demo.reservation.RoomType;

public record ReservationResponse(
        String reservationNo,
        String customerId,
        String guestName,
        String address,
        String contactNo,
        RoomType roomType,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        ReservationStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
