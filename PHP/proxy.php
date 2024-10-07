<?php
// Set the target URL
$targetUrl = 'http://usidas.ceid.upatras.gr/web/2023/export.php';

// Set the appropriate headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Fetch the data from the target URL
$data = file_get_contents($targetUrl);

// Output the data
echo $data;
?>