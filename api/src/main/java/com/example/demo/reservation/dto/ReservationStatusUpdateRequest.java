package com.example.demo.reservation.dto;

import com.example.demo.reservation.ReservationStatus;

import jakarta.validation.constraints.NotNull;

public record ReservationStatusUpdateRequest(
        @NotNull ReservationStatus status
) {
}
