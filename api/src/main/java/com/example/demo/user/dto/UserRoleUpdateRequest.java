package com.example.demo.user.dto;

import com.example.demo.user.Role;

import jakarta.validation.constraints.NotNull;

public record UserRoleUpdateRequest(
        @NotNull Role role
) {
}
