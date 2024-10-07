<?php

include 'connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{
    // Get data from the request
    $product = $_POST['product'];
    $category = $_POST['category'];
    $quantity = $_POST['quantity'];

    $insertQuery = "INSERT INTO announcements (product, category, quantity) VALUES ('$product', '$category', '$quantity')";
    $insertResult = mysqli_query($conn, $insertQuery);

    if ($insertResult) 
    {
        // Send a response (you can customize the response based on success or failure)
        $response = ['message' => 'Announcement created successfully'];
        echo json_encode($response);
    } 
    else 
    {
        echo json_encode(['message' => 'An error occurred while creating the announcement. Please try again.']);
    }
} 
else 
{
    echo json_encode(['message' => 'Invalid request']);
}

?>