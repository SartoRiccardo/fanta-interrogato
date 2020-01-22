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
if(!(isset($_POST["subject"]) && subjectExists($_POST["subject"])
&& isset($_SESSION["token"]) && getLoggedIn($_SESSION["token"])
&& canBet(getLoggedIn($_SESSION["token"]), $_POST["subject"]))) {
  redirectIndex();
}

$bets = array();
$user = getLoggedIn($_SESSION["token"]);
$date = date("y.m.d h:i:s", time());

$betNumber = getBetSpots($_POST["subject"]);
for ($i=0; $i < $betNumber; $i++) {
  if(!isset($_POST["bet$i"]) || in_array($_POST["bet$i"], $bets) || $_POST["bet$i"] == "0") {
    redirectIndex();
  }
  array_push($bets, $_POST["bet$i"]);
}

for ($i=0; $i < count($bets); $i++) {
  registerBet($user, $bets[$i], $_POST["subject"], $date);
}

redirectIndex();
?>
