from locust import HttpUser, task, between
import random
from datetime import datetime, timedelta
import json


class GraphQLReservationUser(HttpUser):
    """
    Locust user class for testing GraphQL API.
    """
    
    wait_time = between(1, 3)
    
    def on_start(self):
        self.reservation_id = None
        
    @task(3)
    def create_reservation(self):
        """Create reservation via GraphQL mutation"""
        client_id = random.randint(1, 10)
        room_id = random.randint(1, 10)
        
        check_in = datetime.now() + timedelta(days=random.randint(1, 30))
        check_out = check_in + timedelta(days=random.randint(1, 7))
        
        query = """
        mutation CreateReservation($input: CreateReservationInput!) {
          createReservation(input: $input) {
            id
            status
            totalPrice
            checkInDate
            checkOutDate
          }
        }
        """
        
        variables = {
            "input": {
                "clientId": str(client_id),
                "roomId": str(room_id),
                "checkInDate": check_in.strftime("%Y-%m-%d"),
                "checkOutDate": check_out.strftime("%Y-%m-%d"),
                "numberOfGuests": random.randint(1, 4),
                "specialRequests": "Test from Locust GraphQL",
                "status": random.choice(["PENDING", "CONFIRMED"])
            }
        }
        
        with self.client.post(
            "",
            json={"query": query, "variables": variables},
            catch_response=True,
            name="GraphQL: Create Reservation"
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if "errors" not in data:
                    self.reservation_id = data["data"]["createReservation"]["id"]
                    response.success()
                else:
                    response.success()  # GraphQL errors are still 200 OK
            else:
                response.failure(f"Failed with status {response.status_code}")
    
    @task(2)
    def get_reservation(self):
        """Get reservation via GraphQL query"""
        if self.reservation_id:
            query = """
            query GetReservation($id: ID!) {
              getReservation(id: $id) {
                id
                status
                totalPrice
                numberOfGuests
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
            """
            
            with self.client.post(
                "",
                json={"query": query, "variables": {"id": self.reservation_id}},
                catch_response=True,
                name="GraphQL: Get Reservation"
            ) as response:
                if response.status_code == 200:
                    response.success()
                else:
                    response.failure(f"Failed with status {response.status_code}")
    
    @task(1)
    def get_all_reservations(self):
        """Get all reservations via GraphQL query"""
        query = """
        query GetAllReservations {
          getAllReservations {
            id
            status
            checkInDate
            checkOutDate
          }
        }
        """
        
        with self.client.post(
            "",
            json={"query": query},
            catch_response=True,
            name="GraphQL: Get All Reservations"
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")
    
    @task(1)
    def update_reservation(self):
        """Update reservation via GraphQL mutation"""
        if self.reservation_id:
            query = """
            mutation UpdateReservation($id: ID!, $input: UpdateReservationInput!) {
              updateReservation(id: $id, input: $input) {
                id
                status
                specialRequests
              }
            }
            """
            
            variables = {
                "id": self.reservation_id,
                "input": {
                    "status": "CONFIRMED",
                    "specialRequests": "Updated by Locust GraphQL"
                }
            }
            
            with self.client.post(
                "",
                json={"query": query, "variables": variables},
                catch_response=True,
                name="GraphQL: Update Reservation"
            ) as response:
                if response.status_code == 200:
                    response.success()
                else:
                    response.failure(f"Failed with status {response.status_code}")
    
    @task(1)
    def delete_reservation(self):
        """Delete reservation via GraphQL mutation"""
        if self.reservation_id:
            query = """
            mutation DeleteReservation($id: ID!) {
              deleteReservation(id: $id)
            }
            """
            
            with self.client.post(
                "",
                json={"query": query, "variables": {"id": self.reservation_id}},
                catch_response=True,
                name="GraphQL: Delete Reservation"
            ) as response:
                if response.status_code == 200:
                    self.reservation_id = None
                    response.success()
                else:
                    response.failure(f"Failed with status {response.status_code}")
