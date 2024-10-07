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
        if (isset($requestData['task_id'], $requestData['task_type'])) {
            $taskId = $requestData['task_id'];
            $taskType = $requestData['task_type'];
            $rescuerId = $_SESSION['citizen_id'];
            
            // Determine which table to update based on the task type
            $tableName = ($taskType === 'OFFER') ? 'announcements' : 'supply_requests';

            // Start transaction
            mysqli_begin_transaction($conn);
            
            try {
                // Handle task update
                $updateTaskQuery = "UPDATE $tableName SET processed = 1, taken_by = NULL WHERE id = $taskId";
                $updateTaskResult = mysqli_query($conn, $updateTaskQuery);

                if (!$updateTaskResult) {
                    throw new Exception('Failed to update task status.');
                }
                
                // Variables to determine if update succeeded
                $inventoryUpdateSucceeded = false;

                if ($tableName === 'announcements') {
                    // Retrieve task details
                    $taskDetailsQuery = "SELECT category, product, quantity FROM $tableName WHERE id = $taskId";
                    $taskDetailsResult = mysqli_query($conn, $taskDetailsQuery);

                    if ($taskDetailsResult && mysqli_num_rows($taskDetailsResult) > 0) {
                        $taskDetails = mysqli_fetch_assoc($taskDetailsResult);
                        $category = $taskDetails['category'];
                        $product = $taskDetails['product'];
                        $quantity = $taskDetails['quantity'];

                        // Retrieve category_id from categories table
                        $categoryQuery = "SELECT id FROM categories WHERE name = '$category'";
                        $categoryResult = mysqli_query($conn, $categoryQuery);

                        if ($categoryResult && mysqli_num_rows($categoryResult) > 0) {
                            $categoryData = mysqli_fetch_assoc($categoryResult);
                            $categoryId = $categoryData['id'];

                            // Check if product exists in rescuer_inventory
                            $productExistsQuery = "SELECT id FROM rescuer_inventory WHERE product = '$product' AND rescuer_id = $rescuerId";
                            $productExistsResult = mysqli_query($conn, $productExistsQuery);

                            if ($productExistsResult && mysqli_num_rows($productExistsResult) > 0) {
                                // Product exists, update quantity
                                $updateRescuerInventoryQuery = "UPDATE rescuer_inventory SET quantity = quantity + $quantity WHERE product = '$product' AND rescuer_id = $rescuerId";
                                $inventoryUpdateResult = mysqli_query($conn, $updateRescuerInventoryQuery);
                                $inventoryUpdateSucceeded = $inventoryUpdateResult;
                            } else {
                                // Product does not exist, insert new record
                                $insertRescuerInventoryQuery = "INSERT INTO rescuer_inventory (category_id, product, quantity, rescuer_id) VALUES ('$categoryId', '$product', $quantity, $rescuerId)";
                                $inventoryUpdateResult = mysqli_query($conn, $insertRescuerInventoryQuery);
                                $inventoryUpdateSucceeded = $inventoryUpdateResult;
                            }
                        } else {
                            throw new Exception('Category not found.');
                        }
                    } else {
                        throw new Exception('Task details not found.');
                    }
                } else if ($tableName === 'supply_requests') {
                    $taskDetailsQuery = "SELECT product, numofPersons FROM $tableName WHERE id = $taskId";
                    $taskDetailsResult = mysqli_query($conn, $taskDetailsQuery);

                    if ($taskDetailsResult && mysqli_num_rows($taskDetailsResult) > 0) {
                        $taskDetails = mysqli_fetch_assoc($taskDetailsResult);
                        $product = $taskDetails['product'];
                        $quantity = $taskDetails['numofPersons'];

                        $productExistsQuery = "SELECT id, quantity FROM rescuer_inventory WHERE product = '$product' AND rescuer_id = $rescuerId";
                        $productExistsResult = mysqli_query($conn, $productExistsQuery);

                        if ($productExistsResult && mysqli_num_rows($productExistsResult) > 0) {
                            $productData = mysqli_fetch_assoc($productExistsResult);
                            if ($productData['quantity'] >= $quantity) {
                                // Update vehicle load
                                $updateRescuerInventoryQuery = "UPDATE rescuer_inventory SET quantity = quantity - $quantity WHERE product = '$product' AND rescuer_id = $rescuerId";
                                $inventoryUpdateResult = mysqli_query($conn, $updateRescuerInventoryQuery);
                                $inventoryUpdateSucceeded = $inventoryUpdateResult;
                            } else {
                                throw new Exception('Not enough products in the inventory.');
                            }
                        } else {
                            throw new Exception('Product does not exist in inventory.');
                        }
                    } else {
                        throw new Exception('Task details not found.');
                    }
                }

                // Check if inventory update was successful
                if (!$inventoryUpdateSucceeded) {
                    throw new Exception('Failed to update inventory.');
                }

                // Commit transaction
                mysqli_commit($conn);
                echo json_encode(['success' => 'Task marked as completed.']);
            } catch (Exception $e) {
                // Rollback transaction on error
                mysqli_rollback($conn);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['error' => 'Required parameters are missing.']);
        }
    } else {
        echo json_encode(['error' => 'Invalid request method.']);
    }
} else {
    echo json_encode(['error' => 'Rescuer ID not found in session']);
}
?>
