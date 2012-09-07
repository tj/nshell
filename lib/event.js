
/**
 * Expose `Event`.
 */

module.exports = Event;

/**
 * Initialize a new `Event`.
 *
 * @api public
 */

function Event() {
  this.defaultPrevented = false;
}

/**
 * Prevent default behaviour.
 *
 * @api public
 */

Event.prototype.preventDefault = function(){
  this.defaultPrevented = true;
};
