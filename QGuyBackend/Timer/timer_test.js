const { startTimer, getTimeLeft, getTimeRaw } = require("../Timer/timer.js");

startTimer(30); // Start the timer
let Membership = 0;
// Log the time left every second
setInterval(() => {
  console.log(getTimeLeft());
  console.log(getTimeRaw());
}, 1000);
if (getTimeRaw() < 0) {
  Membership = 1;
}
