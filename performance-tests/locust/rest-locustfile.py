from locust import HttpUser, task, between
import random
from datetime import datetime, timedelta
import json


class ReservationUser(HttpUser):
    """
    Locust user class for testing REST API endpoints.
    Simulates realistic user behavior for hotel reservation system.
    """
    
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks
    
    def on_start(self):
        """Called when a simulated user starts"""
        self.reservation_id = None
        
    @task(3)
    def create_reservation(self):
        """Create a new reservation (most common operation)"""
        client_id = random.randint(1, 10)
        room_id = random.randint(1, 10)
        
        # Generate random dates
        check_in = datetime.now() + timedelta(days=random.randint(1, 30))
        check_out = check_in + timedelta(days=random.randint(1, 7))
        
        payload = {
            "clientId": client_id,
            "roomId": room_id,
            "checkInDate": check_in.strftime("%Y-%m-%d"),
            "checkOutDate": check_out.strftime("%Y-%m-%d"),
            "numberOfGuests": random.randint(1, 4),
            "specialRequests": f"Test reservation from Locust",
            "status": random.choice(["PENDING", "CONFIRMED"])
        }
        
        with self.client.post(
            "/api/reservations",
            json=payload,
            catch_response=True,
            name="Create Reservation"
        ) as response:
            if response.status_code == 201:
                data = response.json()
                self.reservation_id = data.get("id")
                response.success()
            elif response.status_code == 409:
                # Conflict is acceptable (room not available)
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")
    
    @task(2)
    def get_reservation(self):
        """Get a reservation by ID"""
        if self.reservation_id:
            with self.client.get(
                f"/api/reservations/{self.reservation_id}",
                catch_response=True,
                name="Get Reservation"
            ) as response:
                if response.status_code == 200:
                    response.success()
                elif response.status_code == 404:
                    # Not found is acceptable
                    response.success()
                else:
                    response.failure(f"Failed with status {response.status_code}")
    
    @task(1)
    def get_all_reservations(self):
        """Get all reservations"""
        with self.client.get(
            "/api/reservations",
            catch_response=True,
            name="Get All Reservations"
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")
    
    @task(1)
    def update_reservation(self):
        """Update an existing reservation"""
        if self.reservation_id:
            client_id = random.randint(1, 10)
            room_id = random.randint(1, 10)
            
            check_in = datetime.now() + timedelta(days=random.randint(1, 30))
            check_out = check_in + timedelta(days=random.randint(1, 7))
            
            payload = {
                "clientId": client_id,
                "roomId": room_id,
                "checkInDate": check_in.strftime("%Y-%m-%d"),
                "checkOutDate": check_out.strftime("%Y-%m-%d"),
                "numberOfGuests": random.randint(1, 4),
                "specialRequests": f"Updated by Locust",
                "status": "CONFIRMED"
            }
            
            with self.client.put(
                f"/api/reservations/{self.reservation_id}",
                json=payload,
                catch_response=True,
                name="Update Reservation"
            ) as response:
                if response.status_code == 200:
                    response.success()
                elif response.status_code in [404, 409]:
                    # Not found or conflict is acceptable
                    response.success()
                else:
                    response.failure(f"Failed with status {response.status_code}")
    
    @task(1)
    def cancel_reservation(self):
        """Cancel a reservation"""
        if self.reservation_id:
            with self.client.patch(
                f"/api/reservations/{self.reservation_id}/cancel",
                catch_response=True,
                name="Cancel Reservation"
            ) as response:
                if response.status_code == 200:
                    response.success()
                elif response.status_code == 404:
                    response.success()
                else:
                    response.failure(f"Failed with status {response.status_code}")
    
    @task(1)
    def delete_reservation(self):
        """Delete a reservation"""
        if self.reservation_id:
            with self.client.delete(
                f"/api/reservations/{self.reservation_id}",
                catch_response=True,
                name="Delete Reservation"
            ) as response:
                if response.status_code in [204, 404]:
                    response.success()
                    self.reservation_id = None  # Reset reservation ID
                else:
                    response.failure(f"Failed with status {response.status_code}")
