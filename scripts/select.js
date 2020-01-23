let selectData, maxPoints, betHistory, canBet, resultHistory;
let studentNumber;
let betters, selectedIndexes;

/* Setup Functions */

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

    //makeContainers();
    testReact();

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
  let inside = document.getElementById("container");

  betters = [];
  selectedIndexes = [];
  for(let i = 0; i < Object.keys(selectData).length; i++) {
    let subject = Object.keys(selectData)[i];

    let tabContainer = document.getElementById("tab-container");
    let tabRow = document.createElement("DIV");
    tabRow.className = "row";
    tabRow.style.paddingTop = "20px";
    tabContainer.appendChild(tabRow);

    let tabCol = document.createElement("DIV");
    tabCol.className = "col s12";
    tabRow.appendChild(tabCol);

    let tabList = document.createElement("UL");
    tabList.className = "tabs";
    tabCol.appendChild(tabList);
    tabList.appendChild(makeTab(subject, subject));

    inside.appendChild(makeContent(subject));
  }
}

function makeLogin() {
  const inside = document.getElementById("container");
  ReactDOM.render(<Login />, inside);
}

function testReact() {
  const inside = document.getElementById("react-test");
  ReactDOM.render(
    <BettingForm options={selectData.ING.students} subject={"ING"} betspots={4}/>,
    inside
  )
}

/* HTML */

function makeTab(subject, label) {
  let tab = document.createElement("LI");
  tab.className = "tab col s3";
  let tablink = document.createElement("A");
  tablink.href = "#tab-" + subject;
  tablink.innerHTML = label;

  tab.appendChild(tablink);
  return tab;
}

function makeContent(subject) {
  let ret = document.createElement("DIV");
  ret.id = "tab-" + subject;

  if(canBet[subject]) {
    /*
    let form = document.createElement("FORM");
    form.method = "post";
    form.action = "submit.php";
    ret.appendChild(form);

    let hidden = document.createElement("INPUT");
    hidden.type = "hidden";
    hidden.name = "subject";
    hidden.value = subject;
    form.appendChild(hidden);

    let selectContainer = document.createElement("DIV");
    selectContainer.className = "row";
    selectContainer.style.paddingTop = "20px";

    let subjectBetters = [];
    let subjectSelected = [];
    for(let i = 0; i < selectData[subject]["betspots"]; i++) {
      let selectColumn = document.createElement("DIV");
      selectColumn.className = "input-field col m3 s12";
      selectContainer.appendChild(selectColumn);
      *

      let selector = makeSelector(selectData[subject]["students"], "bet"+i);
      selector.onchange = function() {
        disableSelected(subject, i);
      }
      subjectBetters.push(selector);
      subjectSelected.push(null);
      selectColumn.appendChild(selector);

      let label = document.createElement("LABEL");
      label.innerHTML = "Vittima #" + (i+1);
      selectColumn.appendChild(label)
    }
    betters[subject] = subjectBetters;
    selectedIndexes[subject] = subjectSelected;
    form.appendChild(selectContainer);

    /*
    let btnRow = document.createElement("DIV");
    btnRow.className = "row";
    form.appendChild(btnRow);

    let btnCol = document.createElement("DIV");
    btnCol.className = "col s12 center";
    btnRow.appendChild(btnCol);

    let btn = document.createElement("BUTTON");
    btn.innerHTML = "Invia";
    btn.className = "btn waves-effect waves-light btn-large";
    btn.type = "submit";
    btnCol.appendChild(btn);*/

    ReactDOM.render(<Divider />, ret);
  }

  ret.appendChild(makePointsTable(subject));

  ReactDOM.render(<Divider />, ret);

  ReactDOM.render(
    <BetHistory
      subject={subject}
      columns={selectData[subject].betspots}
      bets={betHistory[subject]}
      results={resultHistory[subject]}
    />,
    ret
  );

  return ret;
}

function makeSelector(options, name) {
  /*
  let ret = document.createElement("SELECT");
  ret.name = name;

  let optDefault = document.createElement("OPTION");
  optDefault.innerHTML = "Scegli";
  optDefault.value = 0;
  optDefault.disabled = true;
  optDefault.selected = true;
  ret.add(optDefault);

  for(let i = 0; i < options.length; i++) {
    let o = document.createElement("OPTION");
    o.innerHTML = options[i];
    o.value = options[i];
    ret.add(o);
  }
  */

  return document.createElement("SELECT");
}

