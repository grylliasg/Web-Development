<?php
//Including the connection file:
include 'connect.php';

// Fetch category names from the categories table
$sql = "SELECT name FROM categories";
$result = $conn->query($sql);

// Store category names in an array
$categories = array();
while ($row = $result->fetch_assoc())
{
    // Add each row of data to the array
    $categories[] = $row;
}

// Close the database connection
$conn->close();

// Return category names in JSON format
header('Content-Type: application/json');
echo json_encode($categories);
?>