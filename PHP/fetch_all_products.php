<?php
//Including the connection file:
include 'connect.php';

// Fetch category names from the categories table
$sql = "SELECT name FROM products";
$result = $conn->query($sql);

// Store category names in an array
$products = array();
while ($row = $result->fetch_assoc())
{
    // Add each row of data to the array
    $products[] = $row;
}

// Close the database connection
$conn->close();

// Return category names in JSON format
header('Content-Type: application/json');
echo json_encode($products);
?>