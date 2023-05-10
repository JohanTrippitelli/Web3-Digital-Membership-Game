let timer_interval; // Declare a variable to store the interval ID for the timer
let time_left; //Interval for time remaining
let days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0; // Declare variables to store the time left

// Function to start the timer
function startTimer(period) {
  let start_time = Date.now(); // Get the current time in milliseconds
  let end_time = start_time + period * 1000; // Set the end time for the timer to be 60 seconds from now
  timer_interval = setInterval(updateTimer, 1000); // Start the timer interval to update the timer every second

  // Function to update the timer
  function updateTimer() {
    time_left = end_time - Date.now(); // Calculate the time left until the end of the timer
    if (time_left < 0) {
      // If the time is up, clear the interval and return
      clearInterval(timer_interval);
      return;
    }
    days = Math.floor(time_left / (1000 * 60 * 60 * 24)); // Calculate the number of days left
    hours = Math.floor((time_left % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // Calculate the number of hours left
    minutes = Math.floor((time_left % (1000 * 60 * 60)) / (1000 * 60)); // Calculate the number of minutes left
    seconds = Math.floor((time_left % (1000 * 60)) / 1000); // Calculate the number of seconds left
    let timer_string = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`; // Create the timer string
  }
}

// Getter function for the time left as a string
function getTimeLeft() {
  return `Days: ${days}, Hours: ${hours}, Minutes: ${minutes}, Seconds: ${seconds}`;
}

function getTimeRaw() {
  return time_left;
}

module.exports = {
  startTimer,
  getTimeLeft,
  getTimeRaw,
};
