-- Schema creation for hotel reservation system
-- Database: hotel_reservation
-- DBMS: PostgreSQL 15

-- Drop existing tables if they exist
DROP TABLE IF EXISTS reservation_history CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create clients table
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL, -- SINGLE, DOUBLE, SUITE, DELUXE
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL,
    description TEXT,
    amenities TEXT[], -- Array of amenities
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, COMPLETED
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CHECK (check_out_date > check_in_date),
    CHECK (number_of_guests > 0)
);

-- Create reservation history table for audit trail
CREATE TABLE reservation_history (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATED, UPDATED, CANCELLED, COMPLETED
    changed_by VARCHAR(100),
    change_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- Create indexes for performance optimization
CREATE INDEX idx_reservations_client_id ON reservations(client_id);
CREATE INDEX idx_reservations_room_id ON reservations(room_id);
CREATE INDEX idx_reservations_check_in_date ON reservations(check_in_date);
CREATE INDEX idx_reservations_check_out_date ON reservations(check_out_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_rooms_room_number ON rooms(room_number);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample clients
INSERT INTO clients (first_name, last_name, email, phone, address) VALUES
('Jean', 'Dupont', 'jean.dupont@email.com', '+33612345678', '123 Rue de Paris, Paris, France'),
('Marie', 'Martin', 'marie.martin@email.com', '+33698765432', '456 Avenue des Champs, Lyon, France'),
('Pierre', 'Bernard', 'pierre.bernard@email.com', '+33687654321', '789 Boulevard Victor Hugo, Marseille, France'),
('Sophie', 'Dubois', 'sophie.dubois@email.com', '+33676543210', '321 Rue de la République, Toulouse, France'),
('Luc', 'Thomas', 'luc.thomas@email.com', '+33665432109', '654 Place de la Liberté, Nice, France'),
('Emma', 'Robert', 'emma.robert@email.com', '+33654321098', '987 Cours Mirabeau, Bordeaux, France'),
('Antoine', 'Petit', 'antoine.petit@email.com', '+33643210987', '147 Rue Nationale, Nantes, France'),
('Camille', 'Richard', 'camille.richard@email.com', '+33632109876', '258 Avenue Jean Jaurès, Strasbourg, France'),
('Lucas', 'Durand', 'lucas.durand@email.com', '+33621098765', '369 Rue Gambetta, Lille, France'),
('Chloé', 'Moreau', 'chloe.moreau@email.com', '+33610987654', '741 Boulevard Haussmann, Montpellier, France');

-- Insert sample rooms
INSERT INTO rooms (room_number, room_type, price_per_night, capacity, description, amenities, is_available) VALUES
('101', 'SINGLE', 80.00, 1, 'Chambre simple confortable avec vue sur jardin', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar'], true),
('102', 'SINGLE', 80.00, 1, 'Chambre simple moderne', ARRAY['WiFi', 'TV', 'Climatisation'], true),
('201', 'DOUBLE', 120.00, 2, 'Chambre double spacieuse avec balcon', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort', 'Balcon'], true),
('202', 'DOUBLE', 120.00, 2, 'Chambre double confortable', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar'], true),
('203', 'DOUBLE', 130.00, 2, 'Chambre double premium avec vue mer', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort', 'Vue mer'], true),
('301', 'SUITE', 250.00, 4, 'Suite luxueuse avec salon séparé', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort', 'Balcon', 'Jacuzzi', 'Service chambre'], true),
('302', 'SUITE', 280.00, 4, 'Suite prestige avec terrasse privée', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort', 'Terrasse', 'Jacuzzi', 'Service chambre', 'Vue panoramique'], true),
('401', 'DELUXE', 350.00, 6, 'Suite deluxe avec 2 chambres', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort', 'Balcon', 'Jacuzzi', 'Service chambre', 'Cuisine équipée'], true),
('402', 'DELUXE', 400.00, 6, 'Suite royale avec vue exceptionnelle', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort', 'Terrasse', 'Jacuzzi', 'Service chambre', 'Cuisine équipée', 'Spa privé'], true),
('501', 'SUITE', 220.00, 4, 'Suite familiale confortable', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort', 'Jeux pour enfants'], true);

-- Insert sample reservations
INSERT INTO reservations (client_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status, special_requests) VALUES
(1, 1, '2025-12-25', '2025-12-28', 1, 240.00, 'CONFIRMED', 'Arrivée tardive prévue'),
(2, 3, '2025-12-26', '2025-12-30', 2, 480.00, 'CONFIRMED', 'Chambre non-fumeur'),
(3, 6, '2025-12-24', '2025-12-27', 3, 750.00, 'PENDING', 'Berceau pour bébé requis'),
(4, 4, '2026-01-01', '2026-01-05', 2, 480.00, 'CONFIRMED', 'Anniversaire de mariage'),
(5, 5, '2026-01-10', '2026-01-15', 2, 650.00, 'PENDING', 'Vue mer si possible'),
(6, 8, '2026-01-20', '2026-01-25', 4, 1750.00, 'CONFIRMED', 'Voyage d''affaires'),
(7, 2, '2026-02-01', '2026-02-03', 1, 160.00, 'PENDING', NULL),
(8, 7, '2026-02-14', '2026-02-17', 2, 840.00, 'CONFIRMED', 'Séjour romantique - roses dans la chambre'),
(9, 9, '2026-03-01', '2026-03-07', 5, 2400.00, 'CONFIRMED', 'Famille avec enfants'),
(10, 10, '2026-03-15', '2026-03-20', 3, 1100.00, 'PENDING', 'Accessible PMR');

-- Insert reservation history for audit trail
INSERT INTO reservation_history (reservation_id, action, changed_by, change_details) VALUES
(1, 'CREATED', 'system', '{"status": "CONFIRMED", "created_by": "web_portal"}'),
(2, 'CREATED', 'system', '{"status": "CONFIRMED", "created_by": "mobile_app"}'),
(3, 'CREATED', 'system', '{"status": "PENDING", "created_by": "web_portal"}'),
(4, 'CREATED', 'admin', '{"status": "CONFIRMED", "created_by": "admin_panel"}'),
(5, 'CREATED', 'system', '{"status": "PENDING", "created_by": "web_portal"}');

-- Create view for reservation details
CREATE OR REPLACE VIEW reservation_details AS
SELECT 
    r.id,
    r.check_in_date,
    r.check_out_date,
    r.number_of_guests,
    r.total_price,
    r.status,
    r.special_requests,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    rm.room_number,
    rm.room_type,
    rm.price_per_night,
    rm.amenities,
    r.created_at,
    r.updated_at
FROM reservations r
JOIN clients c ON r.client_id = c.id
JOIN rooms rm ON r.room_id = rm.id;

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hoteluser;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hoteluser;

-- Display summary
SELECT 'Database initialization completed successfully!' AS status;
SELECT COUNT(*) AS total_clients FROM clients;
SELECT COUNT(*) AS total_rooms FROM rooms;
SELECT COUNT(*) AS total_reservations FROM reservations;
