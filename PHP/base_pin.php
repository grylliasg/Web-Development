<?php

include 'connect.php';

// Handle POST request to insert or update base pin location
if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{
    $latitude = isset($_POST['latitude']) ? $_POST['latitude'] : null;
    $longitude = isset($_POST['longitude']) ? $_POST['longitude'] : null;

    if ($latitude !== null && $longitude !== null) 
    {
        // Update the existing base pin location in the database
        $sqlUpdate = "UPDATE base_pin SET latitude = $latitude, longitude = $longitude WHERE id = 1";
        mysqli_query($conn, $sqlUpdate);
    }
}

// Handle GET request to retrieve base pin location
if ($_SERVER['REQUEST_METHOD'] === 'GET')
{
    // Retrieve the base pin location from the database
    $sql = "SELECT latitude, longitude FROM base_pin WHERE id = 1";
    $basePin_result = mysqli_query($conn, $sql);

    //Retrieve rescuers's pin locations from the database
    $rescuerPinsSql = "SELECT rescuer_pins.citizen_id, latitude, longitude, username, rescuer_inventory.product, rescuer_inventory.quantity, 
    supply_requests.taken_by AS req_takenby, announcements.taken_by as of_takenby FROM rescuer_pins JOIN citizens ON rescuer_pins.citizen_id = citizens.id 
    LEFT JOIN supply_requests ON citizens.id = supply_requests.taken_by LEFT JOIN announcements ON citizens.id = announcements.taken_by LEFT JOIN 
    rescuer_inventory ON citizens.id = rescuer_inventory.rescuer_id WHERE citizens.userType = 'rescuer';";
    $rescuerPinsResult = mysqli_query($conn, $rescuerPinsSql);

    //Retrieve pending requests pins from the database
    $pendingRequestsSql = "SELECT latitude, longitude, first_name, last_name, phone, registration_date, product, numOfPersons FROM pins JOIN supply_requests 
    ON pins.citizen_id = supply_requests.citizen_id JOIN citizens ON supply_requests.citizen_id = citizens.id WHERE approved = 0";
    $pendingRequestsResult = mysqli_query($conn, $pendingRequestsSql);

    //Retrieve pending offers pins from the database
    $pendingOffersSql = "SELECT latitude, longitude, first_name, last_name, phone, registration_date, product, quantity FROM pins JOIN announcements 
    ON pins.citizen_id = announcements.binded_by JOIN citizens ON announcements.binded_by = citizens.id WHERE approved = 0";
    $pendingOffersResult = mysqli_query($conn, $pendingOffersSql);

    //Retrieve processed requests pins from the database
    $processedRequestsSql = "SELECT latitude, longitude, taken_by, first_name, last_name, phone, registration_date, withdrawal_date, product, numOfPersons FROM pins 
    JOIN supply_requests ON pins.citizen_id = supply_requests.citizen_id JOIN citizens ON supply_requests.citizen_id = citizens.id WHERE approved = 1 AND processed = 0";
    $processedRequestsSqlResult = mysqli_query($conn, $processedRequestsSql);

    //Retrieve processed offers pins from the database
    $processedOffersSql = "SELECT latitude, longitude, taken_by, first_name, last_name, phone, registration_date, withdrawal_date, product, quantity FROM pins 
    JOIN announcements ON pins.citizen_id = announcements.binded_by JOIN citizens ON announcements.binded_by = citizens.id WHERE approved = 1 AND processed = 0";
    $processedOffersResult = mysqli_query($conn, $processedOffersSql);

    if ($basePin_result && mysqli_num_rows($basePin_result) > 0)
    {
        $basePin = mysqli_fetch_assoc($basePin_result);
    }
    
    $rescuerPins = [];
    if($rescuerPinsResult && mysqli_num_rows($rescuerPinsResult) > 0)
    {
        $rescuerPins = mysqli_fetch_all($rescuerPinsResult, MYSQLI_ASSOC);
    }

    $pendingRequests = [];
    if($pendingRequestsResult && mysqli_num_rows($pendingRequestsResult) > 0)
    {
        $pendingRequests = mysqli_fetch_all($pendingRequestsResult, MYSQLI_ASSOC);
    }

    $pendingOffers = [];
    if($pendingOffersResult && mysqli_num_rows($pendingOffersResult) > 0)
    {
        $pendingOffers = mysqli_fetch_all($pendingOffersResult, MYSQLI_ASSOC);
    }

    $processedRequests = [];
    if($processedRequestsSqlResult && mysqli_num_rows($processedRequestsSqlResult) > 0)
    {
        $processedRequests = mysqli_fetch_all($processedRequestsSqlResult, MYSQLI_ASSOC);
    }

    $processedOffers = [];
    if($processedOffersResult && mysqli_num_rows($processedOffersResult) > 0)
    {
        $processedOffers = mysqli_fetch_all($processedOffersResult, MYSQLI_ASSOC);
    }

    echo json_encode(['basePin' => $basePin, 'rescuerPins' => $rescuerPins, 'pendingRequests' => $pendingRequests,
    'pendingOffers' => $pendingOffers, 'processedRequests' => $processedRequests, 'processedOffers' => $processedOffers]);
}

?>