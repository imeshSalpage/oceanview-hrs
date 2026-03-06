package com.example.demo.reports.dto;

import java.util.Map;

import com.example.demo.reservation.RoomType;

public record RevenueSummaryResponse(
        Map<RoomType, Long> revenueByRoomType
) {
}
