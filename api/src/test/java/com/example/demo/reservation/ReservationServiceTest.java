package com.example.demo.reservation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.reservation.dto.ReservationCreateRequest;
import com.example.demo.reservation.dto.ReservationResponse;
import com.example.demo.room.RoomTypeDetails;
import com.example.demo.room.RoomTypeDetailsRepository;
import com.example.demo.user.CurrentUserService;
import com.example.demo.user.User;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private RoomTypeDetailsRepository roomTypeDetailsRepository;

    @InjectMocks
    private ReservationService reservationService;

    private User customer;

    @BeforeEach
    void setUp() {
        customer = new User();
        customer.setId("customer-id-1");
        customer.setUsername("customer");

        when(currentUserService.getCurrentUser()).thenReturn(customer);
    }

    @Test
    void createMyReservation_throwsWhenNoAvailability() {
        RoomTypeDetails details = new RoomTypeDetails();
        details.setRoomType(RoomType.SINGLE);
        details.setTotalRooms(1);

        when(roomTypeDetailsRepository.findByRoomType(RoomType.SINGLE)).thenReturn(Optional.of(details));
        when(reservationRepository.findOverlappingReservations(any(), any(), any()))
                .thenReturn(List.of(new Reservation()));

        ReservationCreateRequest request = new ReservationCreateRequest(
                "Guest A",
                "Address",
                "+94770000000",
                RoomType.SINGLE,
                LocalDate.now().plusDays(2),
                LocalDate.now().plusDays(3));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> reservationService.createMyReservation(request));

        assertEquals("No availability for selected dates", ex.getMessage());
    }

    @Test
    void createMyReservation_succeedsWhenAvailabilityExists() {
        RoomTypeDetails details = new RoomTypeDetails();
        details.setRoomType(RoomType.DOUBLE);
        details.setTotalRooms(4);

        when(roomTypeDetailsRepository.findByRoomType(RoomType.DOUBLE)).thenReturn(Optional.of(details));
        when(reservationRepository.findOverlappingReservations(any(), any(), any())).thenReturn(List.of());
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReservationCreateRequest request = new ReservationCreateRequest(
                "Guest B",
                "Address",
                "+94771111111",
                RoomType.DOUBLE,
                LocalDate.now().plusDays(4),
                LocalDate.now().plusDays(6));

        ReservationResponse response = reservationService.createMyReservation(request);

        assertEquals("Guest B", response.guestName());
        assertEquals(RoomType.DOUBLE, response.roomType());
        assertEquals(ReservationStatus.BOOKED, response.status());
        assertEquals("customer-id-1", response.customerId());
    }
}
