import logger from "./Logger";

const log = logger.getLogger("Wrapper");

export class WrapperResultError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WrapperResultError';
    }
}
export class WrapperError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WrapperError';
    }
}
export class WrappedResult {
    static OK = true;
    static ERR = false;
    static wrapResult(fn,...args){
        if(typeof(fn) != 'function'){
            return wrap(0, 'Not a function');
        }
        try{
            let result = fn(...args);
            return wrap(!!result, result);
        }catch(e){
            return wrap(0, e);
        }
    }
    static async wrapResultAsync(fn,...args){
        if(typeof(fn) != 'function'){
            return wrap(0, 'Not a function');
        }
        try{
            let result = await fn(...args);
            return wrap(!!result, result);
        }catch(e){
            return wrap(0, e);
        }
    }
    static asWrapped(wrapperlike){
        if (wrapperlike instanceof WrappedResult) return wrapperlike;
        let ok = wrapperlike?(wrapperlike.ok ?? !!wrapperlike.result):false;
        let result = wrapperlike?.result ?? wrapperlike;
        return new WrappedResult(ok, result);
    }
    static wrap(ok, result = null, ...args){
        if(typeof(ok) == 'function'){
            if(ok.constructor.name=="AsyncFunction"){
                return WrappedResult.wrapResultAsync(ok,[result,...args]);
            }else{
                return WrappedResult.wrapResult(ok,[result,...args]);
            }
        }
        return new WrappedResult(!!ok, result);
    }
    static unwrap(wrapped, callbacks: { ok?: Function, err?: Function } = {}, convert = false){
        if(convert) wrapped = WrappedResult.asWrapped(wrapped);
        if (!wrapped) throw new WrapperError('Empty result');
        if (!(wrapped instanceof WrappedResult)) throw new WrapperError('Not a wrapped result');
        const okCallback = callbacks?.ok;
        const failCallback = callbacks?.err;
        
        if (!wrapped.ok) {
            if (typeof (failCallback) == 'function') {
                failCallback(wrapped.result);
            }else throw new WrapperResultError(wrapped.result);
        }
        else if (typeof (okCallback) == 'function') okCallback(wrapped.result);
        return wrapped.result;
    }
    static unwrapAsPromise(wrapped, callbacks = {}){
        try {
            const res = unwrap(wrapped, callbacks);
            return Promise.resolve(res);
        } catch (err) {
            return Promise.reject(err);
        }
    }
    static isWrapped(obj,strict = false){
        if(obj instanceof WrappedResult) return true;
        if(!strict && obj.hasOwnProperty('result')&&obj.hasOwnProperty('ok')) return true;
        return false;
    }
    #ok = false;
    get ok() {
        return this.#ok;
    }
    #result = null;
    get result() { return this.#result; }
    constructor(ok, result) {
        this.#ok = ok;
        this.#result = result;
        if(!ok) log.error('[FAIL]', result/*, (new Error).stack.substring(5)*/);
    }
    getResult(fallback=undefined) { if(this.ok) return this.result; else return fallback; }
    getError(fallback=undefined) { if (!this.ok) return this.result; else return fallback; }
    unwrap(callbacks = {}) {
        return WrappedResult.unwrap(this, callbacks);
    }
    handle(){
        class WrappedResultHandler {
            cbFail = ()=>{};
            cbSuccess = ()=>{};
            res = null;
            executed = false;
            ok(fn){
                this.cbSuccess = fn;
                return this;
            }
            err(fn){
                this.cbFail = fn;
                return this;
            }
            done(){
                if(this.executed) return;
                this.executed = true;
                this.res.unwrap({
                    ok: this.cbSuccess,
                    err: this.cbFail,
                });
            }
            constructor(res){
                this.res = WrappedResult.asWrapped(res);
                setTimeout(()=>{
                    this.done();
                })
            }
        }
        return new WrappedResultHandler(this);
    }
    promised() {
        if (this.ok) return Promise.resolve(this.result);
        else return Promise.reject(this.result);
    }
    toObject(){
        return this.toJSON();
    }
    toJSON() {
        return {
            ok: this.ok,
            result: this.result
        };
    }
    [Symbol.iterator](){
        let index = 0;
        return {
            next: ()=>{
                switch(index++){
                    case 0 : return { value: this.ok };
                    case 1 : return { value: this.result };
                    default: return { done: true };
                }
            }
        }
    }
}
export const asWrapped = WrappedResult.asWrapped;
export const wrap = WrappedResult.wrap;
export const unwrap = WrappedResult.unwrap;
export const unwrapAsPromise = WrappedResult.unwrapAsPromise;
export const isWrapped = WrappedResult.isWrapped;