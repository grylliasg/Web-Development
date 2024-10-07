<?php

//Including the connection file:
include 'connect.php';

// Fetch category names from the categories table
$sql = "SELECT * FROM announcements WHERE available = 1";
$result = $conn->query($sql);

$announcementsData = array();

if ($result) {
    // Fetch the data from the result set
    while ($row = $result->fetch_assoc()) {
        // Add each row of data to the array
        $announcementsData[] = $row;
    }
    echo json_encode($announcementsData);
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

// Close the database connection
$conn->close();
?>