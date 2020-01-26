let selectData, maxPoints, betHistory, canBet, resultHistory, studentNumber;

function setup() {
  let loggedIn;
  ajax("isLoggedIn", function() {
    if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      loggedIn = JSON.parse(this.responseText);
    }
  });

  while(loggedIn == null);

  if(loggedIn) {
    ajax("choosers", function() {
      if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        selectData = JSON.parse(this.responseText);
      }
    });

    ajax("maxPoints", function() {
      if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        maxPoints = JSON.parse(this.responseText);
      }
    });

    ajax("results", function() {
      if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        resultHistory = JSON.parse(this.responseText);
      }
    });

    ajax("allStudents", function() {
      if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        studentNumber = parseInt(this.responseText);
      }
    });

    ajax("bets", function() {
      if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        betHistory = JSON.parse(this.responseText);
      }
    });

    ajax("canBet", function() {
      if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        canBet = JSON.parse(this.responseText);
      }
    });

    makeContainers();

    $(document).ready(function(){
      $('.tabs').tabs();
      $('select').formSelect();
    });
  }
  else {
    makeLogin();
  }
}

function ajax(data, func) {
  let request = new XMLHttpRequest();
  request.onreadystatechange = func;
  request.open("POST", "modules/data.php", false);
  request.send("request=" + data);
}

function makeContainers() {
  let tabs = [];
  let content = [];
  for(let i = 0; i < Object.keys(selectData).length; i++) {
    let subject = Object.keys(selectData)[i];

    tabs.push({
      subject: subject,
      label: subject,
    });

    content.push(
      <SubjectContent
        selectData={selectData[subject]}
        betHistory={betHistory[subject]}
        resultHistory={resultHistory[subject]}
        maxPoints={maxPoints}
        subject={subject}
        canBet={canBet}
        studentNumber={studentNumber}
        key={subject}
      />
    );
  }

  let tabContainer = document.getElementById("tab-container");
  ReactDOM.render(
    <Navbar subjects={tabs} />,
    tabContainer
  );

  let inside = document.getElementById("container");
  ReactDOM.render(content, inside);
}

function makeLogin() {
  const inside = document.getElementById("container");
  ReactDOM.render(<Login />, inside);
}

// Functions //

function compareDates(d1str, d2str) {
  let d1 = new Date(d1str.replace(" ", "T"));
  let d2 = new Date(d2str.replace(" ", "T"));

  if(d1 > d2) return 1;
  else if(d1 < d2) return -1;
  else return 0;
}

function getPoints(subject, bets, results) {
  let ret = 0;
  for (let i = 0; i < Object.keys(bets).length; i++) {
    let betDate = Object.keys(bets)[i];
    let studentsLeft = studentNumber;
    for (let j = 0; j < Object.keys(results).length; j++) {
      let resultDate = Object.keys(results)[j];

      // Nearest result date
      if(compareDates(resultDate, betDate) >= 0) {
        let betSpots = selectData[subject].betspots;
        // Calculate points
        for (let k = 0; k <= j; k++) {
          let wins = getMatches(results[Object.keys(results)[k]], bets[Object.keys(bets)[i]]);
          if(wins > 0){
            let pointType = Object.keys(maxPoints)[wins-1];
            ret += Math.floor((studentsLeft-betSpots) / (studentNumber-betSpots) * maxPoints[pointType]);
            // (y-y0)/(y1-y0) = (x-x0)/(x-x1), formula inversa per y
          }
          studentsLeft -= results[Object.keys(results)[k]].length;
        }
        break;
      }
    }
  }
  return ret;
}

function getMatches(arr1, arr2) {
  let ret = 0;
  for (let i = 0; i < arr1.length; i++) {
    for (let j = 0; j < arr2.length; j++) {
      if(arr1[i] == arr2[j]) ret++;
    }
  }
  return ret;
}

setup();
