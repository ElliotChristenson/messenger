<?php

require_once("messenger.php");

$allgood = TRUE;

$install_sql = "DROP TABLE IF EXISTS messages;";
doInstallTask($install_sql, "DROP TABLE messages");
$install_sql = "DROP TABLE IF EXISTS users ";
doInstallTask($install_sql, "DROP TABLE users");
$install_sql = "CREATE TABLE messages ";
$install_sql .= "(id int(255) NOT NULL AUTO_INCREMENT PRIMARY KEY,";
$install_sql .= "time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ";
$install_sql .= "ON UPDATE CURRENT_TIMESTAMP,";
$install_sql .= "sender_id int(255) NOT NULL,";
$install_sql .= "recipient_id int(255) NOT NULL,";
$install_sql .= "image_url varchar(255) DEFAULT NULL,";
$install_sql .= "text text NOT NULL";
$install_sql .= ") ENGINE=InnoDB DEFAULT CHARSET=latin1;";
doInstallTask($install_sql, "CREATE TABLE messages");
$install_sql = "CREATE TABLE users ";
$install_sql .= "(id int(255) NOT NULL AUTO_INCREMENT PRIMARY KEY,";
$install_sql .= "username char(16) DEFAULT NULL UNIQUE KEY,";
$install_sql .= "display_name varchar(255) DEFAULT NULL,";
$install_sql .= "image_url varchar(255) DEFAULT NULL";
$install_sql .= ") ENGINE=InnoDB DEFAULT CHARSET=latin1;";
doInstallTask($install_sql, "CREATE TABLE users");

allGoodMsg("Install");

$conn->close();
?>
