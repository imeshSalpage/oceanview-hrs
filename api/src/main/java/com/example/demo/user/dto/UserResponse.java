package com.example.demo.user.dto;

import java.time.Instant;

import com.example.demo.user.Role;

public record UserResponse(
        String id,
        String username,
        String email,
        Role role,
        Instant createdAt
) {
}
