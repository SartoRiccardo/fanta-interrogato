<?php
include "dbconnection.php";
session_start();
?>

<?php
function getSelectOptions() {
  $ret = array();

  $subjects = getSubjects();
  foreach ($subjects as $s) {
    $sData = array();
    $sData["students"] = availableStudents($s);
    $sData["betspots"] = getBetSpots($s);
    $ret[$s] = $sData;
  }

  return $ret;
}
?>

<?php
$request = explode("=", file_get_contents("php://input"))[1];
header("Content-Type: application/json");
switch ($request) {
  case "choosers":
    echo json_encode(getSelectOptions(), JSON_PRETTY_PRINT);
    break;

  case "allStudents":
    echo getNumberOfStudents();
    break;

  case "maxPoints":
    $path = "../assets/config.json";
    $fin = fopen($path, "r");
    $content = fread($fin, filesize($path));
    fclose($fin);
    $vars = json_decode($content, true);
    echo json_encode($vars["maxPoints"], JSON_PRETTY_PRINT);
    break;

  case "results":
    $subjects = getSubjects();
    $ret = array();
    foreach ($subjects as $s) {
      $ret[$s] = getResultHistory($s);
    }
    echo json_encode($ret, JSON_PRETTY_PRINT);
    break;

  case "bets":
    if(isset($_SESSION["token"]) && getLoggedIn($_SESSION["token"])) {
      echo json_encode(getBetHistory(getLoggedIn($_SESSION["token"])), JSON_PRETTY_PRINT);
    }
    break;

  case "canBet":
    $subjects = getSubjects();
    $ret = array();
    foreach ($subjects as $s) {
      if(isset($_SESSION["token"]) && getLoggedIn($_SESSION["token"])) {
        $ret[$s] = canBet(getLoggedIn($_SESSION["token"]), $s);
      }
    }
    echo json_encode($ret, JSON_PRETTY_PRINT);
    break;

  case "isLoggedIn":
    echo isset($_SESSION["token"]) && getLoggedIn($_SESSION["token"]) ? "true" : "false";
    break;

  /*default:
  header("Location: ../");
  die();*/
}
?>
