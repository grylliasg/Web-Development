<?php

include 'connect.php';

// Get data from the POST request
$selectedCategory = $_POST['selectedCategory'];

// Fetch the category_id for the selected category
$getCategoryIdQuery = "SELECT id FROM categories WHERE name = '$selectedCategory'"; 
$categoryIdResult = $conn->query($getCategoryIdQuery);

if($categoryIdResult->num_rows > 0)
{
    $row = $categoryIdResult->fetch_assoc();
    $categoryId = $row['id'];

    // Fetch products based on the selected category
    $fetchProductsQuery = "SELECT name FROM products WHERE category_id = '$categoryId'";
    $productsResult = $conn->query($fetchProductsQuery);

    $products = array();

    if ($productsResult->num_rows > 0)
    {
        while ($row = $productsResult->fetch_assoc())
        {
            $products[] = $row['name'];
        }
    }

    // Return the products as JSON
    echo json_encode($products);
} 
else 
{
    // Selected category not found
    echo "Error: Selected category not found.";
}

$conn->close();

?>