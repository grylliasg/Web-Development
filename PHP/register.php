<?php
session_start();

//Including the connection file:
include 'connect.php';

//Taking the values from the register form:
if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{   
    $firstname = $_POST['fname'];
    $lastname = $_POST['lname'];
    $usrname = $_POST['username'];
    $passcode = $_POST['password'];
    $phone = $_POST['phone']; 
    
    $checkQuery = "SELECT * FROM citizens WHERE username='$usrname'";
    $result = mysqli_query($conn, $checkQuery);
    $insertQuery = "INSERT INTO citizens (id, first_name, last_name, username, passwrd, phone, userType) VALUES (null, '$firstname', '$lastname', '$usrname', '$passcode', '$phone', 'citizen')";

    if($result && mysqli_num_rows($result) > 0)
    {
        echo "taken" . mysqli_error($conn);
        exit();
    }

    //Perform the registration if the username is not taken:
    if(mysqli_query($conn, $insertQuery))
    {
        // Retrieve the ID of the inserted record
        $lastInsertID = mysqli_insert_id($conn);
        // Store the ID in the session
        $_SESSION['lastInsertID'] = $lastInsertID;
        echo "success";
        exit();
    }
    else
    {
        echo "error";
        exit();
    }
}
else
{
     echo "error";
    exit();
}


?>