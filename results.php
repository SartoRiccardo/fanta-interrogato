<?php
include "modules/dbconnection.php";
session_start();
?>

<?php
$loggedUser = false;
if(isset($_SESSION["token"]) && getLoggedIn($_SESSION["token"])) {
  $loggedUser = getLoggedIn($_SESSION["token"]);
}
if(!$loggedUser) {
  header("Location: index.php");
  die();
}
?>

<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <title>FantaInterrogato</title>
  <link rel="icon" href="assets/favicon.ico" type="image/x-icon">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <script type="text/javascript" src="scripts/results.js"></script>

  <!-- Jquery -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>

  <!-- Google Icons -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <!-- Materializecss -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>

  <style media="screen">
  .container {
    margin: 0 auto;
    max-width: 1280px;
    width: 95%;
    padding: 5px;
  }
  @media only screen and (min-width: 601px) {
    .container {
      width: 95%;
      padding: 15px;
    }
  }
  @media only screen and (min-width: 993px) {
    .container {
      width: 95%;
      padding: 15px;
    }
  }
  nav, .btn, .btn-large{
    background-color: #673ab7 !important;
  }
  .tabs .tab a:focus, .tabs .tab a:focus.active{
    background-color: rgba(154, 103, 234, 0.2);
  }
  .tabs .tab a:hover, .tabs .tab a.active,
  .tabs .tab a{
    color: #9a67ea !important;
  }
  .tabs .indicator{
    background-color: #9a67ea !important;
  }

  h1 {
    margin-top: 1rem;
  }

  img {
    margin-bottom: 2rem;
  }

  .winner {
    position: relative;
    width: 100%;
  }

  .winner::after {
    content: "";
    clear: both;
    display: table;
  }

  .winner h1 {
    display:inline-block;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    margin-left: 1rem;
  }

  .congratulations-med {
    float: right;
    margin: 0;
    margin-right: 1rem;
  }
  </style>
</head>
<body onload="setup()" class="grey lighten-3">

  <div class="navbar-fixed">
    <nav>
      <div class="container" style="padding: 0px;">
        <div class="nav-wrapper">
          <a href="#" class="brand-logo left"><i class="material-icons">dashboard</i>FANTA-INTERROGATO</a>
        </div>
      </div>
    </nav>
  </div>

  <div class="container white z-depth-3" style="margin-top: 30px; margin-bottom: 30px">
    <h3 class="center">Fanta Interrogato</h3>
    <p  class="center" style="padding-top: 10px; padding-bottom: 10px;">
      Al Fanta-Interrogato&reg; potete scommettere su chi sarà interrogato in una
      determinata materia, e guadagnare punti se ci azzeccate. A fine giro di interrogazioni,
      chi avrà più punti vincerà <b>un buono di €2 da spendere al bar, da MolinariPanini&trade;
      o in qualche macchinetta del Marconi.</b>
      <br><br>
      Ave, o vincitore del FantaInterrogato&reg; Che hai vinto €2 che non puoi
      neanche usare.
    </p>
    <div class="divider"></div>

    <div id="container"></div>

    <footer>
      <p>&copy; 2020 - Sartori & Bragastini</p>
    </footer>
    <!--<a href="login.php">Logga in</a>-->

  </div>
</body>
</html>
