package com.example.demo.reservation;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.reservation.dto.ReservationCreateRequest;
import com.example.demo.reservation.dto.ReservationResponse;
import com.example.demo.reservation.dto.ReservationStaffCreateRequest;
import com.example.demo.reservation.dto.ReservationStatusUpdateRequest;
import com.example.demo.billing.BillingService;
import com.example.demo.billing.dto.BillResponse;

import jakarta.validation.Valid;

@RestController
@Validated
public class ReservationController {
    private final ReservationService reservationService;
    private final BillingService billingService;

    public ReservationController(ReservationService reservationService, BillingService billingService) {
        this.reservationService = reservationService;
        this.billingService = billingService;
    }

    @GetMapping("/api/my/reservations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReservationResponse>> myReservations() {
        return ResponseEntity.ok(reservationService.getMyReservations());
    }

    @PostMapping("/api/my/reservations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReservationResponse> createMyReservation(
            @Valid @RequestBody ReservationCreateRequest request) {
        return ResponseEntity.ok(reservationService.createMyReservation(request));
    }

    @GetMapping("/api/my/reservations/{reservationNo}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReservationResponse> getMyReservation(@PathVariable String reservationNo) {
        return ResponseEntity.ok(reservationService.getMyReservation(reservationNo));
    }

    @GetMapping("/api/my/reservations/{reservationNo}/bill")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BillResponse> getMyBill(@PathVariable String reservationNo) {
        reservationService.getMyReservation(reservationNo);
        return ResponseEntity.ok(billingService.getBillByReservationNo(reservationNo));
    }

    @PatchMapping("/api/my/reservations/{reservationNo}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> cancelMyReservation(@PathVariable String reservationNo) {
        reservationService.cancelMyReservation(reservationNo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/reservations")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTION')")
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @PostMapping("/api/reservations")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTION')")
    public ResponseEntity<ReservationResponse> createReservation(
            @Valid @RequestBody ReservationStaffCreateRequest request) {
        return ResponseEntity.ok(reservationService.createReservation(request));
    }

    @GetMapping("/api/reservations/{reservationNo}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTION')")
    public ResponseEntity<ReservationResponse> getReservation(@PathVariable String reservationNo) {
        return ResponseEntity.ok(reservationService.getReservation(reservationNo));
    }

    @GetMapping("/api/reservations/{reservationNo}/bill")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTION')")
    public ResponseEntity<BillResponse> getBill(@PathVariable String reservationNo) {
        return ResponseEntity.ok(billingService.getBillByReservationNo(reservationNo));
    }

    @PatchMapping("/api/reservations/{reservationNo}/status")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTION')")
    public ResponseEntity<ReservationResponse> updateStatus(
            @PathVariable String reservationNo,
            @Valid @RequestBody ReservationStatusUpdateRequest request) {
        return ResponseEntity.ok(reservationService.updateStatus(reservationNo, request));
    }
}
