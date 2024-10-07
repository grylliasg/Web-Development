<?php
// Start the session
session_start();

//Including the connection file:
include 'connect.php';

$latitude = $_POST['latitude'];
$longitude = $_POST['longitude'];

// Retrieve the lastInsertID from the session
if(isset($_SESSION['lastInsertID'])) {
    $lastInsertID = $_SESSION['lastInsertID'];
} else {
    echo "Last Inserted ID not found in session";
}

// Insert the coordinates into the database
$sql = "INSERT INTO pins (citizen_id, latitude, longitude) VALUES ('$lastInsertID', '$latitude', '$longitude')";

if ($conn->query($sql) === TRUE) 
{
    echo "Coordinates saved successfully!";
}
// Close the database connection
$conn->close();
?>