package com.example.demo.billing;

import org.springframework.stereotype.Component;

@Component
public class SingleBilling implements BillingStrategy {
    @Override
    public long ratePerNight() {
        return 10_000;
    }
}
