<?php
session_start();

//Including the connection file:
include 'connect.php';

//Taking the values from the register form:
if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{   
    $firstname = $_POST['rescuerName'];
    $lastname = $_POST['rescuerSurname'];
    $usrname = $_POST['rescuerUsername'];
    $passcode = $_POST['password'];
    $phone = $_POST['rescuerPhone'];
    
    // Insert the data into the database
    $insertQuery = "INSERT INTO citizens (id, first_name, last_name, username, passwrd, phone, userType) VALUES (null, '$firstname', '$lastname', '$usrname', '$passcode', '$phone', 'rescuer')";

    if ($conn->query($insertQuery) === TRUE)
    {
        // Successfully inserted into the database
        $response = array("status" => "success", "message" => "Rescuer account created successfully");
        // Retrieve the ID of the inserted record
        $lastInsertID = mysqli_insert_id($conn);
        // Store the ID in the session
        $_SESSION['lastInsertID'] = $lastInsertID;
        echo json_encode($response);
        exit();
    }
    else
    {
        // Error inserting into the database
        $response = array("status" => "error", "message" => "Error creating rescuer account");
        echo json_encode($response);
    }
}
?>