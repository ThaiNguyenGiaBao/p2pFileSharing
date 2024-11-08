// const ProgressBar = require('progress');

import ProgressBar from 'progress';
// Create a new progress bar instance with the total length
const bar = new ProgressBar('[:bar] :percent', { total: 20, width: 20 });

// Simulate a process with a timer
const timer = setInterval(() => {
  bar.tick();
  if (bar.complete) {
    console.log('\nComplete!\n');
    clearInterval(timer);
  }
}, 100);
