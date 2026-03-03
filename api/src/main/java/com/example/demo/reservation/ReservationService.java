package com.example.demo.reservation;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.demo.common.ResourceNotFoundException;
import com.example.demo.reservation.dto.ReservationCreateRequest;
import com.example.demo.reservation.dto.ReservationResponse;
import com.example.demo.reservation.dto.ReservationStaffCreateRequest;
import com.example.demo.reservation.dto.ReservationStatusUpdateRequest;
import com.example.demo.user.CurrentUserService;
import com.example.demo.user.User;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final CurrentUserService currentUserService;
    private final ReservationMapper reservationMapper;

    public ReservationService(ReservationRepository reservationRepository, CurrentUserService currentUserService) {
        this.reservationRepository = reservationRepository;
        this.currentUserService = currentUserService;
        this.reservationMapper = new ReservationMapper();
    }

    public List<ReservationResponse> getMyReservations() {
        User user = currentUserService.getCurrentUser();
        return reservationRepository.findByCustomerId(user.getId()).stream()
                .map(reservationMapper::toResponse)
                .toList();
    }

    public ReservationResponse getMyReservation(String reservationNo) {
        User user = currentUserService.getCurrentUser();
        Reservation reservation = reservationRepository.findByReservationNo(reservationNo)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (!user.getId().equals(reservation.getCustomerId())) {
            throw new ResourceNotFoundException("Reservation not found");
        }

        return reservationMapper.toResponse(reservation);
    }

    public ReservationResponse createMyReservation(ReservationCreateRequest request) {
        User user = currentUserService.getCurrentUser();
        validateDates(request.checkInDate(), request.checkOutDate());

        Reservation reservation = new Reservation();
        reservation.setReservationNo(generateReservationNo());
        reservation.setCustomerId(user.getId());
        reservation.setGuestName(request.guestName());
        reservation.setAddress(request.address());
        reservation.setContactNo(request.contactNo());
        reservation.setRoomType(request.roomType());
        reservation.setCheckInDate(request.checkInDate());
        reservation.setCheckOutDate(request.checkOutDate());
        reservation.setStatus(ReservationStatus.BOOKED);
        reservation.setCreatedAt(Instant.now());
        reservation.setUpdatedAt(Instant.now());

        return reservationMapper.toResponse(reservationRepository.save(reservation));
    }

    public void cancelMyReservation(String reservationNo) {
        User user = currentUserService.getCurrentUser();
        Reservation reservation = reservationRepository.findByReservationNo(reservationNo)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (!user.getId().equals(reservation.getCustomerId())) {
            throw new ResourceNotFoundException("Reservation not found");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setUpdatedAt(Instant.now());
        reservationRepository.save(reservation);
    }

    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(reservationMapper::toResponse)
                .toList();
    }

    public ReservationResponse getReservation(String reservationNo) {
        Reservation reservation = reservationRepository.findByReservationNo(reservationNo)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        return reservationMapper.toResponse(reservation);
    }

    public ReservationResponse createReservation(ReservationStaffCreateRequest request) {
        validateDates(request.checkInDate(), request.checkOutDate());

        Reservation reservation = new Reservation();
        reservation.setReservationNo(generateReservationNo());
        reservation.setCustomerId(request.customerId());
        reservation.setGuestName(request.guestName());
        reservation.setAddress(request.address());
        reservation.setContactNo(request.contactNo());
        reservation.setRoomType(request.roomType());
        reservation.setCheckInDate(request.checkInDate());
        reservation.setCheckOutDate(request.checkOutDate());
        reservation.setStatus(ReservationStatus.BOOKED);
        reservation.setCreatedAt(Instant.now());
        reservation.setUpdatedAt(Instant.now());

        return reservationMapper.toResponse(reservationRepository.save(reservation));
    }

    public ReservationResponse updateStatus(String reservationNo, ReservationStatusUpdateRequest request) {
        Reservation reservation = reservationRepository.findByReservationNo(reservationNo)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        reservation.setStatus(request.status());
        reservation.setUpdatedAt(Instant.now());
        return reservationMapper.toResponse(reservationRepository.save(reservation));
    }

    private String generateReservationNo() {
        return "RSV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }
    }
}
