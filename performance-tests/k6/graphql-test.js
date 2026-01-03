import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '30s', target: 500 },
    { duration: '2m', target: 500 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<600', 'p(99)<1200'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export default function () {
  const clientId = Math.floor(Math.random() * 10) + 1;
  const roomId = Math.floor(Math.random() * 10) + 1;
  
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + Math.floor(Math.random() * 7) + 1);

  // Create Reservation Mutation
  const createMutation = `
    mutation CreateReservation($input: CreateReservationInput!) {
      createReservation(input: $input) {
        id
        status
        totalPrice
        checkInDate
        checkOutDate
        client {
          firstName
          lastName
          email
        }
        room {
          roomNumber
          roomType
          pricePerNight
        }
      }
    }
  `;

  const createVariables = {
    input: {
      clientId: clientId.toString(),
      roomId: roomId.toString(),
      checkInDate: checkIn.toISOString().split('T')[0],
      checkOutDate: checkOut.toISOString().split('T')[0],
      numberOfGuests: Math.floor(Math.random() * 4) + 1,
      specialRequests: `Test from k6 GraphQL - VU ${__VU}`,
      status: 'PENDING',
    },
  };

  const createPayload = JSON.stringify({
    query: createMutation,
    variables: createVariables,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const createRes = http.post(BASE_URL, createPayload, params);

  const createSuccess = check(createRes, {
    'create status is 200': (r) => r.status === 200,
    'create has no errors': (r) => !JSON.parse(r.body).errors,
    'create has data': (r) => JSON.parse(r.body).data?.createReservation?.id,
  });

  errorRate.add(!createSuccess);

  if (createSuccess) {
    const createData = JSON.parse(createRes.body);
    const reservationId = createData.data.createReservation.id;

    sleep(1);

    // Get Reservation Query
    const getQuery = `
      query GetReservation($id: ID!) {
        getReservation(id: $id) {
          id
          status
          totalPrice
          numberOfGuests
          specialRequests
          client {
            firstName
            lastName
            email
          }
          room {
            roomNumber
            roomType
          }
        }
      }
    `;

    const getPayload = JSON.stringify({
      query: getQuery,
      variables: { id: reservationId },
    });

    const getRes = http.post(BASE_URL, getPayload, params);

    const getSuccess = check(getRes, {
      'get status is 200': (r) => r.status === 200,
      'get has no errors': (r) => !JSON.parse(r.body).errors,
    });

    errorRate.add(!getSuccess);

    sleep(1);

    // Update Reservation Mutation
    const updateMutation = `
      mutation UpdateReservation($id: ID!, $input: UpdateReservationInput!) {
        updateReservation(id: $id, input: $input) {
          id
          status
          specialRequests
        }
      }
    `;

    const updateVariables = {
      id: reservationId,
      input: {
        status: 'CONFIRMED',
        specialRequests: `Updated by k6 GraphQL - VU ${__VU}`,
      },
    };

    const updatePayload = JSON.stringify({
      query: updateMutation,
      variables: updateVariables,
    });

    const updateRes = http.post(BASE_URL, updatePayload, params);

    const updateSuccess = check(updateRes, {
      'update status is 200': (r) => r.status === 200,
      'update has no errors': (r) => !JSON.parse(r.body).errors,
    });

    errorRate.add(!updateSuccess);

    sleep(1);

    // Delete Reservation Mutation
    const deleteMutation = `
      mutation DeleteReservation($id: ID!) {
        deleteReservation(id: $id)
      }
    `;

    const deletePayload = JSON.stringify({
      query: deleteMutation,
      variables: { id: reservationId },
    });

    const deleteRes = http.post(BASE_URL, deletePayload, params);

    const deleteSuccess = check(deleteRes, {
      'delete status is 200': (r) => r.status === 200,
      'delete returns true': (r) => 
        JSON.parse(r.body).data?.deleteReservation === true,
    });

    errorRate.add(!deleteSuccess);
  }

  sleep(1);
}
