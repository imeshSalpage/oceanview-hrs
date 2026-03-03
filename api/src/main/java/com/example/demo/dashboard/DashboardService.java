package com.example.demo.dashboard;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;

import com.example.demo.billing.BillingStrategyFactory;
import com.example.demo.dashboard.dto.DashboardMetricsResponse;
import com.example.demo.reservation.Reservation;
import com.example.demo.reservation.ReservationRepository;
import com.example.demo.reservation.ReservationStatus;

@Service
public class DashboardService {
    private final ReservationRepository reservationRepository;
    private final BillingStrategyFactory billingStrategyFactory;

    public DashboardService(ReservationRepository reservationRepository, BillingStrategyFactory billingStrategyFactory) {
        this.reservationRepository = reservationRepository;
        this.billingStrategyFactory = billingStrategyFactory;
    }

    public DashboardMetricsResponse getMetrics(LocalDate startDate, LocalDate endDate) {
        long totalReservations = reservationRepository.count();

        LocalDate today = LocalDate.now();
        LocalDate next7Days = today.plusDays(7);

        long upcomingCheckIns = reservationRepository.findByCheckInDateBetween(today, next7Days).size();
        long upcomingCheckOuts = reservationRepository.findByCheckOutDateBetween(today, next7Days).size();

        long revenue = 0;
        for (Reservation reservation : reservationRepository.findByCheckInDateBetween(startDate, endDate)) {
            if (reservation.getStatus() == ReservationStatus.CANCELLED) {
                continue;
            }
            long nights = ChronoUnit.DAYS.between(reservation.getCheckInDate(), reservation.getCheckOutDate());
            long total = billingStrategyFactory.resolve(reservation.getRoomType())
                    .calculateTotal(reservation, nights);
            revenue += total;
        }

        return new DashboardMetricsResponse(totalReservations, upcomingCheckIns, upcomingCheckOuts, revenue);
    }
}
