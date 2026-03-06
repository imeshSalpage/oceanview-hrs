package com.example.demo.billing;

import org.springframework.stereotype.Component;

@Component
public class DeluxeBilling implements BillingStrategy {
    @Override
    public long ratePerNight() {
        return 20_000;
    }
}
