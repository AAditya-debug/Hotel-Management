package com.example.hotelmanagement.controller;

import com.example.hotelmanagement.model.Booking;
import com.example.hotelmanagement.repository.BookingRepository;
import com.example.hotelmanagement.repository.GuestRepository;
import com.example.hotelmanagement.repository.RoomRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@CrossOrigin(origins = "*")
public class SystemController {

    private final DataSource dataSource;
    private final RoomRepository roomRepository;
    private final GuestRepository guestRepository;
    private final BookingRepository bookingRepository;

    public SystemController(
            DataSource dataSource,
            RoomRepository roomRepository,
            GuestRepository guestRepository,
            BookingRepository bookingRepository) {
        this.dataSource = dataSource;
        this.roomRepository = roomRepository;
        this.guestRepository = guestRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("timestamp", LocalDateTime.now());

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            status.put("databaseConnected", true);
            status.put("databaseProduct", metaData.getDatabaseProductName());
            status.put("databaseVersion", metaData.getDatabaseProductVersion());
            status.put("driverName", metaData.getDriverName());
            status.put("driverVersion", metaData.getDriverVersion());
            status.put("databaseUrl", metaData.getURL());
            status.put("status", "HEALTHY");
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            status.put("databaseConnected", false);
            status.put("status", "UNHEALTHY");
            status.put("error", e.getMessage());
            return ResponseEntity.ok(status);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            long totalRooms = roomRepository.count();
            long availableRooms = roomRepository.findByAvailable(true).size();
            long bookedRooms = totalRooms - availableRooms;
            long totalGuests = guestRepository.count();
            List<Booking> allBookings = bookingRepository.findAll();
            long totalBookings = allBookings.size();
            double totalRevenue = allBookings.stream()
                    .mapToDouble(booking -> booking != null ? booking.getTotalAmount() : 0.0)
                    .sum();

            stats.put("totalRooms", totalRooms);
            stats.put("availableRooms", availableRooms);
            stats.put("bookedRooms", bookedRooms);
            stats.put("totalGuests", totalGuests);
            stats.put("totalBookings", totalBookings);
            stats.put("totalRevenue", totalRevenue);
            stats.put("occupancyRate", totalRooms > 0 ? Math.round(((double) bookedRooms / totalRooms) * 100.0) : 0);
            stats.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            stats.put("error", e.getMessage());
            return ResponseEntity.ok(stats);
        }
    }
}
