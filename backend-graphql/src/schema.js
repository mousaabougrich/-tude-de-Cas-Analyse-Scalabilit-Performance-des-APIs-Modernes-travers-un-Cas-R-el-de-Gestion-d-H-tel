export const typeDefs = `#graphql
  scalar Date
  scalar DateTime
  scalar Decimal

  enum ReservationStatus {
    PENDING
    CONFIRMED
    CANCELLED
    COMPLETED
  }

  enum RoomType {
    SINGLE
    DOUBLE
    SUITE
    DELUXE
  }

  type Client {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    address: String
    createdAt: DateTime!
    updatedAt: DateTime
    reservations: [Reservation!]
  }

  type Room {
    id: ID!
    roomNumber: String!
    roomType: RoomType!
    pricePerNight: Decimal!
    capacity: Int!
    description: String
    amenities: [String!]
    isAvailable: Boolean!
    createdAt: DateTime!
  }

  type Reservation {
    id: ID!
    client: Client!
    room: Room!
    checkInDate: Date!
    checkOutDate: Date!
    numberOfGuests: Int!
    totalPrice: Decimal!
    status: ReservationStatus!
    specialRequests: String
    createdAt: DateTime!
    updatedAt: DateTime
  }

  input CreateReservationInput {
    clientId: ID!
    roomId: ID!
    checkInDate: Date!
    checkOutDate: Date!
    numberOfGuests: Int!
    specialRequests: String
    status: ReservationStatus
  }

  input UpdateReservationInput {
    clientId: ID
    roomId: ID
    checkInDate: Date
    checkOutDate: Date
    numberOfGuests: Int
    specialRequests: String
    status: ReservationStatus
  }

  type Query {
    """Get a single reservation by ID"""
    getReservation(id: ID!): Reservation
    
    """Get all reservations"""
    getAllReservations: [Reservation!]!
    
    """Get reservations by client ID"""
    getReservationsByClient(clientId: ID!): [Reservation!]!
    
    """Get reservations by room ID"""
    getReservationsByRoom(roomId: ID!): [Reservation!]!
    
    """Get reservations by status"""
    getReservationsByStatus(status: ReservationStatus!): [Reservation!]!
    
    """Get a single client by ID"""
    getClient(id: ID!): Client
    
    """Get all clients"""
    getAllClients: [Client!]!
    
    """Get a single room by ID"""
    getRoom(id: ID!): Room
    
    """Get all rooms"""
    getAllRooms: [Room!]!
    
    """Get available rooms"""
    getAvailableRooms: [Room!]!
  }

  type Mutation {
    """Create a new reservation"""
    createReservation(input: CreateReservationInput!): Reservation!
    
    """Update an existing reservation"""
    updateReservation(id: ID!, input: UpdateReservationInput!): Reservation!
    
    """Delete a reservation"""
    deleteReservation(id: ID!): Boolean!
    
    """Cancel a reservation"""
    cancelReservation(id: ID!): Reservation!
  }
`;
