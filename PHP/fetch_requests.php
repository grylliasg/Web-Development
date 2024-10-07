<?php

session_start();

//Including the connection file:
include 'connect.php';

// Logged in citizen
$citizen_id = $_SESSION['citizen_id'];

// Fetch category names from the categories table
$sql = "SELECT * FROM supply_requests WHERE citizen_id = $citizen_id";
$result = $conn->query($sql);

$requestsData = array();

if ($result) {
    // Fetch the data from the result set
    while ($row = $result->fetch_assoc()) {
        // Add each row of data to the array
        $requestsData[] = $row;
    }
    echo json_encode($requestsData);
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

// Close the database connection
$conn->close();
?>