package com.example.demo.reports.dto;

import java.util.Map;

import com.example.demo.reservation.ReservationStatus;
import com.example.demo.reservation.RoomType;

public record ReservationSummaryResponse(
        Map<RoomType, Long> byRoomType,
        Map<ReservationStatus, Long> byStatus
) {
}
