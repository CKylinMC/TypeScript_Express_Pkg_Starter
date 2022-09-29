export class EventEmitter{
    handlers = {};
    onceHandlers = {};
    once(name, func) {
        if (!(func instanceof Function)) throw "Param must be func!";
        if (!(name in this.onceHandlers)) {
            this.onceHandlers[name] = [];
        }
        this.onceHandlers[name].push(func);
    }
    on(name, func) {
        if (!(func instanceof Function)) throw "Param must be func!";
        if (!(name in this.handlers)) {
            this.handlers[name] = [];
        }
        this.handlers[name].push(func);
    }
    off(name, func) {
        if (!(func instanceof Function)) throw "Param must be func!";
        if (name in this.handlers) {
            for (let i = 0; i < this.handlers[name].length; i++) {
                if (this.handlers[name][i] === func) {
                    this.handlers[name].splice(i, 1);
                    i--;
                }
            }
        }
    }
    offonce(name, func) {
        if (!(func instanceof Function)) throw "Param must be func!";
        if (name in this.onceHandlers) {
            for (let i = 0; i < this.onceHandlers[name].length; i++) {
                if (this.onceHandlers[name][i] === func) {
                    this.onceHandlers[name].splice(i, 1);
                    i--;
                }
            }
        }
    }
    clean(name){
        if (name in this.handlers) {
            this.handlers[name] = [];
        }
    }
    cleanOnce(name){
        if (name in this.onceHandlers) {
            this.onceHandlers[name] = [];
        }
    }
    async emitAsync(name, ...args) {
        if (name in this.onceHandlers) {
            for (let func of this.onceHandlers[name]) {
                try {
                    if (await func(...args)===false) {
                        return;
                    }
                } catch (e) {
                    console.error('ERROR:', e);
                }
            }
            this.cleanOnce(name);
        }
        if (name in this.handlers) {
            for (let func of this.handlers[name]) {
                try {
                    if (await func(...args)===false) {
                        return;
                    }
                } catch (e) {
                    console.error('ERROR:', e);
                }
            }
        }
    }
    emit(name, ...args) {
        if (name in this.onceHandlers) {
            for (let func of this.onceHandlers[name]) {
                try {
                    if (func(...args)===false) {
                        return;
                    }
                } catch (e) {
                    console.error('ERROR:', e);
                }
            }
            this.cleanOnce(name);
        }
        if (name in this.handlers) {
            for (let func of this.handlers[name]) {
                try {
                    if (func(...args)===false) {
                        return;
                    }
                } catch (e) {
                    console.error('ERROR:', e);
                }
            }
        }
    }
}

export default new EventEmitter();
