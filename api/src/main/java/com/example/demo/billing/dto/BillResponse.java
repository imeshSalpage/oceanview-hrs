package com.example.demo.billing.dto;

import com.example.demo.reservation.RoomType;

public record BillResponse(
        String reservationNo,
        String guestName,
        long nights,
        RoomType roomType,
        long ratePerNight,
        long subtotal,
        long total
) {
}
