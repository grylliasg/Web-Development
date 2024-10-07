<?php
include 'connect.php';

session_start();

if (isset($_SESSION['citizen_id'])) {
    $rescuerId = $_SESSION['citizen_id'];

    $rescuerOffersQuery = "SELECT c.first_name, c.last_name, c.phone, a.registration_date, a.product, a.quantity, a.id
    FROM announcements AS a
    JOIN citizens AS c ON c.id = a.binded_by
    WHERE a.taken_by = $rescuerId AND a.approved = 1 AND a.processed = 0";
    $rescuerOffersResult = mysqli_query($conn, $rescuerOffersQuery);
    
    $rescuerRequestsQuery = "SELECT c.first_name, c.last_name, c.phone, s.registration_date, s.product, s.numofPersons, s.id
    FROM supply_requests AS s
    JOIN citizens AS c ON c.id = s.citizen_id
    WHERE s.taken_by = $rescuerId AND s.approved = 1 AND s.processed = 0";
    $rescuerRequestsResult = mysqli_query($conn, $rescuerRequestsQuery);

    $tasks = [];

    if ($rescuerOffersResult) {
        while ($row = mysqli_fetch_assoc($rescuerOffersResult)) {
            // Add task details to the tasks array
            $tasks[] = [
                'type' => 'OFFER',
                'id' => $row['id'],
                'first_name' => $row['first_name'],
                'last_name' => $row['last_name'],
                'phone' => $row['phone'],
                'registration_date' => $row['registration_date'],
                'product' => $row['product'],
                'quantity' => $row['quantity']
            ];
        }
    }

    if ($rescuerRequestsResult) {
        while ($row = mysqli_fetch_assoc($rescuerRequestsResult)) {
            // Add task details to the tasks array
            $tasks[] = [
                'type' => 'REQUEST',
                'id' => $row['id'],
                'first_name' => $row['first_name'],
                'last_name' => $row['last_name'],
                'phone' => $row['phone'],
                'registration_date' => $row['registration_date'],
                'product' => $row['product'],
                'numofPersons' => $row['numofPersons']
            ];
        }
    }

    header('Content-Type: application/json');
    echo json_encode($tasks);
} else {
    echo json_encode(['error' => 'Rescuer ID not found in session']);
}
?>
