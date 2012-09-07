
/**
 * Expose `Event`.
 */

module.exports = Event;

function Event() {
  this.defaultPrevented = false;
}

Event.prototype.preventDefault = function(){
  this.defaultPrevented = true;
};
