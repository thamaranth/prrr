const value = {}

const state = {

  set(updates){
    Object.assign(value, updates)
    this.trigger()
  },

  get(){
    return value
  },

  subscribers: [],

  subscribe(subscriber){
    this.subscribers.push(subscriber)
  },

  unsubscribe(subscriber){
    this.subscribers = this.subscribers
      .filter(sub => sub !== subscriber)
  },

  trigger(){
    if (this.scheduledTrigger) return
    this.scheduledTrigger = setTimeout(()=>{
      delete this.scheduledTrigger
      this.subscribers.forEach(subscriber => {
        subscriber(value)
      })
    })
  }
}

export default state
