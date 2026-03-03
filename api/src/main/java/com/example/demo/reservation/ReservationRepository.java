package com.example.demo.reservation;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReservationRepository extends MongoRepository<Reservation, String> {
    Optional<Reservation> findByReservationNo(String reservationNo);

    List<Reservation> findByCustomerId(String customerId);

    List<Reservation> findByCheckInDateBetween(LocalDate start, LocalDate end);

    List<Reservation> findByCheckOutDateBetween(LocalDate start, LocalDate end);
}
