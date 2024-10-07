<?php

include 'connect.php';

// Handle get to retrieve base pin location
if ($_SERVER['REQUEST_METHOD'] === 'GET') 
{
    // Retrieve the base pin location from the database
    $sql = "SELECT latitude, longitude FROM base_pin WHERE id = 1";
    $basePin_result = mysqli_query($conn, $sql);

    if ($basePin_result && mysqli_num_rows($basePin_result) > 0)
    {
        $basePin = mysqli_fetch_assoc($basePin_result);
        echo json_encode($basePin);
    }
    else
    {
        echo "error";
    }
}

?>