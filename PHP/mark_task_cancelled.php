<?php
include 'connect.php';

session_start();

// Get JSON data from request body
$jsonData = file_get_contents('php://input');

// Decode JSON data into associative array
$requestData = json_decode($jsonData, true);

if (isset($_SESSION['citizen_id'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Check if the required parameters are provided
        if (isset($requestData['task_id'], $requestData['task_type'])) 
        {
            // Access task_id and task_type
            $taskId = $requestData['task_id'];
            $taskType = $requestData['task_type'];
            $rescuerId = $_SESSION['citizen_id'];
            
            // Determine which table to update based on the task type
            $tableName = ($taskType === 'OFFER') ? 'announcements' : 'supply_requests';
            
            // Update the task status to cancelled in the respective table
            $cancelTaskQuery = "UPDATE $tableName SET approved = 0, taken_by = NULL WHERE id = $taskId";
            $cancelTaskResult = mysqli_query($conn, $cancelTaskQuery);
            
            if ($cancelTaskResult) {
                // Return success response
                echo json_encode(['success' => 'Task marked as cancelled.']);
            } else {
                // Return error response if the update fails
                echo json_encode(['error' => 'Failed to cancel task.']);
            }
        } else {
            // Return error response if required parameters are missing
            echo json_encode(['error' => 'Required parameters are missing.']);
        }
    } else {
        // Return error response if the request method is not POST
        echo json_encode(['error' => 'Invalid request method.']);
    }
} else {
    // Return error response if rescuer ID is not found in session
    echo json_encode(['error' => 'Rescuer ID not found in session']);
}
?>
