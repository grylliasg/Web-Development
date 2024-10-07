<?php

session_start();

include 'connect.php';

// Retrieve the lastInsertID from the session
if(isset($_SESSION['citizen_id'])) {
    $lastInsertID = $_SESSION['citizen_id'];
} else {
    echo json_encode(['error' => 'Last Inserted ID not found in session']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $rescuerOffers = $pendingOffers = $rescuerRequests = $pendingRequests = null;
    // Retrieve pin from the base_pin 
    $basePinQuery = "SELECT * FROM base_pin WHERE id = 1";
    $basePinResult = mysqli_query($conn, $basePinQuery);

    // Retrieve pin from rescuer_pins
    $rescuerPinQuery = "SELECT latitude, longitude FROM rescuer_pins WHERE citizen_id = $lastInsertID";
    $rescuerPinResult = mysqli_query($conn, $rescuerPinQuery);

    // Retrieve pin of the rescuer's offers
    $rescuerOffersQuery = "SELECT p.latitude, p.longitude, c.first_name, c.last_name, c.phone, a.registration_date, a.product, 
    a.quantity, a.withdrawal_date, a.id, r.username
    FROM announcements AS a
    JOIN pins AS p ON a.binded_by = p.citizen_id
    JOIN citizens AS c ON c.id = p.citizen_id
    JOIN citizens AS r ON r.id = $lastInsertID
    WHERE a.taken_by = $lastInsertID AND a.approved = 1 AND a.processed = 0";
    $rescuerOffersResult = mysqli_query($conn, $rescuerOffersQuery);

    $pendingOffersQuery = "SELECT p.latitude, p.longitude, c.first_name, c.last_name, c.phone, a.registration_date, a.product, 
    a.quantity, a.id
    FROM announcements AS a
    JOIN pins AS p ON a.binded_by = p.citizen_id
    JOIN citizens AS c ON c.id = p.citizen_id
    WHERE a.taken_by IS NULL AND a.approved = 0";
    $pendingOffersResult = mysqli_query($conn, $pendingOffersQuery);

    $rescuerRequestsQuery = "SELECT p.latitude, p.longitude, c.first_name, c.last_name, c.phone, s.registration_date, s.product, 
    s.numofPersons, s.withdrawal_date, s.id, r.username
    FROM supply_requests AS s
    JOIN pins AS p ON s.citizen_id = p.citizen_id
    JOIN citizens AS c ON c.id = p.citizen_id
    JOIN citizens AS r ON r.id = $lastInsertID
    WHERE s.taken_by = $lastInsertID AND s.approved = 1 AND s.processed = 0";
    $rescuerRequestsResult = mysqli_query($conn, $rescuerRequestsQuery);

    $pendingRequestsQuery = "SELECT p.latitude, p.longitude, c.first_name, c.last_name, c.phone, s.registration_date, s.product, 
    s.numofPersons, s.id
    FROM supply_requests AS s
    JOIN pins AS p ON s.citizen_id = p.citizen_id
    JOIN citizens AS c ON c.id = p.citizen_id
    WHERE s.taken_by IS NULL AND s.approved = 0";
    $pendingRequestsResult = mysqli_query($conn, $pendingRequestsQuery);

    // Check if both queries were successful
    

        // Fetch base_pin result
        if (mysqli_num_rows($basePinResult) > 0) {
            $basePinRow = mysqli_fetch_assoc($basePinResult);
            $base_pin = ['latitude' => $basePinRow['latitude'], 'longitude' => $basePinRow['longitude']];
        }

        // Fetch another_table result
        if (mysqli_num_rows($rescuerPinResult) > 0) {
            $rescuerPinRow = mysqli_fetch_assoc($rescuerPinResult);
            $rescuer_pins = ['latitude' => $rescuerPinRow['latitude'], 'longitude' => $rescuerPinRow['longitude']];
        }

        if (mysqli_num_rows($rescuerOffersResult) > 0) {
            while($rescuerOffersRow = mysqli_fetch_assoc($rescuerOffersResult)) {
                $rescuerOffers[] = [
                    'id' => $rescuerOffersRow['id'],
                    'latitude' => $rescuerOffersRow['latitude'], 
                    'longitude' => $rescuerOffersRow['longitude'],
                    'first_name' => $rescuerOffersRow['first_name'],
                    'last_name' => $rescuerOffersRow['last_name'],
                    'phone' => $rescuerOffersRow['phone'],
                    'registration_date' => $rescuerOffersRow['registration_date'],
                    'product' => $rescuerOffersRow['product'],
                    'quantity' => $rescuerOffersRow['quantity'],
                    'withdrawal_date' => $rescuerOffersRow['withdrawal_date'],
                    'username' => $rescuerOffersRow['username']
                ];                  
            }
        }

        if (mysqli_num_rows($pendingOffersResult) > 0) {
            while($pendingOffersRow = mysqli_fetch_assoc($pendingOffersResult)) {
                $pendingOffers[] = [
                    'latitude' => $pendingOffersRow['latitude'], 
                    'longitude' => $pendingOffersRow['longitude'],
                    'first_name' => $pendingOffersRow['first_name'],
                    'last_name' => $pendingOffersRow['last_name'],
                    'phone' => $pendingOffersRow['phone'],
                    'registration_date' => $pendingOffersRow['registration_date'],
                    'product' => $pendingOffersRow['product'],
                    'quantity' => $pendingOffersRow['quantity'],
                    'id' => $pendingOffersRow['id']
                ];                  
            }
        }

        if (mysqli_num_rows($rescuerRequestsResult) > 0) {
            while ($rescuerRequestsRow = mysqli_fetch_assoc($rescuerRequestsResult)) {
                $rescuerRequests[] = [
                    'id' => $rescuerRequestsRow['id'],
                    'latitude' => $rescuerRequestsRow['latitude'], 
                    'longitude' => $rescuerRequestsRow['longitude'],
                    'first_name' => $rescuerRequestsRow['first_name'],
                    'last_name' => $rescuerRequestsRow['last_name'],
                    'phone' => $rescuerRequestsRow['phone'],
                    'registration_date' => $rescuerRequestsRow['registration_date'],
                    'product' => $rescuerRequestsRow['product'],
                    'numofPersons' => $rescuerRequestsRow['numofPersons'],
                    'withdrawal_date' => $rescuerRequestsRow['withdrawal_date'],
                    'username' => $rescuerRequestsRow['username']
                ];                  
            }
        }

        if (mysqli_num_rows($pendingRequestsResult) > 0) {
            while ($pendingRequestsRow = mysqli_fetch_assoc($pendingRequestsResult)) {
                $pendingRequests[] = [
                    'latitude' => $pendingRequestsRow['latitude'],
                    'longitude' => $pendingRequestsRow['longitude'],
                    'first_name' => $pendingRequestsRow['first_name'],
                    'last_name' => $pendingRequestsRow['last_name'],
                    'phone' => $pendingRequestsRow['phone'],
                    'registration_date' => $pendingRequestsRow['registration_date'],
                    'product' => $pendingRequestsRow['product'],
                    'numofPersons' => $pendingRequestsRow['numofPersons'],
                    'id' => $pendingRequestsRow['id']
                ];                  
            }
        }

        $combinedPins = [
            'basePin' => $base_pin,
            'rescuerPins' => $rescuer_pins,
            'rescuerOffers' => $rescuerOffers,
            'pendingOffers' => $pendingOffers,
            'rescuerRequests' => $rescuerRequests,
            'pendingRequests' => $pendingRequests
        ];

        // Output combined results as JSON
        header('Content-Type: application/json');
        echo json_encode($combinedPins);
        } else {
                $error = mysqli_error($conn); // Log the MySQL error
    }

    
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $latitude = isset($_POST['latitude']) ? $_POST['latitude'] : null;
    $longitude = isset($_POST['longitude']) ? $_POST['longitude'] : null;

    if ($latitude !== null && $longitude !== null)
    {
        // Update the existing base pin location in the database
        $sqlUpdate = "UPDATE rescuer_pins SET latitude = $latitude, longitude = $longitude WHERE citizen_id = $lastInsertID";
        mysqli_query($conn, $sqlUpdate);
    }
}

// Close the database connection
$conn->close();
?>