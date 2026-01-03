package com.hotel.reservation.repository;

import com.hotel.reservation.model.Reservation;
import com.hotel.reservation.model.Reservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByClientId(Long clientId);

    List<Reservation> findByRoomId(Long roomId);

    List<Reservation> findByStatus(ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE r.checkInDate >= :startDate AND r.checkOutDate <= :endDate")
    List<Reservation> findReservationsBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT r FROM Reservation r WHERE r.room.id = :roomId " +
           "AND r.status != 'CANCELLED' " +
           "AND ((r.checkInDate BETWEEN :checkIn AND :checkOut) " +
           "OR (r.checkOutDate BETWEEN :checkIn AND :checkOut) " +
           "OR (:checkIn BETWEEN r.checkInDate AND r.checkOutDate))")
    List<Reservation> findConflictingReservations(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );
}
