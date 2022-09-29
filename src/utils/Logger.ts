export class Color {
    static Reset = "\x1b[0m";
    static Bright = "\x1b[1m";
    static Dim = "\x1b[2m";
    static Italic = "\x1b[3m";
    static Underscore = "\x1b[4m";
    static Blink = "\x1b[5m";
    static Reverse = "\x1b[7m";
    static Hidden = "\x1b[8m";
    static Delete = "\x1b[9m";
    static DoubleUnderline = "\x1b[21m";

    static FgBlack = "\x1b[30m";
    static FgRed = "\x1b[31m";
    static FgGreen = "\x1b[32m";
    static FgYellow = "\x1b[33m";
    static FgBlue = "\x1b[34m";
    static FgMagenta = "\x1b[35m";
    static FgCyan = "\x1b[36m";
    static FgWhite = "\x1b[37m";

    static BgBlack = "\x1b[40m";
    static BgRed = "\x1b[41m";
    static BgGreen = "\x1b[42m";
    static BgYellow = "\x1b[43m";
    static BgBlue = "\x1b[44m";
    static BgMagenta = "\x1b[45m";
    static BgCyan = "\x1b[46m";
    static BgWhite = "\x1b[47m";

    static c(color, txt = '') {
        return color + txt + Color.Reset;
    }
}

export class Logger {
    static globalUseColor: boolean = true;
    static globalVisible: boolean = true;
    static globalShowDebug: boolean = true;
    name: string;
    parent: any;
    visible: boolean;
    serviceProvider: Console;
    useColor: boolean;
    showDebug: boolean;
    lastLogTime: Date;
    static getStack(stack=5) {
        let err = new Error().stack.substr(7).split('\n').splice(2);
        return err.slice(0, stack).join('\n');
    }
    static getStacakFile() {
        return new Error().stack.substr(7).split('\n').splice(2).shift().split('at ').pop().split('\\').pop();
    }

    w(color, txt = '') {
        if (this.parent && this.parent.useColor === false) return txt;
        if (Logger.globalUseColor === false) return txt;
        return color + txt + Color.Reset;
    }

    c(color='') {
        if (this.parent && this.parent.useColor === false) return '';
        if (Logger.globalUseColor === false) return '';
        return Color[color]??color;
    }

    constructor(loggerName = 'LOG', parent = null) {
        this.name = loggerName;
        this.parent = parent;
        this.visible = this.parent ? null : true;
        this.serviceProvider = console;
        this.showDebug = this.parent?.showDebug ?? false;
        this.lastLogTime = this.parent?this.parent.lastLogTime:new Date(0);
    }
    getLastLogTime() {
        return Math.max(
            this.lastLogTime.getTime(),
            this.parent ? this.parent.lastLogTime.getTime() : 0
        );
    }
    isShowDebug() {
        if (Logger.globalShowDebug === false) return false;
        if (this.parent && this.parent.isShowDebug) {
            return this.parent.isShowDebug();
        } else return this.showDebug;
    }
    isVisible() {
        if (Logger.globalVisible === false) return false;
        if (this.visible === null) {
            if (this.parent && this.parent.isVisible) {
                return this.parent.isVisible();
            } else return true;
        }
        return this.visible;
    }
    setVisible(yes = true) {
        this.visible = yes;
    }
    getSubLogger(subName = null) {
        return new Logger(subName, this);
    }
    getLogger(name = null) {
        return this.getSubLogger(name);
    }
    getName() {
        return `${this.parent ? this.parent.getName() + '/' : ''}${this.name}`;
    }
    getFormattedName() {
        return `[${this.getName()}]`
    }
    autoShowTime() {
        let current = new Date;
        if ((current.getTime() - this.getLastLogTime()) > (1000 * 60)) {
            this.sendTime(current);
        }
        this.lastLogTime = current;
    }
    sendTime(d) {
        let subMethod = 'log';
        let contents = [
            "==[",
            `${d.getFullYear()}/${d.getMonth()}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
            "]=="
        ]
        if (this.isVisible()) {
            if (this.serviceProvider.hasOwnProperty(subMethod)) {
                this.serviceProvider[subMethod](...contents);
                return true;
            }
        }
    }
    sendLogs(subMethod, ...contents) {
        this.autoShowTime();
        if (this.isVisible()) {
            if (this.serviceProvider.hasOwnProperty(subMethod)) {
                this.serviceProvider[subMethod](...contents);
                return true;
            } else if(this.serviceProvider.hasOwnProperty('log')) {
                this.serviceProvider.log(...contents);
                return true;
            }
        }
        return false;
    }
    color(color, ...args) {
        return this.sendLogs('log', this.getFormattedName(), this.c(color), ...args, this.c(Color.Reset));
    }
    log(...args) {
        return this.sendLogs('log', this.getFormattedName(), ...args);
    }
    info(...args) {
        return this.sendLogs('info', this.getFormattedName()+this.c(Color.FgBlue), ...args, this.c(Color.Reset));
    }
    warn(...args) {
        return this.sendLogs('warn', this.getFormattedName()+this.c(Color.FgYellow), ...args, this.c(Color.Reset));
    }
    error(...args) {
        const stacks = this.isShowDebug()?'\nTrace:\n' + Logger.getStack():'';
        return this.sendLogs('error', this.getFormattedName()+this.c(Color.BgRed), ...args, this.c(Color.Reset)+this.c( Color.Dim)+stacks+this.c(Color.Reset));
    }
    debug(...args) {
        if (!this.isShowDebug()) return;
        const stacks = '\tat ' + Logger.getStacakFile();
        return this.sendLogs('debug', this.getFormattedName()+this.c(Color.FgCyan), ...args, this.c(Color.Reset)+this.c(Color.Dim)+stacks+this.c(Color.Reset));
    }
    success(...args) {
        return this.sendLogs('info', this.getFormattedName()+this.c(Color.FgGreen), ...args, this.c(Color.Reset));
    }
    send(methodName, ...args) {
        return this.sendLogs(methodName, this.getFormattedName(), ...args);
    }
}

export const logger = new Logger("NSPM");
export default logger;
