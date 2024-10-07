<?php

$host = "localhost";
$dbname = "sharehope";
$username = "root";
$password = "";
$port = 3306;

//create connection
$conn = mysqli_connect($host, $username, $password, $dbname, $port);

// Check connection
if (!$conn) 
{
    die("Connection failed: " . mysqli_connect_error());
}

?>