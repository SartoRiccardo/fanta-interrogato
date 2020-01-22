<?php
include "modules/dbconnection.php";
session_start();
?>

<?php
function redirectIndex() {
  header("Location: ./");
  die();
}
?>

<?php
if(isset($_SESSION["token"]) && getLoggedIn($_SESSION["token"])) {
  redirectIndex();
}

if(isset($_POST["user"]) && isset($_POST["pswd"])) {
  if(credentialsAreValid($_POST["user"], $_POST["pswd"])) {
    $expireIn = 60*60;
    $token = generateToken($_POST["user"], $expireIn);
    if($token) {
      $_SESSION["token"] = $token;
    }
  }
}

redirectIndex();
?>
