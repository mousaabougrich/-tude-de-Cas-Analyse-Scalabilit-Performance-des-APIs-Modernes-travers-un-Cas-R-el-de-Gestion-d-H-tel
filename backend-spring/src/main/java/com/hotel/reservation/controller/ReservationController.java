package com.hotel.reservation.controller;

import com.hotel.reservation.dto.ReservationRequest;
import com.hotel.reservation.dto.ReservationResponse;
import com.hotel.reservation.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reservations", description = "REST API for Hotel Reservations")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @Operation(summary = "Create a new reservation", description = "Creates a new hotel reservation")
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody ReservationRequest request) {
        log.info("REST: Received request to create reservation");
        ReservationResponse response = reservationService.createReservation(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get reservation by ID", description = "Retrieves a reservation by its ID")
    public ResponseEntity<ReservationResponse> getReservation(@PathVariable Long id) {
        log.info("REST: Received request to get reservation with ID: {}", id);
        ReservationResponse response = reservationService.getReservationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all reservations", description = "Retrieves all reservations")
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        log.info("REST: Received request to get all reservations");
        List<ReservationResponse> responses = reservationService.getAllReservations();
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a reservation", description = "Updates an existing reservation")
    public ResponseEntity<ReservationResponse> updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody ReservationRequest request) {
        log.info("REST: Received request to update reservation with ID: {}", id);
        ReservationResponse response = reservationService.updateReservation(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a reservation", description = "Deletes a reservation by its ID")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        log.info("REST: Received request to delete reservation with ID: {}", id);
        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a reservation", description = "Cancels a reservation by setting its status to CANCELLED")
    public ResponseEntity<ReservationResponse> cancelReservation(@PathVariable Long id) {
        log.info("REST: Received request to cancel reservation with ID: {}", id);
        ReservationResponse response = reservationService.cancelReservation(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Simple health check endpoint")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("REST API is running");
    }
}
