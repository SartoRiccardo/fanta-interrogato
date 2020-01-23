
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

class BettingForm extends React.Component {
  createSelectors() {
    let ret = [];
    this.selectors = [];
    this.selected = [];
    for (let i = 0; i < this.props.betspots; i++) {
      let sel = <Select name={"bet"+i} options={this.props.options}/* onChange={() => {this.disableSelected(i)}}*/ />;
      ret.push((
        <div className="input-field col m3 s12">
          {sel}
          <label>Vittima #{i+1}</label>
        </div>
      ));
      this.selectors.push(sel);
      this.selected.push(null);
    }
    return ret;
  }

  disableSelected(eventIndex) {
    // Enable all current disabled indexes //
    for(let i=0; i < this.selectors.length; i++) {
      for (let j=0; j<this.selected.length; j++) {
        if(this.selected[j]) {
          let optProps = this.selectors[i].props.getOption(this.selected[j]).props;
          if("disabled" in optProps) delete optProps["disabled"];
          this.selectors[i].props.getOption(this.selected[j]).props = optProps;
        }
      }
    }

    // Disable updated disabled indexes //
    this.selected[eventIndex] = this.selectors[eventIndex].props.selectedIndex;
    this.selected = this.selected;
    for(let i = 0; i<this.selectors.length; i++) {
      for (let j = 0; j<this.selected.length; j++) {
        if(i == j) continue;
        if(this.selected[j]) {
          this.selectors[i].props.getOption(this.selected[j]).props.disabled = true;
        }
      }
    }

    $('select').formSelect();
  }

  render() {
    return(
      <form>
        <input type="hidden" name="subject" value={this.props.subject} />
        <div className="row" style={{paddingTop: "20px"}}>
          {this.createSelectors()}
        </div>
        <div className="row">
          <div className="col s12 center">
            <button type="submit" className="btn waves-effect waves-light btn-large">Invia</button>
          </div>
        </div>
      </form>
    );
  }
}

class Select extends React.Component {
  createOptions() {
    let ret = [];
    this.props.selectedIndex = 0;
    for (let i = 0; i < this.props.options.length; i++) {
      ret.push(<option value={this.props.options[i]}>{this.props.options[i]}</option>);
    }
    return ret;
  }

  onChangeEvent(event) {
    this.props.selectedIndex = event.target.selectedIndex;
  }

  /*
  getOption(i) {
    console.log(this.options);
    return this.options[i];
  }
  */

  render() {
    /*
    this.options = [<option value="0" disabled selected>Scegli</option>];
    this.options.push(...this.createOptions());
    this.props.getOption = this.getOption;
    */
    let props = {
      name: this.props.name
    }
    if(this.props.onChange) props.onChange = (event) => {this.onChangeEvent(event); this.props.onChange()};
    return(
      <select {...props}>
        {this.createOptions()}
      </select>
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

class BetTable extends React.Component {
  createHead() {
    let columns = this.props.columns;
    let row = ["Data"];
    for (let i = 0; i < columns; i++) {
      row.push("Vittima #" + (i+1));
    }
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

// Misc //

class Divider extends React.Component {
  render() {
    return(
      <div className="divider"></div>
    );
  }
}
