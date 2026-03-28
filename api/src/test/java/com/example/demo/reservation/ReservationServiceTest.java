package com.example.demo.reservation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.common.ResourceNotFoundException;
import com.example.demo.mail.EmailService;
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

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ReservationService reservationService;

    private User customer;

    @BeforeEach
    void setUp() {
        customer = new User();
        customer.setId("customer-id-1");
        customer.setUsername("customer");
        customer.setEmail("customer@example.com");

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
        details.setName("Double Room");
        details.setRatePerNight(15000.0);

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

        // Verify email was sent
        verify(emailService).sendHtmlEmail(
            any(String.class), 
            any(String.class), 
            any(String.class), 
            any(Map.class)
        );
    }

    @Test
    void createMyReservation_throwsWhenCheckoutBeforeCheckin() {
        ReservationCreateRequest request = new ReservationCreateRequest(
                "Guest C",
                "Address",
                "+94772222222",
                RoomType.SINGLE,
                LocalDate.now().plusDays(10),
                LocalDate.now().plusDays(5));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> reservationService.createMyReservation(request));

        assertEquals("Check-out date must be after check-in date", ex.getMessage());
    }

    @Test
    void createMyReservation_throwsWhenCheckinInPast() {
        ReservationCreateRequest request = new ReservationCreateRequest(
                "Guest D",
                "Address",
                "+94773333333",
                RoomType.SINGLE,
                LocalDate.now().minusDays(1),
                LocalDate.now().plusDays(2));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> reservationService.createMyReservation(request));

        assertEquals("Check-in date cannot be in the past", ex.getMessage());
    }

    @Test
    void cancelMyReservation_setsCancelledWhenOwnedByCustomer() {
        Reservation reservation = new Reservation();
        reservation.setReservationNo("RSV-TEST1234");
        reservation.setCustomerId("customer-id-1");
        reservation.setStatus(ReservationStatus.BOOKED);

        when(reservationRepository.findByReservationNo("RSV-TEST1234")).thenReturn(Optional.of(reservation));

        reservationService.cancelMyReservation("RSV-TEST1234");

        ArgumentCaptor<Reservation> reservationCaptor = ArgumentCaptor.forClass(Reservation.class);
        verify(reservationRepository).save(reservationCaptor.capture());
        assertEquals(ReservationStatus.CANCELLED, reservationCaptor.getValue().getStatus());
    }

    @Test
    void cancelMyReservation_throwsWhenOwnedByDifferentCustomer() {
        Reservation reservation = new Reservation();
        reservation.setReservationNo("RSV-OTHER123");
        reservation.setCustomerId("other-customer-id");
        reservation.setStatus(ReservationStatus.BOOKED);

        when(reservationRepository.findByReservationNo("RSV-OTHER123")).thenReturn(Optional.of(reservation));

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> reservationService.cancelMyReservation("RSV-OTHER123"));

        assertEquals("Reservation not found", ex.getMessage());
        verify(reservationRepository, never()).save(any(Reservation.class));
    }
}
