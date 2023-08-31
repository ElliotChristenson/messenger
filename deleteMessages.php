<?php
require_once("messenger.php");

$raw_message_data = file_get_contents('php://input');
debugIt("raw_message_data: " . $raw_message_data);

$message_data = json_decode($raw_message_data);
error_log($message_data->message_sender);
$message_sender = scrubIt($message_data->message_sender);
debugIt("message_sender: " . $message_sender);

$message_recipient = scrubIt($message_data->message_recipient);
debugIt("message_recipient: " . $message_recipient);


/* SELECT id FROM users WHERE username='elliot' LIMIT 1; */

$sender_sql = "SELECT id FROM users WHERE ";
$sender_sql .= "username='". $message_sender."' LIMIT 1;";
$sender_id = $conn->query($sender_sql)->fetch_assoc()["id"];
debugIt("sender_id: " . $sender_id);
$recipient_sql = "SELECT id FROM users where ";
$recipient_sql .= "username='". $message_recipient."' LIMIT 1;";
$recipient_id = $conn->query($recipient_sql)->fetch_assoc()["id"];
debugIt("recipient_id: " . $recipient_id);

/* INSERT INTO messages ('sender_id','recipient_id','text')
VALUES ('elliot','gina','this is the message'); */

$message_sql = "DELETE FROM messages ";
$message_sql .=" WHERE `sender_id`=".$sender_id;
$message_sql .=" AND `recipient_id`=".$recipient_id.";";
debugIt("message_sql: ". $message_sql );
$conn->query($message_sql);
$message_sql = "DELETE FROM messages ";
$message_sql .=" WHERE `recipient_id`=".$sender_id;
$message_sql .=" AND `sender_id`=".$recipient_id.";";
debugIt("message_sql: ". $message_sql );
$conn->query($message_sql);
$conn->close();
?>
