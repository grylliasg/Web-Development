<?php
include 'connect.php';

session_start();

// Retrieve the lastInsertID from the session
if(isset($_SESSION['citizen_id'])) {
    $LasttloggedID = $_SESSION['citizen_id'];
} else {
    echo json_encode(['error' => 'Last ID not found in session']);
    exit;
}

if(isset($_POST['announcementId'])) {

    // Sanitize the input
    $announcementId = mysqli_real_escape_string($conn, $_POST['announcementId']);

    // Update the announcements table
    $updateQuery = "UPDATE announcements SET approved = 1, taken_by = $LasttloggedID, withdrawal_date = CURRENT_TIMESTAMP WHERE id = $announcementId";
    $updateResult = mysqli_query($conn, $updateQuery);

    if($updateResult) {
        // Send a success response back to the JavaScript
        echo json_encode(['success' => true]);
    } else {
        // Send an error response back to the JavaScript
        echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
    }

    exit;
}

if(isset($_POST['requestId'])) {

    // Sanitize the input
    $requestId = mysqli_real_escape_string($conn, $_POST['requestId']);

    // Update the announcements table
    $updateQuery = "UPDATE supply_requests SET approved = 1, taken_by = $LasttloggedID, withdrawal_date = CURRENT_TIMESTAMP WHERE id = $requestId";
    $updateResult = mysqli_query($conn, $updateQuery);

    if($updateResult) {
        // Send a success response back to the JavaScript
        echo json_encode(['success' => true]);
    } else {
        // Send an error response back to the JavaScript
        echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
    }

    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Initialize an array for response data
    $responseData = [];

    // Query to count occurrences in the announcements table
    $announcementsQuery = "SELECT COUNT(*) AS announcementsCount FROM announcements WHERE taken_by = $LasttloggedID";
    $announcementsResult = mysqli_query($conn, $announcementsQuery);

    if ($announcementsResult) {
        $announcementsCount = mysqli_fetch_assoc($announcementsResult)['announcementsCount'];
        $responseData['announcementsCount'] = $announcementsCount;
    } else {
        $responseData['announcementsCount'] = 0; 
    }

    // Query to count occurrences in the supply_requests table
    $supplyRequestsQuery = "SELECT COUNT(*) AS supplyRequestsCount FROM supply_requests WHERE taken_by = $LasttloggedID";
    $supplyRequestsResult = mysqli_query($conn, $supplyRequestsQuery);

    if ($supplyRequestsResult) {
        $supplyRequestsCount = mysqli_fetch_assoc($supplyRequestsResult)['supplyRequestsCount'];
        $responseData['supplyRequestsCount'] = $supplyRequestsCount;
    } else {
        $responseData['supplyRequestsCount'] = 0;
    }

    // Send the counts as JSON response
    header('Content-Type: application/json');
    echo json_encode($responseData);
    exit;
}

// Close the database connection
$conn->close();

?>