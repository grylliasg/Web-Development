<?php

include 'connect.php';

// Get the new category name from the POST request
$newCategoryName = $_POST['newCategoryName'];

// Check if the category already exists
$checkSql = "SELECT COUNT(*) as count FROM categories WHERE name = '$newCategoryName'";
$result = $conn->query($checkSql);

if ($result->num_rows > 0) 
{
    $row = $result->fetch_assoc();
    if ($row['count'] > 0) 
    {
        // Category already exists
        echo json_encode(array('exists' => true, 'message' => 'Category already exists'));
    } 
    else
    {
        // Insert the new category into the database
        $insertSql = "INSERT INTO categories (name) VALUES ('$newCategoryName')";
        if ($conn->query($insertSql) === TRUE) 
        {
            echo json_encode(array('exists' => false, 'message' => 'Category added successfully'));
        } 
        else 
        {
            echo json_encode(array('exists' => false, 'message' => 'Error: ' . $insertSql . '<br>' . $conn->error));
        }
    }
} 
else 
{
    echo json_encode(array('exists' => false, 'message' => 'Error checking category existence'));
}

$conn->close();

?>