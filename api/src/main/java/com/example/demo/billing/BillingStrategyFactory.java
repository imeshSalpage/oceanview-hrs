package com.example.demo.billing;

import org.springframework.stereotype.Component;

import com.example.demo.reservation.RoomType;

@Component
public class BillingStrategyFactory {
    private final SingleBilling singleBilling;
    private final DoubleBilling doubleBilling;
    private final DeluxeBilling deluxeBilling;
    private final SuiteBilling suiteBilling;

    public BillingStrategyFactory(SingleBilling singleBilling, DoubleBilling doubleBilling,
            DeluxeBilling deluxeBilling, SuiteBilling suiteBilling) {
        this.singleBilling = singleBilling;
        this.doubleBilling = doubleBilling;
        this.deluxeBilling = deluxeBilling;
        this.suiteBilling = suiteBilling;
    }

    public BillingStrategy resolve(RoomType roomType) {
        return switch (roomType) {
            case SINGLE -> singleBilling;
            case DOUBLE -> doubleBilling;
            case DELUXE -> deluxeBilling;
            case SUITE -> suiteBilling;
        };
    }
}
