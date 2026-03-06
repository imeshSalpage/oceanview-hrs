package com.example.demo.room;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.reservation.RoomType;

public interface RoomTypeDetailsRepository extends MongoRepository<RoomTypeDetails, String> {
    Optional<RoomTypeDetails> findByRoomType(RoomType roomType);
}
