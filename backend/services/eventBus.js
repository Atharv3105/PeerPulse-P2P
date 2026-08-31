const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  broadcast(eventType, data) {
    this.emit('message', {
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    });
  }
}

const eventBus = new EventBus();
module.exports = eventBus;
