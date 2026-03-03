package com.example.demo.billing;

import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;

import com.example.demo.billing.dto.BillResponse;
import com.example.demo.common.ResourceNotFoundException;
import com.example.demo.reservation.Reservation;
import com.example.demo.reservation.ReservationRepository;
import com.example.demo.reservation.ReservationStatus;

@Service
public class BillingService {
    private final ReservationRepository reservationRepository;
    private final BillingStrategyFactory strategyFactory;

    public BillingService(ReservationRepository reservationRepository, BillingStrategyFactory strategyFactory) {
        this.reservationRepository = reservationRepository;
        this.strategyFactory = strategyFactory;
    }

    public BillResponse getBillByReservationNo(String reservationNo) {
        Reservation reservation = reservationRepository.findByReservationNo(reservationNo)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Reservation is cancelled");
        }

        long nights = ChronoUnit.DAYS.between(reservation.getCheckInDate(), reservation.getCheckOutDate());
        BillingStrategy strategy = strategyFactory.resolve(reservation.getRoomType());
        long subtotal = strategy.calculateTotal(reservation, nights);

        return new BillResponse(
                reservation.getReservationNo(),
                reservation.getGuestName(),
                nights,
                reservation.getRoomType(),
                strategy.ratePerNight(),
                subtotal,
                subtotal);
    }
}
