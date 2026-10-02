package com.example.hotelmanagement.service;

import com.example.hotelmanagement.exception.ResourceNotFoundException;
import com.example.hotelmanagement.model.Room;
import com.example.hotelmanagement.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(Objects.requireNonNull(id, "Room ID cannot be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
    }

    public Room saveRoom(Room room) {
        Optional<Room> existing = roomRepository.findByRoomNumber(room.getRoomNumber());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("A room with number '" + room.getRoomNumber() + "' already exists");
        }
        return roomRepository.save(Objects.requireNonNull(room));
    }

    public Room updateRoom(Long id, Room updatedRoom) {
        Room existingRoom = getRoomById(id);

        Optional<Room> withSameNumber = roomRepository.findByRoomNumber(updatedRoom.getRoomNumber());
        if (withSameNumber.isPresent() && !withSameNumber.get().getId().equals(id)) {
            throw new IllegalArgumentException("Another room with number '" + updatedRoom.getRoomNumber() + "' already exists");
        }

        existingRoom.setRoomNumber(updatedRoom.getRoomNumber());
        existingRoom.setType(updatedRoom.getType());
        existingRoom.setPricePerNight(updatedRoom.getPricePerNight());
        existingRoom.setAvailable(updatedRoom.isAvailable());
        return roomRepository.save(Objects.requireNonNull(existingRoom));
    }

    public void deleteRoom(Long id) {
        Room room = getRoomById(id);
        roomRepository.delete(Objects.requireNonNull(room));
    }
}
