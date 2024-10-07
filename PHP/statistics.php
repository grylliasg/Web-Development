<?php

include 'connect.php';

if (isset($_POST['startDate'])) {
    $startDate = $_POST['startDate'];
}

if (isset($_POST['endDate'])) {
    $endDate = $_POST['endDate'];
}

$responseData = array();

// Fetch category names from the categories table
$sql = "SELECT COUNT(id) AS notApprReqCount FROM supply_requests WHERE approved = 0 AND registration_date BETWEEN '$startDate' AND '$endDate'";
$result = $conn->query($sql);

if ($result) {
    // Fetch the data from the result set
    while ($row = $result->fetch_assoc()) {

        $responseData["notApprReqCount"] = $row['notApprReqCount'];
    }
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$sql1 = "SELECT COUNT(id) AS notApprOffCount FROM announcements WHERE approved = 0 AND registration_date BETWEEN '$startDate' AND '$endDate'";
$result1 = $result = $conn->query($sql1);

if ($result1) {
    // Fetch the data from the result set
    while ($row = $result->fetch_assoc()) {

        $responseData["notApprOffCount"] = $row['notApprOffCount'];
    }
} else {
    echo "Error: " . $sql1 . "<br>" . $conn->error;
}

$sql2 = "SELECT COUNT(id) AS processedOffCount FROM announcements WHERE processed = 1 AND registration_date BETWEEN '$startDate' AND '$endDate'";
$result2 = $result = $conn->query($sql2);

if ($result2) {
    // Fetch the data from the result set
    while ($row = $result->fetch_assoc()) {

        $responseData["processedOffCount"] = $row['processedOffCount'];
    }
} else {
    echo "Error: " . $sql2 . "<br>" . $conn->error;
}

$sql3 = "SELECT COUNT(id) AS processedReqCount FROM supply_requests WHERE processed = 1 AND registration_date BETWEEN '$startDate' AND '$endDate'";
$result3 = $result = $conn->query($sql3);

if ($result3) {
    // Fetch the data from the result set
    while ($row = $result->fetch_assoc()) {

        $responseData["processedReqCount"] = $row['processedReqCount'];
    }
} else {
    echo "Error: " . $sql3 . "<br>" . $conn->error;
}

echo json_encode($responseData);
// Close the database connection
$conn->close();
?>