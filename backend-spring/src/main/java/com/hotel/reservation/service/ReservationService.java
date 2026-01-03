package com.hotel.reservation.service;

import com.hotel.reservation.dto.ReservationRequest;
import com.hotel.reservation.dto.ReservationResponse;
import com.hotel.reservation.exception.ResourceNotFoundException;
import com.hotel.reservation.exception.ReservationConflictException;
import com.hotel.reservation.model.Client;
import com.hotel.reservation.model.Reservation;
import com.hotel.reservation.model.Room;
import com.hotel.reservation.repository.ClientRepository;
import com.hotel.reservation.repository.ReservationRepository;
import com.hotel.reservation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ClientRepository clientRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        log.info("Creating reservation for client ID: {}, room ID: {}", request.getClientId(), request.getRoomId());

        // Validate dates
        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) ||
            request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        // Fetch client
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID: " + request.getClientId()));

        // Fetch room
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + request.getRoomId()));

        // Check for conflicting reservations
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        if (!conflicts.isEmpty()) {
            throw new ReservationConflictException("Room is not available for the selected dates");
        }

        // Calculate total price
        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        // Create reservation
        Reservation reservation = Reservation.builder()
                .client(client)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .numberOfGuests(request.getNumberOfGuests())
                .totalPrice(totalPrice)
                .status(request.getStatus() != null ? request.getStatus() : Reservation.ReservationStatus.PENDING)
                .specialRequests(request.getSpecialRequests())
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);
        log.info("Reservation created successfully with ID: {}", savedReservation.getId());

        return mapToResponse(savedReservation);
    }

    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long id) {
        log.info("Fetching reservation with ID: {}", id);
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));
        return mapToResponse(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations() {
        log.info("Fetching all reservations");
        return reservationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservationResponse updateReservation(Long id, ReservationRequest request) {
        log.info("Updating reservation with ID: {}", id);

        Reservation existingReservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));

        // Validate dates
        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) ||
            request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        // If room or dates changed, check for conflicts
        if (!existingReservation.getRoom().getId().equals(request.getRoomId()) ||
            !existingReservation.getCheckInDate().equals(request.getCheckInDate()) ||
            !existingReservation.getCheckOutDate().equals(request.getCheckOutDate())) {

            List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                    request.getRoomId(),
                    request.getCheckInDate(),
                    request.getCheckOutDate()
            );

            // Exclude current reservation from conflicts
            conflicts = conflicts.stream()
                    .filter(r -> !r.getId().equals(id))
                    .collect(Collectors.toList());

            if (!conflicts.isEmpty()) {
                throw new ReservationConflictException("Room is not available for the selected dates");
            }
        }

        // Update client if changed
        if (!existingReservation.getClient().getId().equals(request.getClientId())) {
            Client client = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID: " + request.getClientId()));
            existingReservation.setClient(client);
        }

        // Update room if changed
        if (!existingReservation.getRoom().getId().equals(request.getRoomId())) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + request.getRoomId()));
            existingReservation.setRoom(room);
        }

        // Recalculate total price
        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalPrice = existingReservation.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(nights));

        existingReservation.setCheckInDate(request.getCheckInDate());
        existingReservation.setCheckOutDate(request.getCheckOutDate());
        existingReservation.setNumberOfGuests(request.getNumberOfGuests());
        existingReservation.setTotalPrice(totalPrice);
        existingReservation.setSpecialRequests(request.getSpecialRequests());
        
        if (request.getStatus() != null) {
            existingReservation.setStatus(request.getStatus());
        }

        Reservation updatedReservation = reservationRepository.save(existingReservation);
        log.info("Reservation updated successfully with ID: {}", updatedReservation.getId());

        return mapToResponse(updatedReservation);
    }

    @Transactional
    public void deleteReservation(Long id) {
        log.info("Deleting reservation with ID: {}", id);
        
        if (!reservationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Reservation not found with ID: " + id);
        }

        reservationRepository.deleteById(id);
        log.info("Reservation deleted successfully with ID: {}", id);
    }

    @Transactional
    public ReservationResponse cancelReservation(Long id) {
        log.info("Cancelling reservation with ID: {}", id);
        
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));

        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        Reservation cancelledReservation = reservationRepository.save(reservation);
        
        log.info("Reservation cancelled successfully with ID: {}", id);
        return mapToResponse(cancelledReservation);
    }

    private ReservationResponse mapToResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .client(ReservationResponse.ClientInfo.builder()
                        .id(reservation.getClient().getId())
                        .firstName(reservation.getClient().getFirstName())
                        .lastName(reservation.getClient().getLastName())
                        .email(reservation.getClient().getEmail())
                        .phone(reservation.getClient().getPhone())
                        .build())
                .room(ReservationResponse.RoomInfo.builder()
                        .id(reservation.getRoom().getId())
                        .roomNumber(reservation.getRoom().getRoomNumber())
                        .roomType(reservation.getRoom().getRoomType().name())
                        .pricePerNight(reservation.getRoom().getPricePerNight())
                        .capacity(reservation.getRoom().getCapacity())
                        .amenities(reservation.getRoom().getAmenities())
                        .build())
                .checkInDate(reservation.getCheckInDate())
                .checkOutDate(reservation.getCheckOutDate())
                .numberOfGuests(reservation.getNumberOfGuests())
                .totalPrice(reservation.getTotalPrice())
                .status(reservation.getStatus())
                .specialRequests(reservation.getSpecialRequests())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .build();
    }
}
