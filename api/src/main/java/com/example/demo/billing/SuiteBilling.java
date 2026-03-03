package com.example.demo.billing;

import org.springframework.stereotype.Component;

@Component
public class SuiteBilling implements BillingStrategy {
    @Override
    public long ratePerNight() {
        return 30_000;
    }
}
