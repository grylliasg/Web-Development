<?php
include 'connect.php';

// Get data from the POST request
$selectedCategory = $_POST['selectedCategory'];
$selectedProduct = $_POST['selectedProduct'];
$modifiedDetails = $_POST['modifiedDetails'];
$modifiedQuantity = $_POST['modifiedQuantity'];

// Update the product in the database
$updateProductQuery = "UPDATE products SET details = '$modifiedDetails'
, quantity = '$modifiedQuantity' WHERE category_id = (SELECT id FROM categories WHERE name = '$selectedCategory') AND name = '$selectedProduct'";

if ($conn->query($updateProductQuery) === TRUE) 
{
    // Product updated successfully
    echo json_encode(['text' => 'Product updated successfully']);
} 
else 
{
    // Error in updating the product
    echo json_encode(['text' => 'Error: ' . $updateProductQuery . '<br>' . $conn->error]);
}

$conn->close();
?>
