<?php

// session to retrieve $citizen_id from login.php
session_start();

//Including the connection file:
include 'connect.php';

// Get values from the POST request (from citizen.html)
if (isset($_POST['categoryValue'])) {
    $category = $_POST['categoryValue'];
}
if (isset($_POST['productValue'])) {
    $product = $_POST['productValue'];
}
if (isset($_POST['personsValue'])) {
    $persons = $_POST['personsValue'];
}

$citizen_id = $_SESSION['citizen_id'];

// Insert values into the database (replace with your table and column names)
$sql = "INSERT INTO supply_requests VALUES (null, '$category', '$product', '$persons', '$citizen_id', 0, null, null, CURRENT_TIMESTAMP(), 0)";

if ($conn->query($sql) === TRUE) {
    echo "Request submitted successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

// Close connection
$conn->close();
?>
