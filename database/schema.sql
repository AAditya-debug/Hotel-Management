-- ==========================================================
-- Hotel Management System - PostgreSQL Database Schema
-- Compatible with PostgreSQL 12+ and pgAdmin 4
-- ==========================================================

-- Instructions:
-- 1. Open pgAdmin 4 and connect to your PostgreSQL server.
-- 2. Create a database named 'hotel_db' (if it does not exist already):
--      CREATE DATABASE hotel_db;
-- 3. Connect to 'hotel_db' and execute this script in Query Tool.

-- Drop existing tables if recreating schema (in reverse dependency order)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;

-- ----------------------------------------------------------
-- Table: rooms
-- ----------------------------------------------------------
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    price_per_night NUMERIC(10, 2) NOT NULL CHECK (price_per_night >= 0),
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_rooms_room_number ON rooms(room_number);
CREATE INDEX idx_rooms_type_available ON rooms(type, available);

-- ----------------------------------------------------------
-- Table: guests
-- ----------------------------------------------------------
CREATE TABLE guests (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for search lookups
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_phone ON guests(phone_number);
CREATE INDEX idx_guests_name ON guests(full_name);

-- ----------------------------------------------------------
-- Table: bookings
-- ----------------------------------------------------------
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    guest_id BIGINT NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_dates CHECK (check_out_date > check_in_date)
);

-- Indexes for overlap validation & queries
CREATE INDEX idx_bookings_room_dates ON bookings(room_id, check_in_date, check_out_date);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in_date);
