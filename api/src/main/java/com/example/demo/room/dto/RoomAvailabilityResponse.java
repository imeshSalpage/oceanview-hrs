package com.example.demo.room.dto;

import com.example.demo.reservation.RoomType;

public record RoomAvailabilityResponse(
        RoomType roomType,
        int totalRooms,
        int bookedRooms,
        int availableRooms,
        boolean available
) {
}
