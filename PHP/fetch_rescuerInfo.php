<?php

session_start();

include 'connect.php';

if(isset($_SESSION['citizen_id']))
{
    $rescuersID = $_SESSION['citizen_id'];
} 
else 
{
    echo json_encode(['error' => 'Rescuer ID not found in session']);
    exit;

}

if($_SERVER['REQUEST_METHOD'] === 'GET')
{
    $selectQuery = "SELECT first_name, last_name FROM citizens WHERE id=$rescuersID";
    $result = mysqli_query($conn, $selectQuery);

    if($result)
    {
        $row = mysqli_fetch_assoc($result);
        echo json_encode($row);
    }
}

?>