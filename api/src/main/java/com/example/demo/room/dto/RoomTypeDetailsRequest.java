package com.example.demo.room.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record RoomTypeDetailsRequest(
        @NotBlank String name,
        @NotBlank String description,
        @NotNull @Positive Double ratePerNight,
        @NotNull @Positive Integer totalRooms,
        @NotNull @Positive Integer maxGuests,
        @NotNull @Positive Integer sizeSqm,
        @NotBlank String bedType,
        @NotEmpty List<String> amenities,
        @NotEmpty List<String> facilities,
        @NotNull @Size(max = 5) List<String> existingImageUrls
) {
}
