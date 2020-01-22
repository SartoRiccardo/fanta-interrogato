
// Forms //

class Login extends React.Component {
  render() {
    return(
      <form method="post" action="login.php">
        <div className="row" style={{paddingTop: "20px"}}>
          <div className="input-field col s6">
            <input id="user-input" className="validate" name="user" type="text" />
            <label htmlFor="user-input">Username</label>
          </div>
          <div className="input-field col s6">
            <input id="pswd-input" className="validate" name="pswd" type="password" />
            <label htmlFor="pswd-input">Password</label>
          </div>
        </div>

        <div className="row">
          <div className="col s12 center">
            <button className="btn waves-effect waves-light btn-large" type="submit">Invia</button>
          </div>
        </div>
      </form>
    );
  }
}

// Tables //

class TableRow extends React.Component {
  createCells() {
    let ret = [];
    for (let i = 0; i < this.props.content.length; i++) {
      let classname = "";
      if(this.props.greenCols && this.props.greenCols[i]) {
        classname = "green lighten-3";
      }

      if(this.props.isHeader) {
        ret.push(<th className={classname}>{this.props.content[i]}</th>);
      } else {
        ret.push(<td className={classname}>{this.props.content[i]}</td>);
      }
    }

    return ret;
  }

  render() {
    return(
      <tr>
        {this.createCells()}
      </tr>
    );
  }
}

class BetHistory extends React.Component {
  render() {
    let points = getPoints(this.props.subject, this.props.bets, this.props.results);
    return(
      <div className="row">
        <div className="col s12">
          <h4>Puntate Precedenti</h4>
          <h6>Punti accumulati <b>{points}</b></h6>
          <BetTable columns={this.props.columns} bets={this.props.bets} results={this.props.results} />
        </div>
      </div>
    );
  }
}

class BetTable extends React.Component {
  createHead() {
    let columns = this.props.columns;
    let row = ["Data"];
    for (let i = 0; i < columns; i++) {
      row.push("Vittima #" + (i+1));
    }
    console.log(row);
    return <TableRow content={row} isHeader="true"/>;
  }

  createBody() {
    let ret = [];

    let bets = this.props.bets; // bets = subjectBets
    let results = this.props.results; // results = resultHistory[subject]
    for (let i = 0; i < Object.keys(bets).length; i++) {
      let winRow = [false];
      let betDay = Object.keys(bets)[i];
      let rowContents = [betDay.split(" ")[0]];

      for (let j = 0; j < bets[betDay].length; j++) {
        rowContents.push(bets[betDay][j]);
      }

      // Green cells
      for (let j = 0; j < Object.keys(results).length; j++) {
        let resultDay = Object.keys(results)[j];
        if(compareDates(resultDay, betDay) >= 0) {
          for (let k = 0; k < bets[betDay].length; k++) {
            winRow.push(results[resultDay].indexOf(bets[betDay][k]) > -1);
          }
          break;
        }
      }

      ret.push(<TableRow content={rowContents} greenCols={winRow} />);
    }

    return ret;
  }

  render() {
    return(
      <table className="responsive-table centered striped">
        <thead>
          {this.createHead()}
        </thead>
        <tbody>
          {this.createBody()}
        </tbody>
      </table>
    )
  }
}

// Misc //

class Divider extends React.Component {
  render() {
    return(
      <div className="divider"></div>
    );
  }
}
