<?php
include "dbcredentials.php";
$dbc = new PDO("mysql:host=$host;dbname=$dbname", $dbuser, $dbpswd, array(PDO::ATTR_PERSISTENT => true));
?>

<?php
/* TOKEN & LOGIN */

function getLoggedIn($token) {
  /* Returns who is logged in with a given token
  * $token: String: the token to check
  */
  global $dbc;

  $date = date("y.m.d H:i:s", time());
  $q = "SELECT userlogged FROM Access WHERE expire>=? AND token=?";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute(array($date, $token));
  $result = $stmnt->fetch();
  if(!$result) return false;
  return array_key_exists("userlogged", $result) ? $result["userlogged"] : null;
}

function credentialsAreValid($user, $pswd) {
  global $dbc;

  $q = "SELECT * FROM Member WHERE name=? AND pswd=?";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute(array($user, $pswd));
  return $stmnt->fetch() != null;
}

function generateToken($user, $duration) {
  global $dbc;

  $token = "";
  $characters = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890.,-_";
  $tokenLength = 128;
  for ($i=0; $i < $tokenLength; $i++) {
    $token .= $characters{rand(0, strlen($characters)-1)};
  }
  $expire = date("y.m.d H:i:s", time()+$duration);

  $q = "INSERT INTO Access VALUES(?, ?, ?)";
  $stmnt = $dbc->prepare($q);
  if($stmnt->execute(array($token, $user, $expire))) return $token;
}

/* BETTING */

function registerBet($user, $bet, $subject) {
  global $dbc;

  $now = date("y.m.d H:i:s", time());
  $q = "INSERT INTO Bet VALUES(?, ?, ?, ?)";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute(array($user, $bet, $subject, $now));
}

function canBet($user, $subject) {
  global $dbc;

  $q = "SELECT betsOpen FROM Subject WHERE name=?";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute(array($subject));
  if(!$stmnt->fetch()["betsOpen"]) return false;

  $q = "SELECT MAX(date) AS mostrecent FROM Result WHERE subject=?";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute(array($subject));
  $date = $stmnt->fetch()["mostrecent"];

  $q = "SELECT * FROM Bet WHERE better=?";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute(array($user));
  $hasBetBefore = $stmnt->fetch() ? true : false;

  if($date) {
    if($hasBetBefore) {
      $q = "SELECT * FROM Bet WHERE better=? AND date > ?";
      $stmnt = $dbc->prepare($q);
      $stmnt->execute(array($user, $date));
      return !$stmnt->fetch();
    }
    else return true;
  }
  else {
    return !$hasBetBefore;
  }
}

/* GETTERS */

function subjectExists($subject) {
  global $dbc;

  $q = "SELECT * FROM Subject WHERE name=?";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute(array($subject));
  return $stmnt->fetch() != null;
}

function getSubjects() {
  global $dbc;

  $q = "SELECT name FROM Subject";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute();

  $ret = array();
  while (($name = $stmnt->fetch()["name"])) {
    array_push($ret, $name);
  }
  return $ret;
}

function getBetSpots($subject) {
  global $dbc;

  $q = "SELECT betspots FROM Subject WHERE name=?";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute(array($subject));
  $ret = $stmnt->fetch()["betspots"];

  return $ret ? intval($ret) : 0;
}

function getNumberOfStudents() {
  global $dbc;
  $q = "SELECT COUNT(*) AS students FROM Student";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute();
  $ret = $stmnt->fetch()["students"];

  return intval($ret);
}

/* RESULTS */

function availableStudents($subject) {
  global $dbc;

  $subq = "SELECT r.student as namematch, s.name AS student FROM Result r RIGHT JOIN Student s ON r.student=s.name AND r.subject=?";
  $q = "SELECT student FROM ($subq) matches WHERE namematch IS NULL ORDER BY student";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute(array($subject));

  $ret = array();
  while(($student = $stmnt->fetch()["student"])) {
    array_push($ret, $student);
  }
  return $ret;
}

function getBetHistory($user) {
  global $dbc;

  $q = "SELECT student, date FROM Bet WHERE better=? AND subject=? ORDER BY date ASC";
  $stmnt = $dbc->prepare($q);

  $ret = array();
  $subjects = getSubjects();
  for ($i=0; $i < count($subjects); $i++) {
    $s = $subjects[$i];
    $stmnt->execute(array($user, $s));

    $subject_results = array();
    while(($bet = $stmnt->fetch())) {
      if(array_key_exists($bet["date"], $subject_results)) array_push($subject_results[$bet["date"]], $bet["student"]);
      else $subject_results[$bet["date"]] = array($bet["student"]);
    }
    $ret[$s] = $subject_results;
  }
  return $ret;
}

