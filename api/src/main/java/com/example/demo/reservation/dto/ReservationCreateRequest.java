package com.example.demo.reservation.dto;

import java.time.LocalDate;

import com.example.demo.reservation.RoomType;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ReservationCreateRequest(
        @NotBlank String guestName,
        String address,
        @NotBlank @Pattern(regexp = "^\\+?[0-9]{7,15}$") String contactNo,
        @NotNull RoomType roomType,
        @NotNull LocalDate checkInDate,
        @NotNull @Future LocalDate checkOutDate
) {
}
