
class SubjectContent extends React.Component {
  render() {
    const { selectData, maxPoints, betHistory, canBet, resultHistory, studentNumber, subject } = this.props;
    let form = [];
    if(canBet) form = [
      <BettingForm
        options={selectData.students}
        subject={subject}
        betspots={selectData.betspots}
        key="0"
      />,
      <Divider key="1" />
    ];
    return (
      <div id={"tab-" + subject}>
        {form}
        <PointsKey
          studentsLeft={selectData.students.length}
          studentNumber={studentNumber}
          betspots={selectData.betspots}
          pointMap={maxPoints}
        />
        <Divider />
        <BetHistory
          subject={subject}
          columns={selectData.betspots}
          bets={betHistory}
          results={resultHistory}
        />
      </div>
    )
  }
}

// Nav //

class Tab extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col s12">
          <ul className="tabs">
            <li className="tab col s3"><a href={"#tab-" + this.props.subject}>{this.props.label}</a></li>
          </ul>
        </div>
      </div>
    );
  }
}

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
            <button className="btn waves-effect waves-light btn-large" type="submit">Login</button>
          </div>
        </div>
      </form>
    );
  }
}

class BettingForm extends React.Component {
  constructor(props) {
    super(props);

    let selected = [];
    for(let i = 0; i < this.props.betspots; i++) {
      selected.push(null);
    }

    this.state = {
      selected: selected,
    };
  }

  createSelectors = () => {
    let ret = [];
    for (let i = 0; i < this.props.betspots; i++) {
      ret.push((
        <div className="input-field col m3 s12" key={i}>
          <Select
            name={"bet"+i}
            options={this.props.options}
            onChange={evt => {this.disableSelected(evt, i)}}
            disabledOptions={this.state.selected}
          />
          <label>Vittima #{i+1}</label>
        </div>
      ));
    }
    return ret;
  }

  disableSelected = (evt, evtIndex) => {
    let selected = [...this.state.selected];
    selected[evtIndex] = evt.target.state.selectedIndex;

    this.setState({
      selected: selected,
    }, () => {
      $('select').formSelect();
    });
  }

  render() {
    return(
      <form method="post" action="submit.php">
        <input type="hidden" name="subject" value={this.props.subject} />
        <div className="row" style={{paddingTop: "20px"}}>
          {this.createSelectors()}
        </div>
        <div className="row">
          <div className="col s12 center">
            <button type="submit" className="btn waves-effect waves-light btn-large">
              Invia
              <i className="material-icons right">send</i>
            </button>
          </div>
        </div>
      </form>
    );
  }
}

class Select extends React.Component {
  constructor(props) {
    super(props);

    let options = [];
    for (let i = 0; i < this.props.options.length; i++) {
      options.push(this.props.options[i]);
    }

    this.state = {
      options: this.props.options.map(x => x),
      selectedIndex: -1,
    };
  }

  createOptions = () => {
    let ret = [];
    for(let i = 0; i < this.state.options.length; i++) {
      let disabled = this.props.disabledOptions &&
        this.props.disabledOptions.includes(i) &&
        i != this.state.selectedIndex;
      ret.push(
        <option value={this.state.options[i]} disabled={disabled} key={this.state.options[i]}>
          {this.state.options[i]}
        </option>
      );
    }

    return ret;
  }

  onChangeEvent = (event) => {
    this.setState({
      selectedIndex: event.target.selectedIndex-1,
    }, () => {
      if(this.props.onChange) {
        this.props.onChange({
          target: this,
          event: event,
        })
      }
    });
  }

  render() {
    let selected = this.state.selectedIndex >= 0 ? this.state.options[this.state.selectedIndex] : "0";
    return(
      <select name={this.props.name} onChange={this.onChangeEvent} value={selected}>
        <option value="0" disabled>Scegli</option>
        {this.createOptions()}
      </select>
    );
  }
}

// Tables //

class TableRow extends React.Component {
  createCells = () => {
    let ret = [];
    for (let i = 0; i < this.props.content.length; i++) {
      let classname = "";
      if(this.props.greenCols && this.props.greenCols[i]) {
        classname = "green lighten-3";
      }

      if(this.props.isHeader) {
        ret.push(<th className={classname} key={this.props.content[i]}>{this.props.content[i]}</th>);
      } else {
        ret.push(<td className={classname} key={this.props.content[i]}>{this.props.content[i]}</td>);
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
  createHead = () => {
    let columns = this.props.columns;
    let row = ["Data"];
    for (let i = 0; i < columns; i++) {
      row.push("Vittima #" + (i+1));
    }
    return <TableRow content={row} isHeader="true"/>;
  }

  createBody = () => {
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

      ret.push(<TableRow content={rowContents} greenCols={winRow} key={betDay} />);
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

class PointsKey extends React.Component {
  createPointRows = () => {
    let ret = [];

    for (let i = 0; i < Object.keys(this.props.pointMap).length; i++) {
      let pointType = Object.keys(this.props.pointMap)[i];

      let points = Math.floor(  // (Y-Y0)/(Y1-Y0) = (X-X0)/(X1-X0)
        (this.props.studentsLeft-this.props.betspots) /
        (this.props.studentNumber-this.props.betspots) *
        this.props.pointMap[pointType]
      );

      let row = [pointType, points+"PT"];
      ret.push(<TableRow content={row} key={pointType}/>);
    }

    return ret;
  }

  render() {
    return (
      <div className="row">
        <div className="col s12">
          <h4>Legenda</h4>
          <table className="striped responsive-table">
            <thead>
              <TableRow content={["Tipologia", "Punti"]} isHeader />
            </thead>
            <tbody>
              {this.createPointRows()}
            </tbody>
          </table>
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
