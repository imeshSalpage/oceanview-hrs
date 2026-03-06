package com.example.demo.room;

import java.io.IOException;
import java.util.Base64;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.common.ResourceNotFoundException;
import com.example.demo.reservation.RoomType;
import com.example.demo.reservation.ReservationRepository;
import com.example.demo.room.dto.RoomTypeDetailsRequest;
import com.example.demo.room.dto.RoomTypeDetailsResponse;
import com.example.demo.room.dto.RoomAvailabilityResponse;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Service
public class RoomTypeDetailsService {
    private final RoomTypeDetailsRepository roomTypeDetailsRepository;
    private final ReservationRepository reservationRepository;

    public RoomTypeDetailsService(
            RoomTypeDetailsRepository roomTypeDetailsRepository,
            ReservationRepository reservationRepository) {
        this.roomTypeDetailsRepository = roomTypeDetailsRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<RoomTypeDetailsResponse> listPublic() {
        return sortByRoomType(roomTypeDetailsRepository.findAll());
    }

    public RoomTypeDetailsResponse getByRoomType(RoomType roomType) {
        RoomTypeDetails details = roomTypeDetailsRepository.findByRoomType(roomType)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found"));
        return toResponse(details);
    }

    public List<RoomTypeDetailsResponse> listManage() {
        return sortByRoomType(roomTypeDetailsRepository.findAll());
    }

    public RoomTypeDetailsResponse upsert(RoomType roomType, RoomTypeDetailsRequest request, List<MultipartFile> images) {
        RoomTypeDetails details = roomTypeDetailsRepository.findByRoomType(roomType)
                .orElseGet(RoomTypeDetails::new);

        details.setRoomType(roomType);
        details.setName(request.name());
        details.setDescription(request.description());
        details.setRatePerNight(request.ratePerNight());
        details.setTotalRooms(request.totalRooms());
        details.setMaxGuests(request.maxGuests());
        details.setSizeSqm(request.sizeSqm());
        details.setBedType(request.bedType());
        details.setAmenities(request.amenities());
        details.setFacilities(request.facilities());
        applyImages(details, request.existingImageUrls(), images);

        RoomTypeDetails saved = roomTypeDetailsRepository.save(details);
        return toResponse(saved);
    }

    private void applyImages(RoomTypeDetails details, List<String> existingImageUrls, List<MultipartFile> images) {
        List<MultipartFile> providedImages = images == null
                ? Collections.emptyList()
                : images.stream().filter(file -> file != null && !file.isEmpty()).toList();

        List<String> retainedImages = existingImageUrls == null
                ? Collections.emptyList()
                : existingImageUrls.stream()
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(value -> !value.isEmpty())
                        .toList();

        List<String> newImages = providedImages.stream()
                .map(this::toDataUrl)
                .toList();

        List<String> finalImages = java.util.stream.Stream.concat(retainedImages.stream(), newImages.stream())
                .toList();

        if (finalImages.size() > 5) {
            throw new IllegalArgumentException("Maximum 5 images are allowed per room type");
        }

        if (finalImages.isEmpty()) {
            throw new IllegalArgumentException("At least one image is required for room type");
        }

        details.setImageUrls(finalImages);
    }

    private String toDataUrl(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            return "data:" + contentType + ";base64," + base64;
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to read uploaded image");
        }
    }

        public RoomAvailabilityResponse checkAvailability(RoomType roomType, LocalDate checkIn, LocalDate checkOut) {
        RoomTypeDetails details = roomTypeDetailsRepository.findByRoomType(roomType)
            .orElseThrow(() -> new ResourceNotFoundException("Room type not found"));

        int totalRooms = details.getTotalRooms() != null ? details.getTotalRooms() : 0;
        int bookedRooms = reservationRepository
            .findOverlappingReservations(roomType, checkIn, checkOut)
            .size();
        int availableRooms = Math.max(totalRooms - bookedRooms, 0);

        return new RoomAvailabilityResponse(
            roomType,
            totalRooms,
            bookedRooms,
            availableRooms,
            availableRooms > 0
        );
        }

    private List<RoomTypeDetailsResponse> sortByRoomType(List<RoomTypeDetails> details) {
        Map<RoomType, RoomTypeDetailsResponse> mapped = details.stream()
                .map(this::toResponse)
                .collect(Collectors.toMap(RoomTypeDetailsResponse::roomType, Function.identity()));

        return Arrays.stream(RoomType.values())
                .filter(mapped::containsKey)
                .map(mapped::get)
                .collect(Collectors.toList());
    }

    private RoomTypeDetailsResponse toResponse(RoomTypeDetails details) {
        return new RoomTypeDetailsResponse(
                details.getRoomType(),
                details.getName(),
                details.getDescription(),
                details.getRatePerNight(),
                details.getTotalRooms(),
                details.getMaxGuests(),
                details.getSizeSqm(),
                details.getBedType(),
                details.getAmenities(),
                details.getFacilities(),
                details.getImageUrls(),
                details.getUpdatedAt()
        );
    }
}
