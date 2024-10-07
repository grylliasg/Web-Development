<?php
include 'connect.php';

session_start();

// Retrieve the lastInsertID from the session
if(isset($_SESSION['citizen_id'])) {
    $lastloggedID = $_SESSION['citizen_id'];
} else {
    echo json_encode(['error' => 'Last ID not found in session']);
    exit;
}

// Check if the request is for loading or unloading
$action = isset($_POST['action']) ? $_POST['action'] : '';

$response = array();

if ($action === 'load') 
{
    // Get product details from the request
    $productCategory = isset($_POST['category']) ? $_POST['category'] : '';
    $productName = isset($_POST['product']) ? $_POST['product'] : '';
    $quantityToLoad = isset($_POST['quantity']) ? $_POST['quantity'] : 0;

    $retrieveCategoryID = "SELECT id FROM categories WHERE name = '$productCategory'";
    $categoryIDResult = $conn->query($retrieveCategoryID);
    

    if ($categoryIDResult && $categoryIDResult->num_rows > 0) 
    {
        $row = $categoryIDResult->fetch_assoc();
        $categoryID = $row['id'];

        // Check if the product exists in the base inventory
        $checkProductQuery = "SELECT id, quantity FROM products WHERE category_id = '$categoryID' AND name = '$productName'";
        $checkProductResult = $conn->query($checkProductQuery);

        if ($checkProductResult && $checkProductResult->num_rows > 0)
        {
            // Product exists, update quantity in base inventory
            $row = $checkProductResult->fetch_assoc();
            $productId = $row['id'];
            $baseQuantity = $row['quantity'];

            if ($quantityToLoad <= $baseQuantity) 
            {
                // Calculate new quantity in base inventory
                $newBaseQuantity = $baseQuantity - $quantityToLoad;

                // Update quantity in base inventory
                $updateBaseQuery = "UPDATE products SET quantity = $newBaseQuantity WHERE id = $productId";
                $updateBaseResult = $conn->query($updateBaseQuery);

                if ($updateBaseResult) 
                {
                    // Insert or update quantity in rescuer's inventory
                    $loadRescuerQuery = "INSERT INTO rescuer_inventory (id, category_id, product, quantity, rescuer_id)
                    VALUES ($productId, '$categoryID', '$productName', $quantityToLoad, $lastloggedID)
                    ON DUPLICATE KEY UPDATE 
                        quantity = CASE WHEN rescuer_id = $lastloggedID THEN quantity + $quantityToLoad ELSE quantity END;
                    ";
                        $loadRescuerResult = $conn->query($loadRescuerQuery);

                    if ($loadRescuerResult) 
                    {
                        $response['status'] = 'success';
                        $response['message'] = 'Product successfully loaded to your inventory.';
                    } 
                    else 
                    {
                        $response['status'] = 'error';
                        $response['message'] = "Error updating rescuer's inventory: " . $conn->error;
                    }
                } 
                else 
                {
                    $response['status'] = 'error';
                    $response['message'] = "Error updating base inventory: " . $conn->error;
                }
            } 
            else
            {
                $response['status'] = 'error';
                $response['message'] = 'Not enough quantity in the base inventory.';
            }
        } 
        else 
        {
            $response['status'] = 'error';
            $response['message'] = 'Product not found in the base inventory.';
        }
    }
    else 
    {
        $response['status'] = 'error';
        $response['message'] = 'Category not found.';
        echo json_encode($response);
        exit;
    }
} 
elseif ($action === 'unload') 
{
    // Unload items from rescuer_inventory to base inventory (products)

    // Fetch items from the rescuer's inventory
    $getRescuerInventoryQuery = "SELECT * FROM rescuer_inventory WHERE rescuer_id = $lastloggedID";
    $rescuerInventoryResult = $conn->query($getRescuerInventoryQuery);

    if ($rescuerInventoryResult) 
    {
        // Fetch each row and insert into the base inventory
        while ($row = $rescuerInventoryResult->fetch_assoc()) 
        {
            $productId = $row['id'];
            $quantity = $row['quantity'];

            // Insert or update quantity in base inventory (products)
            $unloadBaseQuery = "INSERT INTO products (id, quantity) VALUES ($productId, $quantity)
            ON DUPLICATE KEY UPDATE quantity = quantity + $quantity";
            $unloadBaseResult = $conn->query($unloadBaseQuery);

            if (!$unloadBaseResult) 
            {
                // Handle the error if needed
                $response['status'] = 'error';
                $response['message'] = "Error unloading items to base inventory: " . $conn->error;
                echo json_encode($response);
                exit;
            }
        }
        // Clear the rescuer's inventory
        $clearRescuerInventoryQuery = "DELETE FROM rescuer_inventory WHERE rescuer_id = $lastloggedID";
        $clearRescuerInventoryResult = $conn->query($clearRescuerInventoryQuery);

        if ($clearRescuerInventoryResult) {
            $response['status'] = 'success';
            $response['message'] = 'Items successfully unloaded to the base inventory.';
        } else {
            $response['status'] = 'error';
            $response['message'] = "Error clearing rescuer's inventory: " . $conn->error;
        }
    } else {
        $response['status'] = 'error';
        $response['message'] = "Error fetching rescuer's inventory: " . $conn->error;
    }
} 
elseif ($action === 'show') 
{
    
    
    $getBaseInventoryQuery = "SELECT product, quantity FROM rescuer_inventory WHERE rescuer_id = $lastloggedID";
    $baseInventoryResult = $conn->query($getBaseInventoryQuery);

    if ($baseInventoryResult) {
        $baseInventoryData = array();

        while ($row = $baseInventoryResult->fetch_assoc()) {
            $baseInventoryData[] = array(
            'product' => $row['product'],
            'quantity' => $row['quantity']
            );
        }

        $response['status'] = 'success';
        $response['data'] = $baseInventoryData;
    } else {
        $response['status'] = 'error';
        $response['message'] = "Error fetching base inventory: " . $conn->error;
    }
} else {
    $response['status'] = 'error';
    $response['message'] = 'Invalid action.';
}

// Close the database connection
$conn->close();

// Send the JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>