function getResultHistory($subject) {
  global $dbc;

  $q = "SELECT student, date FROM Result WHERE subject=? ORDER BY date ASC";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute(array($subject));

  $ret = array();
  while(($bet = $stmnt->fetch())) {
    if(array_key_exists($bet["date"], $ret)) array_push($ret[$bet["date"]], $bet["student"]);
    else $ret[$bet["date"]] = array($bet["student"]);
  }
  return $ret;
}

function registerResult($student, $subject, $hour) {
  global $dbc;

  $q = "INSERT INTO Result VALUES (?, CURRENT_TIMESTAMP, ?)";
  $stmnt = $dbc->prepare($q);
  $stmnt->execute(array($student, $subject));
}

function getStudentPoints() {
  global $dbc;

  $stmt = $dbc->prepare("SELECT * FROM Bet ORDER BY better, date");
  $stmt->execute();
  $rawBets = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $bets = [];
  $currentBetter = null;
  $betterBets = [];
  $currentDate = null;
  $betDates = [];
  foreach($rawBets as $bet) {
    if($bet["date"] !== $currentDate || $bet["better"] !== $currentBetter) {
      if($currentDate !== null) $betterBets[$currentDate] = $betDates;
      $betDates = [];
      $currentDate = $bet["date"];
    }
    if($bet["better"] !== $currentBetter) {
      if($currentBetter !== null) $bets[$currentBetter] = $betterBets;
      $betterBets = [];
      $currentBetter = $bet["better"];
    }
    array_push($betDates, $bet["student"]);
  }
  $betterBets[$currentDate] = $betDates;
  $bets[$currentBetter] = $betterBets;

  $stmt = $dbc->prepare("SELECT * FROM Result ORDER BY date");
  $stmt->execute();
  $rawResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $results = [];
  $currentDate = null;
  $resultDates = [];
  foreach($rawResults as $result) {
    if($result["date"] !== $currentDate) {
      if($currentDate !== null) $results[$currentDate] = $resultDates;
      $resultDates = [];
      $currentDate = $result["date"];
    }
    array_push($resultDates, $result["student"]);
  }
  $results[$currentDate] = $resultDates;

  $pointsRaw = json_decode(file_get_contents("../assets/config.json"), true)["maxPoints"];
  $points = [];
  foreach(array_keys($pointsRaw) as $key) {
    array_push($points, $pointsRaw[$key]);
  }

  $ret = [];
  $totalStudents = query("SELECT COUNT(*) as totalStudents FROM Student")["totalStudents"];
  $betSpots = query("SELECT betspots FROM Subject WHERE name='ING'")["betspots"];
  foreach(array_keys($bets) as $student) {
    $earnedPoints = 0;
    $closestDate = null;
    $bettableStudents = $totalStudents;
    /**echo "\n\n\n\n\n$student\n";/**/
    foreach(array_keys($bets[$student]) as $betDate) {
      $closestResultDate = null;
      for($i=0; $i < count(array_keys($results)); $i++) {
        $resultDate = array_keys($results)[$i];
        if($betDate < $resultDate) {
          $closestResultDate = $resultDate;
          break;
        }
      }
      if($closestResultDate === null) continue;

      $betsWon = getElementsInCommon($bets[$student][$betDate], $results[$closestResultDate]);
      if($betsWon > 0) {
        $pointsWon = $points[$betsWon-1];
        $proportionalPointsWon = floor(($bettableStudents-$betSpots) /
            ($totalStudents-$betSpots) * $pointsWon);
        $proportionalPointsWon = $proportionalPointsWon > 0 ? $proportionalPointsWon : 0;
        $earnedPoints += $proportionalPointsWon;
        /**echo "$totalStudents\n";/**/
      }
      $bettableStudents -= count($results[$closestResultDate]);
    }
    $ret[$student] = $earnedPoints;
  }
  return json_encode($ret);
}

function getElementsInCommon($arr1, $arr2) {
  $ret = 0;
  foreach($arr1 as $value1) {
    foreach($arr2 as $value2) {
      if($value1 === $value2) $ret++;
    }
  }
  return $ret;
}

function query($q) {
  global $dbc;
  $stmt = $dbc->prepare($q);
  $stmt->execute();
  return $stmt->fetch(PDO::FETCH_ASSOC);
}
