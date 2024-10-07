<?php

// Include your database configuration file
include 'connect.php';

// Get the selected category from the URL parameters
$category = $_GET['category'];

// Sanitize the input to prevent SQL injection (assuming $category is a string)
$category = $conn->real_escape_string($category);

// Fetch the category_id for the selected category
$getCategoryIdQuery = "SELECT id FROM categories WHERE name = '$category'";
$categoryIdResult = $conn->query($getCategoryIdQuery);

if ($categoryIdResult->num_rows > 0) 
{
    $row = $categoryIdResult->fetch_assoc();
    $categoryId = $row['id'];

    // Fetch products based on the selected category
    $fetchProductsQuery = "SELECT name, quantity, 'Base' AS source
    FROM products WHERE category_id = '$categoryId'
    UNION SELECT product, quantity, 'Rescuer' AS source
    FROM rescuer_inventory WHERE category_id = '$categoryId'";

    $productsResult = $conn->query($fetchProductsQuery);

    $warehouseStatus = [];

    // Fetch data and add it to the array
    while ($row = $productsResult->fetch_assoc())
    {
        $warehouseStatus[] = $row;
    }
    // Return the products as JSON
   echo json_encode($warehouseStatus);
}
?>
