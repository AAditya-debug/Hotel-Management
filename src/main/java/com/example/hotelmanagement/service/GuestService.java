package com.example.hotelmanagement.service;

import com.example.hotelmanagement.exception.ResourceNotFoundException;
import com.example.hotelmanagement.model.Guest;
import com.example.hotelmanagement.repository.GuestRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class GuestService {

    private final GuestRepository guestRepository;

    public GuestService(GuestRepository guestRepository) {
        this.guestRepository = guestRepository;
    }

    public List<Guest> getAllGuests() {
        return guestRepository.findAll();
    }

    public Guest getGuestById(Long id) {
        return guestRepository.findById(Objects.requireNonNull(id, "Guest ID cannot be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with ID: " + id));
    }

    public Guest saveGuest(Guest guest) {
        Optional<Guest> existing = guestRepository.findByEmail(guest.getEmail().trim().toLowerCase());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("A guest with email '" + guest.getEmail() + "' already exists");
        }
        guest.setEmail(guest.getEmail().trim().toLowerCase());
        return guestRepository.save(Objects.requireNonNull(guest));
    }

    public Guest updateGuest(Long id, Guest updatedGuest) {
        Guest existing = getGuestById(id);
        String updatedEmail = updatedGuest.getEmail().trim().toLowerCase();

        Optional<Guest> withSameEmail = guestRepository.findByEmail(updatedEmail);
        if (withSameEmail.isPresent() && !withSameEmail.get().getId().equals(id)) {
            throw new IllegalArgumentException("Another guest with email '" + updatedEmail + "' already exists");
        }

        existing.setFullName(updatedGuest.getFullName().trim());
        existing.setEmail(updatedEmail);
        existing.setPhoneNumber(updatedGuest.getPhoneNumber().trim());
        return guestRepository.save(Objects.requireNonNull(existing));
    }

    public void deleteGuest(Long id) {
        Guest guest = getGuestById(id);
        guestRepository.delete(Objects.requireNonNull(guest));
    }
}
