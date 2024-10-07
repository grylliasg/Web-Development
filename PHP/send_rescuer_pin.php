<?php

session_start();

//Including the connection file:
include 'connect.php';

$latitude = $_POST['latitude'];
$longitude = $_POST['longitude'];

$lastInsertID = $_SESSION['lastInsertID'] ;

// Insert the coordinates into the database
$sql = "INSERT INTO rescuer_pins (citizen_id, latitude, longitude) VALUES ('$lastInsertID', '$latitude', '$longitude')";

if ($conn->query($sql) === TRUE) 
{
    echo "Coordinates saved successfully!";
}
// Close the database connection
$conn->close();
?>