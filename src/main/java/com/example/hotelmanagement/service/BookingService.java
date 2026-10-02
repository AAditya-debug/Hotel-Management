package com.example.hotelmanagement.service;

import com.example.hotelmanagement.exception.ResourceNotFoundException;
import com.example.hotelmanagement.model.Booking;
import com.example.hotelmanagement.model.Guest;
import com.example.hotelmanagement.model.Room;
import com.example.hotelmanagement.repository.BookingRepository;
import com.example.hotelmanagement.repository.GuestRepository;
import com.example.hotelmanagement.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final GuestRepository guestRepository;

    public BookingService(
            BookingRepository bookingRepository,
            RoomRepository roomRepository,
            GuestRepository guestRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.guestRepository = guestRepository;
    }

    public Booking saveBooking(Booking booking) {
        if (booking.getRoom() == null || booking.getRoom().getId() == null) {
            throw new IllegalArgumentException("A valid Room ID is required for booking");
        }
        if (booking.getGuest() == null || booking.getGuest().getId() == null) {
            throw new IllegalArgumentException("A valid Guest ID is required for booking");
        }
        if (booking.getCheckInDate() == null || booking.getCheckOutDate() == null) {
            throw new IllegalArgumentException("Both Check-in and Check-out dates are required");
        }
        if (!booking.getCheckOutDate().isAfter(booking.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date (" + booking.getCheckOutDate() + ") must be after Check-in date (" + booking.getCheckInDate() + ")");
        }

        Long roomId = Objects.requireNonNull(booking.getRoom().getId());
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        Long guestId = Objects.requireNonNull(booking.getGuest().getId());
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with ID: " + guestId));

        List<Booking> overlapping = bookingRepository
                .findByRoomAndCheckInDateLessThanEqualAndCheckOutDateGreaterThanEqual(
                        room,
                        booking.getCheckOutDate(),
                        booking.getCheckInDate()
                );

        if (!overlapping.isEmpty()) {
            throw new IllegalStateException("Room #" + room.getRoomNumber() + " is already booked for the selected date range");
        }

        long days = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        if (days <= 0) days = 1;
        if (booking.getTotalAmount() <= 0) {
            booking.setTotalAmount(days * room.getPricePerNight());
        }

        booking.setRoom(room);
        booking.setGuest(guest);
        return bookingRepository.save(Objects.requireNonNull(booking));
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Booking ID cannot be null");
        }
        return bookingRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }

    public Booking updateBooking(Long id, Booking updatedBooking) {
        Booking existing = getBookingById(id);

        if (updatedBooking.getRoom() == null || updatedBooking.getRoom().getId() == null) {
            throw new IllegalArgumentException("A valid Room ID is required");
        }
        if (updatedBooking.getGuest() == null || updatedBooking.getGuest().getId() == null) {
            throw new IllegalArgumentException("A valid Guest ID is required");
        }
        if (updatedBooking.getCheckInDate() == null || updatedBooking.getCheckOutDate() == null) {
            throw new IllegalArgumentException("Both Check-in and Check-out dates are required");
        }
        if (!updatedBooking.getCheckOutDate().isAfter(updatedBooking.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after Check-in date");
        }

        Long updatedRoomId = Objects.requireNonNull(updatedBooking.getRoom().getId());
        Room room = roomRepository.findById(updatedRoomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + updatedRoomId));

        Long updatedGuestId = Objects.requireNonNull(updatedBooking.getGuest().getId());
        Guest guest = guestRepository.findById(updatedGuestId)
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with ID: " + updatedGuestId));

        List<Booking> overlapping = bookingRepository
                .findByRoomAndCheckInDateLessThanEqualAndCheckOutDateGreaterThanEqual(
                        room,
                        updatedBooking.getCheckOutDate(),
                        updatedBooking.getCheckInDate()
                ).stream()
                .filter(b -> !b.getId().equals(id))
                .collect(Collectors.toList());

        if (!overlapping.isEmpty()) {
            throw new IllegalStateException("Room #" + room.getRoomNumber() + " is already booked for the selected date range");
        }

        long days = ChronoUnit.DAYS.between(updatedBooking.getCheckInDate(), updatedBooking.getCheckOutDate());
        if (days <= 0) days = 1;

        double total = updatedBooking.getTotalAmount() > 0 
                ? updatedBooking.getTotalAmount() 
                : days * room.getPricePerNight();

        existing.setRoom(room);
        existing.setGuest(guest);
        existing.setCheckInDate(updatedBooking.getCheckInDate());
        existing.setCheckOutDate(updatedBooking.getCheckOutDate());
        existing.setTotalAmount(total);

        return bookingRepository.save(Objects.requireNonNull(existing));
    }

    public void deleteBooking(Long id) {
        Booking booking = getBookingById(id);
        bookingRepository.delete(Objects.requireNonNull(booking));
    }
}
