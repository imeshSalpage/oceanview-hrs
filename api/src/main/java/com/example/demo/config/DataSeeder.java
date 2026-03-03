package com.example.demo.config;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.reservation.Reservation;
import com.example.demo.reservation.ReservationRepository;
import com.example.demo.reservation.ReservationStatus;
import com.example.demo.reservation.RoomType;
import com.example.demo.user.Role;
import com.example.demo.user.User;
import com.example.demo.user.UserRepository;

@Configuration
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(UserRepository userRepository,
            ReservationRepository reservationRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = createUser("admin", "admin@oceanviewresort.lk", Role.ADMIN, passwordEncoder);
                User reception = createUser("reception", "reception@oceanviewresort.lk", Role.RECEPTION,
                        passwordEncoder);
                User customer = createUser("customer", "customer@oceanviewresort.lk", Role.CUSTOMER,
                        passwordEncoder);
                userRepository.saveAll(List.of(admin, reception, customer));
            }

            if (reservationRepository.count() == 0) {
                User customer = userRepository.findByUsername("customer").orElse(null);
                String customerId = customer != null ? customer.getId() : null;

                reservationRepository.saveAll(List.of(
                        createReservation(customerId, "RSV-" + randomCode(), "Kavindu Perera",
                                RoomType.DELUXE, LocalDate.now().plusDays(2), LocalDate.now().plusDays(4),
                                ReservationStatus.BOOKED),
                        createReservation(customerId, "RSV-" + randomCode(), "Amaya Silva",
                                RoomType.SUITE, LocalDate.now().plusDays(1), LocalDate.now().plusDays(3),
                                ReservationStatus.CHECKED_IN),
                        createReservation(customerId, "RSV-" + randomCode(), "Nimal Fernando",
                                RoomType.DOUBLE, LocalDate.now().minusDays(4), LocalDate.now().minusDays(1),
                                ReservationStatus.CHECKED_OUT)
                ));
            }
        };
    }

    private User createUser(String username, String email, Role role, PasswordEncoder passwordEncoder) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("Password@123"));
        user.setRole(role);
        user.setCreatedAt(Instant.now());
        return user;
    }

    private Reservation createReservation(String customerId, String reservationNo, String guestName,
            RoomType roomType, LocalDate checkIn, LocalDate checkOut, ReservationStatus status) {
        Reservation reservation = new Reservation();
        reservation.setReservationNo(reservationNo);
        reservation.setCustomerId(customerId);
        reservation.setGuestName(guestName);
        reservation.setAddress("Ocean View Road, Galle");
        reservation.setContactNo("+94771234567");
        reservation.setRoomType(roomType);
        reservation.setCheckInDate(checkIn);
        reservation.setCheckOutDate(checkOut);
        reservation.setStatus(status);
        reservation.setCreatedAt(Instant.now());
        reservation.setUpdatedAt(Instant.now());
        return reservation;
    }

    private String randomCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
