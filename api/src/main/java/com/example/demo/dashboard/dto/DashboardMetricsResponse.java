package com.example.demo.dashboard.dto;

public record DashboardMetricsResponse(
        long totalReservations,
        long upcomingCheckInsNext7Days,
        long upcomingCheckOutsNext7Days,
        long revenueInRange
) {
}
