// Queue implementation taken from https://github.com/jessetane/queue.
// The original has a deendency on `inherits` package,
// this version uses in-built util.inherit method.

var util = require('util')
var EventEmitter = require('events').EventEmitter

module.exports = Queue

function Queue(options) {
    if (!(this instanceof Queue)) {
        return new Queue(options)
    }

    EventEmitter.call(this)
    options = options || {}
    this.concurrency = options.concurrency || Infinity
    this.timeout = options.timeout || 0
    this.autostart = options.autostart || false
    this.pending = 0
    this.session = 0
    this.running = false
    this.jobs = []
    this.timers = {}
}
util.inherits(Queue, EventEmitter)

var arrayMethods = [
    'pop',
    'shift',
    'indexOf',
    'lastIndexOf'
]

arrayMethods.forEach(function (method) {
    Queue.prototype[method] = function () {
        return Array.prototype[method].apply(this.jobs, arguments)
    }
})

Queue.prototype.slice = function (begin, end) {
    this.jobs = this.jobs.slice(begin, end)
    return this
}

Queue.prototype.reverse = function () {
    this.jobs.reverse()
    return this
}

var arrayAddMethods = [
    'push',
    'unshift',
    'splice'
]

arrayAddMethods.forEach(function (method) {
    Queue.prototype[method] = function () {
        var methodResult = Array.prototype[method].apply(this.jobs, arguments)
        if (this.autostart) {
            this.start()
        }
        return methodResult
    }
})

Object.defineProperty(Queue.prototype, 'length', {
    get: function () {
        return this.pending + this.jobs.length
    }
})

Queue.prototype.start = function (cb) {
    if (cb) {
        callOnErrorOrEnd.call(this, cb)
    }

    this.running = true

    if (this.pending === this.concurrency) {
        return
    }

    if (this.jobs.length === 0) {
        if (this.pending === 0) {
            done.call(this)
        }
        return
    }

    var self = this
    var job = this.jobs.shift()
    var once = true
    var session = this.session
    var timeoutId = null
    var didTimeout = false

    function next(err, result) {
        if (once && self.session === session) {
            once = false
            self.pending--
            if (timeoutId !== null) {
                delete self.timers[timeoutId]
                clearTimeout(timeoutId)
            }

            if (err) {
                self.emit('error', err, job)
            } else if (didTimeout === false) {
                self.emit('success', result, job)
            }

            if (self.session === session) {
                if (self.pending === 0 && self.jobs.length === 0) {
                    done.call(self)
                } else if (self.running) {
                    self.start()
                }
            }
        }
    }

    if (this.timeout) {
        timeoutId = setTimeout(function () {
            didTimeout = true
            if (self.listeners('timeout').length > 0) {
                self.emit('timeout', next, job)
            } else {
                next()
            }
        }, this.timeout)
        this.timers[timeoutId] = timeoutId
    }

    this.pending++
    job(next)

    if (this.jobs.length > 0) {
        this.start()
    }
}

Queue.prototype.stop = function () {
    this.running = false
}

Queue.prototype.end = function (err) {
    clearTimers.call(this)
    this.jobs.length = 0
    this.pending = 0
    done.call(this, err)
}

function clearTimers() {
    for (var key in this.timers) {
        var timeoutId = this.timers[key]
        delete this.timers[key]
        clearTimeout(timeoutId)
    }
}

function callOnErrorOrEnd(cb) {
    var self = this
    this.on('error', onerror)
    this.on('end', onend)

    function onerror(err) { self.end(err) }
    function onend(err) {
        self.removeListener('error', onerror)
        self.removeListener('end', onend)
        cb(err)
    }
}

function done(err) {
    this.session++
    this.running = false
    this.emit('end', err)
}