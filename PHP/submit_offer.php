<?php

// session to retrieve $citizen_id from login.php
session_start();

$citizen_id = $_SESSION['citizen_id'];

//Including the connection file:
include 'connect.php';

if (isset($_POST['selectedValue'])) {
    $selectedValue = $_POST['selectedValue'];
}

$sql = "UPDATE announcements SET available = 0, binded_by = $citizen_id WHERE id = $selectedValue;";

if ($conn->query($sql) === TRUE) {
    echo "Request submitted successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

// Close connection
$conn->close();
?>