function makePointsTable(subject) {
  let ret = document.createElement("DIV");
  ret.className = "row";

  let container = document.createElement("DIV");
  container.className = "col s12";
  ret.appendChild(container);

  let title = document.createElement("H4");
  title.innerHTML = "Legenda";
  container.appendChild(title);

  let table = document.createElement("TABLE");
  table.className = "striped responsive-table";

  let thead = document.createElement("THEAD");
  thead.appendChild(makeTableRow(["Tipologia", "Punti"], true));
  table.appendChild(thead);

  let tbody = document.createElement("TBODY");
  for (let i = 0; i < Object.keys(maxPoints).length; i++) {
    let pointType = Object.keys(maxPoints)[i];

    let studentsDone = 0;
    for (let j = 0; j < Object.keys(resultHistory[subject]).length; j++) {
      let date = Object.keys(resultHistory[subject])[j];
      studentsDone += resultHistory[subject][date].length;
    }
    let studentsLeft = studentNumber - studentsDone;
    let betSpots = selectData[subject]["betspots"];
    let points = Math.floor((studentsLeft-betSpots) / (studentNumber-betSpots) * maxPoints[pointType]);
    // (y-y0)/(y1-y0) = (x-x0)/(x-x1), formula inversa per y

    let row = [pointType, points+"PT"];
    tbody.appendChild(makeTableRow(row));
  }
  table.appendChild(tbody);
  container.appendChild(table);

  return ret;
}

function makeTableRow(rowContents, isHeader=false, greenRows=null) {
  let row = document.createElement("TR");
  for (let i = 0; i < rowContents.length; i++) {
    let cell = document.createElement(isHeader ? "TH" : "TD");
    cell.innerHTML = rowContents[i];
    if(greenRows && greenRows[i]) cell.className = "green lighten-3";
    row.appendChild(cell);
  }
  return row;
}

function makeBetsTable(subject) {
  /*
  let firstRow = ["Data"];
  for (let i = 0; i < selectData[subject]["betspots"]; i++) {
    firstRow.push("Victim #" + (i+1));
  }
  thead.appendChild(makeTableRow(firstRow, true));







  let tbody = document.createElement("TBODY");
  table.appendChild(tbody);
  let subjectBets = betHistory[subject];
  for (let i = 0; i < Object.keys(subjectBets).length; i++) {
    let winRow = [false];
    let betDay = Object.keys(subjectBets)[i];
    let rowContents = [betDay.split(" ")[0]];

    for (let j = 0; j < subjectBets[betDay].length; j++) {
      rowContents.push(subjectBets[betDay][j]);
    }

    // Green cells
    for (let j = 0; j < Object.keys(resultHistory[subject]).length; j++) {
      let resultDay = Object.keys(resultHistory[subject])[j];
      if(compareDates(resultDay, betDay) >= 0) {
        for (let k = 0; k < subjectBets[betDay].length; k++) {
          winRow.push(resultHistory[subject][resultDay].indexOf(subjectBets[betDay][k]) > -1);
        }
        break;
      }
    }
    tbody.appendChild(makeTableRow(rowContents, false, winRow));
  }
  */

  return document.createElement("br");
}

/* Listeners & functions */

function disableSelected(subject, eventIndex) {
  let subjectBetters = betters[subject];
  let subjectSelected = selectedIndexes[subject];

  /* Enable all current disabled indexes */
  for(let i=0; i < subjectBetters.length; i++) {
    for (let j=0; j<subjectSelected.length; j++) {
      if(subjectSelected[j]) {
        subjectBetters[i].options[subjectSelected[j]].disabled = false;
      }
    }
  }

  /* Disable updated disabled indexes */
  subjectSelected[eventIndex] = subjectBetters[eventIndex].selectedIndex;
  selectedIndexes[subject] = subjectSelected;
  for(let i=0; i<subjectBetters.length; i++) {
    for (let j=0; j<subjectSelected.length; j++) {
      if(i == j) continue;
      if(subjectSelected[j]) {
        subjectBetters[i].options[subjectSelected[j]].disabled = true;
      }
    }
  }

  $('select').formSelect();
}

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
