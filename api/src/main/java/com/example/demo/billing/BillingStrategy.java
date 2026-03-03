package com.example.demo.billing;

import com.example.demo.reservation.Reservation;

public interface BillingStrategy {
    long ratePerNight();

    default long calculateTotal(Reservation reservation, long nights) {
        return ratePerNight() * nights;
    }
}
