package com.example.demo.reports;

import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.demo.billing.BillingStrategyFactory;
import com.example.demo.reports.dto.ReservationSummaryResponse;
import com.example.demo.reports.dto.RevenueSummaryResponse;
import com.example.demo.reservation.Reservation;
import com.example.demo.reservation.ReservationRepository;
import com.example.demo.reservation.ReservationStatus;
import com.example.demo.reservation.RoomType;

@Service
public class ReportService {
    private final ReservationRepository reservationRepository;
    private final BillingStrategyFactory billingStrategyFactory;

    public ReportService(ReservationRepository reservationRepository, BillingStrategyFactory billingStrategyFactory) {
        this.reservationRepository = reservationRepository;
        this.billingStrategyFactory = billingStrategyFactory;
    }

    public ReservationSummaryResponse reservationSummary() {
        List<Reservation> reservations = reservationRepository.findAll();

        Map<RoomType, Long> byRoomType = new EnumMap<>(RoomType.class);
        Map<ReservationStatus, Long> byStatus = new EnumMap<>(ReservationStatus.class);

        for (RoomType roomType : RoomType.values()) {
            byRoomType.put(roomType, 0L);
        }
        for (ReservationStatus status : ReservationStatus.values()) {
            byStatus.put(status, 0L);
        }

        for (Reservation reservation : reservations) {
            byRoomType.put(reservation.getRoomType(), byRoomType.get(reservation.getRoomType()) + 1);
            byStatus.put(reservation.getStatus(), byStatus.get(reservation.getStatus()) + 1);
        }

        return new ReservationSummaryResponse(byRoomType, byStatus);
    }

    public RevenueSummaryResponse revenueSummary() {
        List<Reservation> reservations = reservationRepository.findAll();
        Map<RoomType, Long> revenueByRoomType = new EnumMap<>(RoomType.class);

        for (RoomType roomType : RoomType.values()) {
            revenueByRoomType.put(roomType, 0L);
        }

        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == ReservationStatus.CANCELLED) {
                continue;
            }
            long nights = ChronoUnit.DAYS.between(reservation.getCheckInDate(), reservation.getCheckOutDate());
            long total = billingStrategyFactory.resolve(reservation.getRoomType())
                    .calculateTotal(reservation, nights);
            revenueByRoomType.put(reservation.getRoomType(), revenueByRoomType.get(reservation.getRoomType()) + total);
        }

        return new RevenueSummaryResponse(revenueByRoomType);
    }
}
