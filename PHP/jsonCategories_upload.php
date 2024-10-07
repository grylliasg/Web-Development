<?php
include 'connect.php';

// Get JSON data from the POST request
$categories = json_decode($_POST['categories'], true);

// Prepare and execute bulk insert query
$sql = "INSERT INTO categories (id, name) VALUES ";
$values = [];

foreach ($categories as $category) 
{
    $id = (int)$category['id'];
    $name = $conn->real_escape_string($category['category_name']);
    $values[] = "($id, '$name')";
}

$sql .= implode(',', $values);

if ($conn->query($sql) === TRUE) 
{
    echo "Categories added successfully";
} 
else 
{
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
