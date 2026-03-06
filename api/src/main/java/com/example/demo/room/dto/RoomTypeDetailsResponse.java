package com.example.demo.room.dto;

import java.time.Instant;
import java.util.List;

import com.example.demo.reservation.RoomType;

public record RoomTypeDetailsResponse(
        RoomType roomType,
        String name,
        String description,
        Double ratePerNight,
        Integer totalRooms,
        Integer maxGuests,
        Integer sizeSqm,
        String bedType,
        List<String> amenities,
        List<String> facilities,
        List<String> imageUrls,
        Instant updatedAt
) {
}
