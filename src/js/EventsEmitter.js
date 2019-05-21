export default class EventsEmitter {
  constructor(){
    this.events = {};
  }
  
  on(eventName, callback){
    if (!this.events.hasOwnProperty( eventName ))
    {
      this.events[eventName] = [];
    }
    
    this.events[eventName].push({once: false, callback: callback});
  }
  
  once(eventName, callback){
    if (!this.events.hasOwnProperty( eventName ))
    {
      this.events[eventName] = [];
    }
  
    this.events[eventName].push({once: true, callback: callback});
  }
  
  emit(eventName, event){
    if (!this.events.hasOwnProperty( eventName ))
      return;
    for (let i = 0; i < this.events[eventName].length; i++) {
      this.events[eventName][i].callback(event)
    }
    
    this.events[eventName] = this.events[eventName].filter((eventListener) => {
      return !eventListener.once;
    })
  }
  
}