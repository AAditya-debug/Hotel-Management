package com.example.hotelmanagement.repository;

import com.example.hotelmanagement.model.Booking;
import com.example.hotelmanagement.model.Guest;
import com.example.hotelmanagement.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByGuest(Guest guest);
    List<Booking> findByCheckInDateBetween(LocalDate start, LocalDate end);
    List<Booking> findByRoomAndCheckInDateLessThanEqualAndCheckOutDateGreaterThanEqual(
        Room room, LocalDate checkOut, LocalDate checkIn);
}
