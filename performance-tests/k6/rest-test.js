import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 10 },    // Stay at 10 users
    { duration: '30s', target: 100 },  // Ramp up to 100 users
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 500 },  // Ramp up to 500 users
    { duration: '2m', target: 500 },   // Stay at 500 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1000ms
    errors: ['rate<0.1'], // Error rate < 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export function setup() {
  // Create test data
  console.log('Setting up test data...');
  return {
    baseUrl: BASE_URL,
  };
}

export default function (data) {
  const clientId = Math.floor(Math.random() * 10) + 1;
  const roomId = Math.floor(Math.random() * 10) + 1;
  
  // Calculate dates
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + Math.floor(Math.random() * 7) + 1);

  // Test 1: Create Reservation
  const createPayload = JSON.stringify({
    clientId: clientId,
    roomId: roomId,
    checkInDate: checkIn.toISOString().split('T')[0],
    checkOutDate: checkOut.toISOString().split('T')[0],
    numberOfGuests: Math.floor(Math.random() * 4) + 1,
    specialRequests: `Test request from k6 - VU ${__VU}`,
    status: 'PENDING',
  });

  const createParams = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'CreateReservation' },
  };

  let createRes = http.post(
    `${data.baseUrl}/api/reservations`,
    createPayload,
    createParams
  );

  const createSuccess = check(createRes, {
    'create status is 201': (r) => r.status === 201,
    'create has reservation id': (r) => JSON.parse(r.body).id !== undefined,
  });

  errorRate.add(!createSuccess);

  if (createSuccess) {
    const reservation = JSON.parse(createRes.body);
    const reservationId = reservation.id;

    sleep(1);

    // Test 2: Get Reservation
    const getRes = http.get(`${data.baseUrl}/api/reservations/${reservationId}`, {
      tags: { name: 'GetReservation' },
    });

    const getSuccess = check(getRes, {
      'get status is 200': (r) => r.status === 200,
      'get has correct id': (r) => JSON.parse(r.body).id === reservationId,
    });

    errorRate.add(!getSuccess);

    sleep(1);

    // Test 3: Update Reservation
    const updatePayload = JSON.stringify({
      clientId: clientId,
      roomId: roomId,
      checkInDate: checkIn.toISOString().split('T')[0],
      checkOutDate: checkOut.toISOString().split('T')[0],
      numberOfGuests: Math.floor(Math.random() * 4) + 1,
      specialRequests: `Updated by k6 - VU ${__VU}`,
      status: 'CONFIRMED',
    });

    const updateRes = http.put(
      `${data.baseUrl}/api/reservations/${reservationId}`,
      updatePayload,
      createParams
    );

    const updateSuccess = check(updateRes, {
      'update status is 200': (r) => r.status === 200,
      'update status is CONFIRMED': (r) => 
        JSON.parse(r.body).status === 'CONFIRMED',
    });

    errorRate.add(!updateSuccess);

    sleep(1);

    // Test 4: Delete Reservation
    const deleteRes = http.del(
      `${data.baseUrl}/api/reservations/${reservationId}`,
      null,
      { tags: { name: 'DeleteReservation' } }
    );

    const deleteSuccess = check(deleteRes, {
      'delete status is 204': (r) => r.status === 204,
    });

    errorRate.add(!deleteSuccess);
  }

  sleep(1);
}

export function teardown(data) {
  console.log('Test completed');
}
