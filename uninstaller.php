<?php

require_once("messenger.php");

$allgood = TRUE;

$install_sql = "DROP TABLE messages;";
doInstallTask($install_sql, "DROP TABLE messages");
$install_sql = "DROP TABLE users ";
doInstallTask($install_sql, "DROP TABLE users");

allGoodMsg("Un-Install");

$conn->close();
?>
