package com.hotel.reservation.repository;

import com.hotel.reservation.model.Room;
import com.hotel.reservation.model.Room.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    Optional<Room> findByRoomNumber(String roomNumber);
    
    List<Room> findByRoomType(RoomType roomType);
    
    List<Room> findByIsAvailableTrue();
    
    List<Room> findByRoomTypeAndIsAvailableTrue(RoomType roomType);
}
