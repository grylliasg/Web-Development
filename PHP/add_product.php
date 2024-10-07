<?php
include 'connect.php';

// Get data from the POST request
$selectedCategory = $_POST['selectedCategory'];
$productName = $_POST['product'];
$productDetails = $_POST['details'];
$productQuantity = $_POST['quantity'];
// Add more variables as needed

// Fetch the category_id for the selected category
$getCategoryIdQuery = "SELECT id FROM categories WHERE name = '$selectedCategory'";
$categoryIdResult = $conn->query($getCategoryIdQuery);

if ($categoryIdResult->num_rows > 0)
{
    $row = $categoryIdResult->fetch_assoc();
    $categoryId = $row['id'];

    // Check if the product name already exists in the selected category
    $checkDuplicateQuery = "SELECT * FROM products WHERE category_id = '$categoryId' AND name = '$productName'";
    $checkDuplicateResult = $conn->query($checkDuplicateQuery);

    if ($checkDuplicateResult->num_rows > 0) 
    {
        // Product with the same name already exists in the selected category
        echo "Error: Product with the same name already exists in the selected category.";
    } 
    else 
    {
        // Insert the product into the database
        $insertProductQuery = "INSERT INTO products (category_id, name, details, quantity) VALUES ('$categoryId', '$productName', '$productDetails', '$productQuantity')";
        
        if ($conn->query($insertProductQuery) === TRUE)
        {
            // Product added successfully
            echo "Product uploaded successfully";
        } else 
        {
            // Error in inserting the product
            echo "Error: " . $insertProductQuery . "<br>" . $conn->error;
        }
    }
} 
else 
{
    // Selected category not found
    echo "Error: Selected category not found.";
}

$conn->close();
?>
