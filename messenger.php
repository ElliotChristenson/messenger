<?php
//** Contains code common to "getMessages" and "sendMessages"

require_once("credentials.php");

$GLOBALS['debug_on'] = true;

function scrubIt($item = "") {
    // you could put some additional validation code in here.
    // don't trust users!
    return $item;
}

function debugIt($item) {
    if(isset($GLOBALS['debug_on'])) {
        if ($GLOBALS['debug_on']) {
            if (isset($item)) {
                error_log($item);
            }
        }
    }
}

function doInstallTask($query,$task = "") {
    global $conn;
    global $allgood;
    if ($task == "") {
        $task = $query;
    }
    if ($result = $conn->query($query)) {
        echo $task . ": Successful<br>";
    } else {
        error_log($task . ": Failed");
        echo $task . ": Failed<br>";
        echo "<h1>Query</h1>";
        echo "<pre>".$query."</pre>";
        $allgood = FALSE;
    }
}

function allGoodMsg($install_type) {
    global $allgood;
    if ($allgood) {
        echo "<h1>" . $install_type . " Looks Good!</h1>";
    } else {
        echo "<h1 style=\"color: red;\">" . $install_type . " Failed! Check What's Up!</h1>";
    }
}

// Create connection
$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>