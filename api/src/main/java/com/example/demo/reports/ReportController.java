package com.example.demo.reports;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.reports.dto.ReservationSummaryResponse;
import com.example.demo.reports.dto.RevenueSummaryResponse;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/reservations-summary")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTION')")
    public ResponseEntity<ReservationSummaryResponse> reservationSummary() {
        return ResponseEntity.ok(reportService.reservationSummary());
    }

    @GetMapping("/revenue-summary")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTION')")
    public ResponseEntity<RevenueSummaryResponse> revenueSummary() {
        return ResponseEntity.ok(reportService.revenueSummary());
    }
}
