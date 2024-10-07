<?php

//Start session to send the id of the logged in person (to submit_request.php)
session_start();

//Including the connection file:
include 'connect.php';

$username = $_POST['username'];
$passcode= $_POST['password'];

$query = "SELECT * FROM citizens WHERE username='$username' AND passwrd='$passcode'";

$result = mysqli_query($conn, $query);

if($result)
{
    $num = mysqli_num_rows($result);
    if($num > 0)
    {
        $row = mysqli_fetch_assoc($result);

        // Send $citizen_id to submit_request.php
        $citizen_id = $row['id'];
        $_SESSION['citizen_id'] = $citizen_id;

        $userType = $row['userType']; 

        if($userType == "citizen")
        {
            echo "citizen";
            exit();
        }
        else if($userType == "rescuer")
        {
            echo "rescuer";
            exit();
        }
        else if($userType == "admin")
        {
            echo "admin";
            exit();
        }
    }
    
    if(mysqli_query($conn, $insertQuery))
    {
        // Retrieve the ID of the inserted record
        $lastInsertID = mysqli_insert_id($conn);
        // Store the ID in the session
        $_SESSION['lastInsertID'] = $lastInsertID;

        // Retrieve the ID of the inserted record
        $lastloggedID = mysqli_insert_id($conn);
        // Store the ID in the session
        $_SESSION['lastloggedID'] = $lastloggedID;

        // Retrieve the ID of the inserted record
        $LasttloggedID = mysqli_insert_id($conn);
        // Store the ID in the session
        $_SESSION['LasttloggedID'] = $LasttloggedID;

        $rescuersID = mysqli_insert_id($conn);
        $_SESSION['rescuersID'] = $rescuersID;

        echo "success";
        exit();
    }
    else
    {
        echo "error";
        exit();
    }
}
?>