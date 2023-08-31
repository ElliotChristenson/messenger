<?php

require_once("messenger.php");

class Message {
    public $id = "";
    public $time  = "";
    public $sender_id = "";
    public $recipient_id = "";
    public $image_url = "";
    public $text = "";
    public $username = "";
}

function getVal($field) {
    if (isset($_REQUEST[$field])) {
      $value = scrubIt($_REQUEST[$field]);
      debugIt($field . ": " . $value);
    }
    return $value ? $value : 0;
}

//empty array where messages will be stored
$messages = array();

$sender = getVal("sender");
$recipient = getVal("recipient");
$newest_message = getVal("newest_message");

if ( isset($recipient) and isset($sender)) {
  $update_sender_sql = "INSERT INTO users (`username`) VALUES ('".$sender."') ";
  $update_sender_sql .= "ON DUPLICATE KEY UPDATE `username` = `username`;";
  $conn->query($update_sender_sql);
  $sender_sql = "SELECT id FROM users where username='". $sender."';";
  $sender_id = $conn->query($sender_sql)->fetch_assoc()["id"];
  $update_recipient_sql = "INSERT INTO users (`username`) VALUES ('".$recipient."') ";
  $update_recipient_sql .= "ON DUPLICATE KEY UPDATE `username` = `username`;";
  $conn->query($update_recipient_sql);
  $recipient_sql = "SELECT id FROM users where username='". $recipient."';";
  $recipient_id = $conn->query($recipient_sql)->fetch_assoc()["id"];

  $sql = "SELECT messages.id, messages.time, messages.recipient_id, ";
  $sql .= "messages.sender_id, ";
  $sql .= "messages.image_url, messages.text, users.username ";
  $sql .= "FROM messages LEFT JOIN users ";
  $sql .= "ON messages.sender_id=users.id WHERE ";
  $sql .= "( messages.sender_id='".$sender_id."' OR ";
  $sql .= "messages.sender_id='".$recipient_id."') ";
  $sql .= "AND ( messages.recipient_id='".$sender_id."' ";
  $sql .= "OR messages.recipient_id='".$recipient_id."') ";
  $sql .= "AND (messages.id > '".$newest_message."');";
  debugIt("sql: $sql");
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
      // output data of each row
      while($row = $result->fetch_assoc()) {
        $message = new Message();
        $message->id = scrubIt($row["id"]);
        $message->time = scrubIt(strtotime($row["time"]));
        $message->sender_id = scrubIt($row["sender_id"]);
        $message->username = scrubIt($row["username"]);
        $message->recipient_id = scrubIt($row["recipient_id"]);
        $message->image_url = scrubIt($row["image_url"]);
        $message->text = scrubIt($row["text"]);
        $messages[] = scrubIt($message);
      }
  }
  header('Content-Type: application/json');
  echo json_encode($messages);
}
$conn->close();
?>
