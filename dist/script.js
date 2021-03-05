// Accurate_Interval.js 
// Thanks Squeege! For the elegant answer provided to this question: 
// http://stackoverflow.com/questions/8173580/setinterval-timing-slowly-drifts-away-from-staying-accurate
// Github: https://gist.github.com/Squeegy/1d99b3cd81d610ac7351
// Slightly modified to accept 'normal' interval/timeout format (func, time). 

(function () {
  window.accurateInterval = function (fn, time) {
    var cancel, nextAt, timeout, wrapper;
    nextAt = new Date().getTime() + time;
    timeout = null;
    wrapper = function () {
      nextAt += time;
      timeout = setTimeout(wrapper, nextAt - new Date().getTime());
      return fn();
    };
    cancel = function () {
      return clearTimeout(timeout);
    };
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return {
      cancel: cancel };

  };
}).call(this);
// reflections: 
// Biggest thing learned here was working with setInterval(this.countDown, 1000) which runs a function {/* in this case 'this.countDown' function */} every 1000 cycles. 
// had some issues at the end of the project with subtle changes needing to be made so that clock will show 0 and will show the beginning time of the subsequent breaks and sessions
// also implmented conditional styles with alarmColor changing to red when clock is below 1:00

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      breakLength: 5,
      sessionLength: 25,
      timerLabel: true, // if true, timerLabel shows 'Session' in label, otherwise shows 'Break'
      currentTimeDisp: 1500,
      startPause: true, // startPause indicates if the clock is counting or not
      intervalId: null,
      alarmColor: { color: 'black' } //alarmColor turns red if clock is below 1:00
    };
    // bind functions here
    this.increaseBreak = this.increaseBreak.bind(this);
    this.decreaseBreak = this.decreaseBreak.bind(this);
    this.increaseSession = this.increaseSession.bind(this);
    this.decreaseSession = this.decreaseSession.bind(this);
    this.countDown = this.countDown.bind(this);
    this.clockify = this.clockify.bind(this);
    this.startPauseFunc = this.startPauseFunc.bind(this);
    this.start = this.start.bind(this);
    this.pause = this.pause.bind(this);
    this.reset = this.reset.bind(this);
    this.currStates = this.currStates.bind(this);
  }
  // functions here

  // increase function increases the break length with max of 60; won't change if clock is playing
  increaseBreak() {
    if (this.state.breakLength < 60 && this.state.startPause) {
      this.setState(state => ({
        breakLength: state.breakLength + 1 }));

    }
  }

  // decrease function decreases break length with minimum of 0; won't change if clock is playing
  decreaseBreak() {
    if (this.state.breakLength > 1 && this.state.startPause) {
      this.setState(state => ({
        breakLength: state.breakLength - 1 }));

    }
  }

  // increase function increases session length with max of 60; won't increase if clock is playing
  increaseSession() {
    if (this.state.sessionLength < 60 && this.state.startPause) {
      this.setState(state => ({
        sessionLength: state.sessionLength + 1,
        currentTimeDisp: state.currentTimeDisp + 60 }));

    }
  }

  // decrease function decreases session length with min of 1; won't decrease if clock is playing
  decreaseSession() {
    if (this.state.sessionLength > 1 && this.state.startPause) {
      this.setState(state => ({
        sessionLength: state.sessionLength - 1,
        currentTimeDisp: state.currentTimeDisp - 60 }));

    }
  }

  // countdown function decreases the clock by 1 each second and toggles between session and break intervals
  countDown() {
    if (this.state.currentTimeDisp <= 60) {
      this.setState(prevState => ({
        currentTimeDisp: prevState.currentTimeDisp - 1,
        alarmColor: { color: 'red' } }));

      if (this.state.currentTimeDisp < 0) {
        this.pause();
        this.audioBeep.play();
        var timerLength = this.state.timerLabel ? this.state.breakLength : this.state.sessionLength;
        this.setState(() => ({
          currentTimeDisp: timerLength * 60,
          alarmColor: { color: 'black' },
          timerLabel: !this.state.timerLabel }));

        this.start();
      }
    } else {
      this.setState(prevState => ({
        currentTimeDisp: prevState.currentTimeDisp - 1,
        alarmColor: { color: 'black' } }));

    }
  }

  // turn time into a clock format
  clockify(input) {
    let timeSec = this.state.currentTimeDisp % 60;
    let timeMin = Math.round(this.state.currentTimeDisp / 60 - timeSec / 60);
    return (timeMin < 10 ? '0' + timeMin : timeMin) +
    ':' + (timeSec < 10 ? '0' + timeSec : timeSec);
  }

  //start pause function; switches between start and pause in the same button
  startPauseFunc() {
    this.state.startPause ?
    this.start() :
    this.pause();
  }

  // start function
  start() {
    this.setState(() => ({
      intervalId: setInterval(this.countDown, 1000),
      startPause: false }));

  }

  // pause function
  pause() {
    clearInterval(this.state.intervalId);
    this.setState(() => ({
      startPause: true }));

  }

  // reset function
  reset() {
    clearInterval(this.state.intervalId);
    this.pause();
    this.setState({
      breakLength: 5,
      sessionLength: 25,
      currentTimeDisp: 1500,
      intervalId: null,
      timerLabel: true,
      startPause: true,
      alarmColor: { color: 'black' } });

    this.clockify();
    this.audioBeep.pause();
    this.audioBeep.currentTime = 0;
  }

  currStates() {
    console.log('breakLength: ' + this.state.breakLength);
    console.log('sessionLength: ' + this.state.sessionLength);
    console.log('currentTimeDisp: ' + this.state.currentTimeDisp);
    console.log('timerLabel: ' + this.state.timerLabel);
    console.log('intervalId: ' + this.state.intervalId);
    console.log('startPause: ' + this.state.startPause);
  }

  render() {
    return /*#__PURE__*/(
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { className: "watch-body" }, /*#__PURE__*/
      React.createElement("div", { id: "timer-window" }, /*#__PURE__*/
      React.createElement("div", { id: "timer-label", className: "display" },
      this.state.timerLabel ? 'Session' : 'Break'), /*#__PURE__*/

      React.createElement("div", { id: "time-left", className: "display", style: this.state.alarmColor },
      this.clockify()), /*#__PURE__*/

      React.createElement("div", { id: "break-and-session-window" }, /*#__PURE__*/
      React.createElement("div", { id: "break-label", className: "display" }, /*#__PURE__*/
      React.createElement("a", null, "Break Time:"), /*#__PURE__*/
      React.createElement("div", { id: "break-length" },
      this.state.breakLength)), /*#__PURE__*/


      React.createElement("div", { id: "session-label", className: "display" }, /*#__PURE__*/
      React.createElement("a", null, "Session Time:"), /*#__PURE__*/
      React.createElement("div", { id: "session-length" },
      this.state.sessionLength)))), /*#__PURE__*/




      React.createElement("div", { id: "start-reset-buttons" }, /*#__PURE__*/
      React.createElement("button", { id: "start_stop", onClick: this.startPauseFunc },
      this.state.startPause ? 'Start' : 'Pause'), /*#__PURE__*/

      React.createElement("button", { id: "reset", onClick: this.reset }, "Reset"), /*#__PURE__*/


      React.createElement("button", { id: "curr-states", onClick: this.currStates }, "Curr States")), /*#__PURE__*/



      React.createElement("div", { id: "break-buttons" }, /*#__PURE__*/
      React.createElement("a", null, "Break length: "), /*#__PURE__*/
      React.createElement("button", { id: "break-decrement", className: "Button", onClick: this.decreaseBreak },
      '<'), /*#__PURE__*/

      React.createElement("button", { id: "break-increment", className: "Button", onClick: this.increaseBreak },
      '>')), /*#__PURE__*/


      React.createElement("div", { id: "session-buttons" }, /*#__PURE__*/
      React.createElement("a", null, " Session length: "), /*#__PURE__*/
      React.createElement("button", { id: "session-decrement", className: "Button", onClick: this.decreaseSession },
      '<'), /*#__PURE__*/

      React.createElement("button", { id: "session-increment", className: "Button", onClick: this.increaseSession },
      '>'))), /*#__PURE__*/



      React.createElement("audio", {
        id: "beep",
        preload: "auto",
        ref: audio => {
          this.audioBeep = audio;
        },
        src: "https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" })));



  }}


// React.DOM here
ReactDOM.render( /*#__PURE__*/React.createElement(Main, null), document.getElementById("main"));