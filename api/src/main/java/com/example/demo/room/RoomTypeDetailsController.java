package com.example.demo.room;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.reservation.RoomType;
import com.example.demo.room.dto.RoomTypeDetailsRequest;
import com.example.demo.room.dto.RoomTypeDetailsResponse;
import com.example.demo.room.dto.RoomAvailabilityResponse;

import java.time.LocalDate;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rooms")
@Validated
public class RoomTypeDetailsController {
    private final RoomTypeDetailsService roomTypeDetailsService;

    public RoomTypeDetailsController(RoomTypeDetailsService roomTypeDetailsService) {
        this.roomTypeDetailsService = roomTypeDetailsService;
    }

    @GetMapping
    public List<RoomTypeDetailsResponse> listPublic() {
        return roomTypeDetailsService.listPublic();
    }

    @GetMapping("/{roomType}")
    public RoomTypeDetailsResponse getPublic(@PathVariable RoomType roomType) {
        return roomTypeDetailsService.getByRoomType(roomType);
    }

    @GetMapping("/{roomType}/availability")
    public RoomAvailabilityResponse checkAvailability(
            @PathVariable RoomType roomType,
            @RequestParam LocalDate checkIn,
            @RequestParam LocalDate checkOut) {
        return roomTypeDetailsService.checkAvailability(roomType, checkIn, checkOut);
    }

    @GetMapping("/manage")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTION')")
    public List<RoomTypeDetailsResponse> listManage() {
        return roomTypeDetailsService.listManage();
    }

    @PutMapping("/{roomType}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTION')")
    public RoomTypeDetailsResponse updateRoomType(
            @PathVariable RoomType roomType,
            @Valid @RequestPart("payload") RoomTypeDetailsRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return roomTypeDetailsService.upsert(roomType, request, images);
    }
}
