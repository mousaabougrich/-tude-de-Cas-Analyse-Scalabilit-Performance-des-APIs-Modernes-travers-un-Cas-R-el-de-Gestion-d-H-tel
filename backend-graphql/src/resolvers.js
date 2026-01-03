import pool from './database.js';

export const resolvers = {
  Query: {
    async getReservation(_, { id }) {
      const result = await pool.query(
        `SELECT r.*, 
                c.id as client_id, c.first_name, c.last_name, c.email, c.phone, c.address,
                rm.id as room_id, rm.room_number, rm.room_type, rm.price_per_night, 
                rm.capacity, rm.description, rm.amenities, rm.is_available
         FROM reservations r
         JOIN clients c ON r.client_id = c.id
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Reservation not found with ID: ${id}`);
      }
      
      return mapReservation(result.rows[0]);
    },

    async getAllReservations() {
      const result = await pool.query(
        `SELECT r.*, 
                c.id as client_id, c.first_name, c.last_name, c.email, c.phone, c.address,
                rm.id as room_id, rm.room_number, rm.room_type, rm.price_per_night, 
                rm.capacity, rm.description, rm.amenities, rm.is_available
         FROM reservations r
         JOIN clients c ON r.client_id = c.id
         JOIN rooms rm ON r.room_id = rm.id
         ORDER BY r.created_at DESC`
      );
      
      return result.rows.map(mapReservation);
    },

    async getReservationsByClient(_, { clientId }) {
      const result = await pool.query(
        `SELECT r.*, 
                c.id as client_id, c.first_name, c.last_name, c.email, c.phone, c.address,
                rm.id as room_id, rm.room_number, rm.room_type, rm.price_per_night, 
                rm.capacity, rm.description, rm.amenities, rm.is_available
         FROM reservations r
         JOIN clients c ON r.client_id = c.id
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.client_id = $1
         ORDER BY r.created_at DESC`,
        [clientId]
      );
      
      return result.rows.map(mapReservation);
    },

    async getReservationsByRoom(_, { roomId }) {
      const result = await pool.query(
        `SELECT r.*, 
                c.id as client_id, c.first_name, c.last_name, c.email, c.phone, c.address,
                rm.id as room_id, rm.room_number, rm.room_type, rm.price_per_night, 
                rm.capacity, rm.description, rm.amenities, rm.is_available
         FROM reservations r
         JOIN clients c ON r.client_id = c.id
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.room_id = $1
         ORDER BY r.created_at DESC`,
        [roomId]
      );
      
      return result.rows.map(mapReservation);
    },

    async getReservationsByStatus(_, { status }) {
      const result = await pool.query(
        `SELECT r.*, 
                c.id as client_id, c.first_name, c.last_name, c.email, c.phone, c.address,
                rm.id as room_id, rm.room_number, rm.room_type, rm.price_per_night, 
                rm.capacity, rm.description, rm.amenities, rm.is_available
         FROM reservations r
         JOIN clients c ON r.client_id = c.id
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.status = $1
         ORDER BY r.created_at DESC`,
        [status]
      );
      
      return result.rows.map(mapReservation);
    },

    async getClient(_, { id }) {
      const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        throw new Error(`Client not found with ID: ${id}`);
      }
      return mapClient(result.rows[0]);
    },

    async getAllClients() {
      const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
      return result.rows.map(mapClient);
    },

    async getRoom(_, { id }) {
      const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        throw new Error(`Room not found with ID: ${id}`);
      }
      return mapRoom(result.rows[0]);
    },

    async getAllRooms() {
      const result = await pool.query('SELECT * FROM rooms ORDER BY room_number');
      return result.rows.map(mapRoom);
    },

    async getAvailableRooms() {
      const result = await pool.query('SELECT * FROM rooms WHERE is_available = true ORDER BY room_number');
      return result.rows.map(mapRoom);
    },
  },

  Mutation: {
    async createReservation(_, { input }) {
      const { clientId, roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests, status } = input;

      // Validate dates
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      if (checkOut <= checkIn) {
        throw new Error('Check-out date must be after check-in date');
      }

      // Check for conflicts
      const conflictsResult = await pool.query(
        `SELECT id FROM reservations 
         WHERE room_id = $1 AND status != 'CANCELLED'
         AND ((check_in_date BETWEEN $2 AND $3) 
              OR (check_out_date BETWEEN $2 AND $3)
              OR ($2 BETWEEN check_in_date AND check_out_date))`,
        [roomId, checkInDate, checkOutDate]
      );

      if (conflictsResult.rows.length > 0) {
        throw new Error('Room is not available for the selected dates');
      }

      // Get room price
      const roomResult = await pool.query('SELECT price_per_night FROM rooms WHERE id = $1', [roomId]);
      if (roomResult.rows.length === 0) {
        throw new Error(`Room not found with ID: ${roomId}`);
      }

      // Calculate total price
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const totalPrice = parseFloat(roomResult.rows[0].price_per_night) * nights;

      // Create reservation
      const result = await pool.query(
        `INSERT INTO reservations (client_id, room_id, check_in_date, check_out_date, 
                                   number_of_guests, total_price, status, special_requests)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [clientId, roomId, checkInDate, checkOutDate, numberOfGuests, totalPrice, status || 'PENDING', specialRequests]
      );

      // Fetch complete reservation with relations
      const fullResult = await pool.query(
        `SELECT r.*, 
                c.id as client_id, c.first_name, c.last_name, c.email, c.phone, c.address,
                rm.id as room_id, rm.room_number, rm.room_type, rm.price_per_night, 
                rm.capacity, rm.description, rm.amenities, rm.is_available
         FROM reservations r
         JOIN clients c ON r.client_id = c.id
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.id = $1`,
        [result.rows[0].id]
      );

      return mapReservation(fullResult.rows[0]);
    },

    async updateReservation(_, { id, input }) {
      // Check if reservation exists
      const existingResult = await pool.query('SELECT * FROM reservations WHERE id = $1', [id]);
      if (existingResult.rows.length === 0) {
        throw new Error(`Reservation not found with ID: ${id}`);
      }

      const existing = existingResult.rows[0];
      const updates = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic update query
      if (input.clientId !== undefined) {
        updates.push(`client_id = $${paramIndex++}`);
        values.push(input.clientId);
      }
      if (input.roomId !== undefined) {
        updates.push(`room_id = $${paramIndex++}`);
        values.push(input.roomId);
      }
      if (input.checkInDate !== undefined) {
        updates.push(`check_in_date = $${paramIndex++}`);
        values.push(input.checkInDate);
      }
      if (input.checkOutDate !== undefined) {
        updates.push(`check_out_date = $${paramIndex++}`);
        values.push(input.checkOutDate);
      }
      if (input.numberOfGuests !== undefined) {
        updates.push(`number_of_guests = $${paramIndex++}`);
        values.push(input.numberOfGuests);
      }
      if (input.specialRequests !== undefined) {
        updates.push(`special_requests = $${paramIndex++}`);
        values.push(input.specialRequests);
      }
      if (input.status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        values.push(input.status);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `UPDATE reservations SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      await pool.query(query, values);

      // Fetch complete reservation
      const fullResult = await pool.query(
        `SELECT r.*, 
                c.id as client_id, c.first_name, c.last_name, c.email, c.phone, c.address,
                rm.id as room_id, rm.room_number, rm.room_type, rm.price_per_night, 
                rm.capacity, rm.description, rm.amenities, rm.is_available
         FROM reservations r
         JOIN clients c ON r.client_id = c.id
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.id = $1`,
        [id]
      );

      return mapReservation(fullResult.rows[0]);
    },

    async deleteReservation(_, { id }) {
      const result = await pool.query('DELETE FROM reservations WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) {
        throw new Error(`Reservation not found with ID: ${id}`);
      }
      return true;
    },

    async cancelReservation(_, { id }) {
      const result = await pool.query(
        'UPDATE reservations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['CANCELLED', id]
      );

      if (result.rows.length === 0) {
        throw new Error(`Reservation not found with ID: ${id}`);
      }

      // Fetch complete reservation
      const fullResult = await pool.query(
        `SELECT r.*, 
                c.id as client_id, c.first_name, c.last_name, c.email, c.phone, c.address,
                rm.id as room_id, rm.room_number, rm.room_type, rm.price_per_night, 
                rm.capacity, rm.description, rm.amenities, rm.is_available
         FROM reservations r
         JOIN clients c ON r.client_id = c.id
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.id = $1`,
        [id]
      );

      return mapReservation(fullResult.rows[0]);
    },
  },

  Reservation: {
    client: (parent) => parent.client,
    room: (parent) => parent.room,
  },

  Client: {
    async reservations(parent) {
      const result = await pool.query(
        `SELECT r.*, 
                c.id as client_id, c.first_name, c.last_name, c.email, c.phone, c.address,
                rm.id as room_id, rm.room_number, rm.room_type, rm.price_per_night, 
                rm.capacity, rm.description, rm.amenities, rm.is_available
         FROM reservations r
         JOIN clients c ON r.client_id = c.id
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.client_id = $1`,
        [parent.id]
      );
      return result.rows.map(mapReservation);
    },
  },
};

// Helper functions to map database rows to GraphQL types
function mapReservation(row) {
  return {
    id: row.id.toString(),
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date,
    numberOfGuests: row.number_of_guests,
    totalPrice: row.total_price.toString(),
    status: row.status,
    specialRequests: row.special_requests,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    client: {
      id: row.client_id.toString(),
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
    },
    room: {
      id: row.room_id.toString(),
      roomNumber: row.room_number,
      roomType: row.room_type,
      pricePerNight: row.price_per_night.toString(),
      capacity: row.capacity,
      description: row.description,
      amenities: row.amenities || [],
      isAvailable: row.is_available,
    },
  };
}

function mapClient(row) {
  return {
    id: row.id.toString(),
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRoom(row) {
  return {
    id: row.id.toString(),
    roomNumber: row.room_number,
    roomType: row.room_type,
    pricePerNight: row.price_per_night.toString(),
    capacity: row.capacity,
    description: row.description,
    amenities: row.amenities || [],
    isAvailable: row.is_available,
    createdAt: row.created_at,
  };
}
