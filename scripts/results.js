let maxPoints, results;

function setup() {
  ajax("totalResults", function() {
    if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      showResults(JSON.parse(this.responseText));
    }
  });
}

function ajax(data, func) {
  let request = new XMLHttpRequest();
  request.onreadystatechange = func;
  request.open("POST", "modules/data.php", false);
  request.send("request=" + data);
}

function showResults(results) {
  results = Object.entries(results).map(
    ([ student, points ]) => ({ student, points })
  ).sort((r1, r2) => r2.points - r1.points);
  console.log(results);

  const output = document.getElementById("container");

  const resultRows = results.map(({ student, points }, i) => {
    let color;
    switch(i) {
      case 0:
        color = "amber lighten-4";
        break;
      case 1:
        color = "blue-grey lighten-4";
        break;
      case 2:
        color = "brown lighten-4";
        break;
      case results.length-1:
        color = "red lighten-2";
        break;
      default:
        color = "";
    }

    return `
      <tr class="${color}">
        <td>${i+1}°</td>
        <td>${student.toUpperCase()}</td>
        <td>${points}PT</td>
      </tr>
    `;
  });

  output.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col-12 center-align hide-on-large-only">
          <h1>${results[0].student.toUpperCase()}<br>${results[0].points}PT</h1>
          <img src="https://media1.tenor.com/images/17c232c008689b60be77b0c9b47b58e1/tenor.gif" alt="">
        </div>

        <div class="col-12 hide-on-med-and-down">
          <div class="winner">
            <h1 class="winner-text">${results[0].student.toUpperCase()} - ${results[0].points}PT</h1>
            <img class="congratulations-med"
                src="https://media1.tenor.com/images/17c232c008689b60be77b0c9b47b58e1/tenor.gif" alt="">
          </div>
        </div>

        <hr>

        <div class="col-12 center-align">
          <h3>Classifica</h3>
          <table className="centered striped">
            <thead>
              <tr>
                <th>Posto</th>
                <th>Utente</th>
                <th>Punti</th>
              </tr>
            </thead>
            <tbody>
              ${resultRows.join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
