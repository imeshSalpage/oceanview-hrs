package com.example.demo.config;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.reservation.Reservation;
import com.example.demo.reservation.ReservationRepository;
import com.example.demo.reservation.ReservationStatus;
import com.example.demo.reservation.RoomType;
import com.example.demo.room.RoomTypeDetails;
import com.example.demo.room.RoomTypeDetailsRepository;
import com.example.demo.user.Role;
import com.example.demo.user.User;
import com.example.demo.user.UserRepository;

@Configuration
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(UserRepository userRepository,
            ReservationRepository reservationRepository,
            RoomTypeDetailsRepository roomTypeDetailsRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.default-password:Password@123}") String seedDefaultPassword) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = createUser("admin", "admin@oceanviewresort.lk", Role.ADMIN, passwordEncoder,
                    seedDefaultPassword);
                User reception = createUser("reception", "reception@oceanviewresort.lk", Role.RECEPTION,
                    passwordEncoder, seedDefaultPassword);
                User customer = createUser("customer", "customer@oceanviewresort.lk", Role.CUSTOMER,
                    passwordEncoder, seedDefaultPassword);
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

                if (roomTypeDetailsRepository.count() == 0) {
                roomTypeDetailsRepository.saveAll(List.of(
                    createRoomTypeDetails(
                        RoomType.SINGLE,
                        "Serene Single",
                        "Cozy sanctuary with garden views, ideal for solo escapes.",
                        12000.0,
                        12,
                        1,
                        22,
                        "Single bed",
                        List.of("Plush linens", "Work desk", "Smart TV"),
                        List.of("Pool access", "Wi-Fi", "Daily housekeeping"),
                        List.of(
                            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=80"
                        )
                    ),
                    createRoomTypeDetails(
                        RoomType.DOUBLE,
                        "Ocean Double",
                        "Spacious double room with panoramic coastal views and lounge corner.",
                        18000.0,
                        18,
                        2,
                        30,
                        "Queen bed",
                        List.of("Balcony seating", "Mini bar", "Rain shower"),
                        List.of("Room service", "Wi-Fi", "Fitness studio"),
                        List.of(
                            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1400&q=80"
                        )
                    ),
                    createRoomTypeDetails(
                        RoomType.DELUXE,
                        "Deluxe Retreat",
                        "Elegant retreat with private balcony, spa-inspired bath, and sunrise views.",
                        24000.0,
                        10,
                        3,
                        38,
                        "King bed",
                        List.of("Private balcony", "Signature bath", "Premium coffee"),
                        List.of("Spa access", "Beach shuttle", "Concierge"),
                        List.of(
                            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80"
                        )
                    ),
                    createRoomTypeDetails(
                        RoomType.SUITE,
                        "Oceanfront Suite",
                        "Signature suite with separate lounge, butler service, and private terrace.",
                        32000.0,
                        6,
                        4,
                        52,
                        "King bed + lounge sofa",
                        List.of("Butler service", "Private terrace", "Luxury toiletries"),
                        List.of("Airport transfer", "Private dining", "Spa priority"),
                        List.of(
                            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80"
                        )
                    )
                ));
                }
        };
    }

    private User createUser(String username, String email, Role role, PasswordEncoder passwordEncoder,
            String seedDefaultPassword) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(seedDefaultPassword));
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

    private RoomTypeDetails createRoomTypeDetails(
            RoomType roomType,
            String name,
            String description,
            Double ratePerNight,
            Integer totalRooms,
            Integer maxGuests,
            Integer sizeSqm,
            String bedType,
            List<String> amenities,
            List<String> facilities,
            List<String> imageUrls
    ) {
        RoomTypeDetails details = new RoomTypeDetails();
        details.setRoomType(roomType);
        details.setName(name);
        details.setDescription(description);
        details.setRatePerNight(ratePerNight);
        details.setTotalRooms(totalRooms);
        details.setMaxGuests(maxGuests);
        details.setSizeSqm(sizeSqm);
        details.setBedType(bedType);
        details.setAmenities(amenities);
        details.setFacilities(facilities);
        details.setImageUrls(imageUrls);
        details.setCreatedAt(Instant.now());
        details.setUpdatedAt(Instant.now());
        return details;
    }
}
