<?php
include 'connect.php';

// Get JSON data from the POST request
$items = json_decode($_POST['products'], true);

// Prepare and execute bulk insert query
$sql = "INSERT INTO products (category_id, name, details, quantity) VALUES ";
$values = [];

foreach ($items as $item) 
{
    $category_id = (int)$item['category'];
    $name = $conn->real_escape_string($item['name']);
    // No need to escape JSON data
    $details = json_encode($item['details']);
    $quantity = 100;

    $values[] = "($category_id, '$name', '$details', $quantity)";
}

$sql .= implode(',', $values);

if ($conn->query($sql) === TRUE)
{
    echo "Products added successfully";
} 
else 
{
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>