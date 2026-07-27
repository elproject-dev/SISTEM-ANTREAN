const React = require('react');
// simulated
let updaterQueue = [];
function setStateRaw(updater) {
  updaterQueue.push(updater);
}
let ticket;
setStateRaw((prev) => {
  ticket = { id: 1 };
  return prev;
});
console.log("Ticket after setStateRaw:", ticket);
