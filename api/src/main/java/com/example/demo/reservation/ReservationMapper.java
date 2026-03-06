package com.example.demo.reservation;

import com.example.demo.reservation.dto.ReservationResponse;

public class ReservationMapper {
    public ReservationResponse toResponse(Reservation reservation) {
        return new ReservationResponse(
                reservation.getReservationNo(),
                reservation.getCustomerId(),
                reservation.getGuestName(),
                reservation.getAddress(),
                reservation.getContactNo(),
                reservation.getRoomType(),
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                reservation.getStatus(),
                reservation.getCreatedAt(),
                reservation.getUpdatedAt());
    }
}
