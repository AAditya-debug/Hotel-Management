-- ==========================================================
-- Hotel Management System - PostgreSQL Seed / Sample Data
-- Execute in pgAdmin 4 or psql connected to 'hotel_db'
-- ==========================================================

-- 1. Insert Sample Rooms
INSERT INTO rooms (room_number, type, price_per_night, available) VALUES
('101', 'Deluxe Single', 120.00, true),
('102', 'Deluxe Double', 180.00, false),
('103', 'Executive King', 250.00, true),
('104', 'Standard Single', 85.00, true),
('201', 'Ocean View Suite', 350.00, false),
('202', 'Family Suite', 290.00, true),
('203', 'Deluxe Double', 180.00, true),
('301', 'Presidential Penthouse', 650.00, false),
('302', 'Luxury Villa', 480.00, true),
('303', 'Executive King', 260.00, true)
ON CONFLICT (room_number) DO NOTHING;

-- 2. Insert Sample Guests
INSERT INTO guests (full_name, email, phone_number) VALUES
('Alexander Wright', 'alex.wright@example.com', '+1-555-0192'),
('Sophia Martinez', 'sophia.m@example.com', '+1-555-0284'),
('Liam Chen', 'liam.chen@example.com', '+1-555-0371'),
('Emma Watson', 'emma.watson@example.com', '+1-555-0465'),
('Lucas Novak', 'lucas.novak@example.com', '+1-555-0559')
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Sample Bookings (matching existing room and guest IDs)
INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, total_amount) VALUES
(2, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 540.00),
(5, 2, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days', 1750.00),
(8, 4, CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days', 3250.00);
