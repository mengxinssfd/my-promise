// from core.js
declare let __g;

function getGlobal(): any {
    return typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self
        // eslint-disable-next-line no-new-func
        : Function('return this')();
}

const _global = getGlobal();
if (typeof __g == 'number') __g = _global;
const macrotask = _global.setImmediate || _global.setTimeout;
const Observer = _global.MutationObserver || _global.WebKitMutationObserver;
process = _global.process;
Promise = _global.Promise;
const isNode = Object.prototype.toString.call(process).slice(8, -1) == 'process';


type Handler = () => void;
type Task = { fn: Handler, next?: Task };

const microTask = (() => {
    let head: Task | undefined;
    let last: Task | undefined;
    let notify:Handler;

    const flush = function () {
        let parent, fn;
        if (isNode && (parent = process.domain)) parent.exit();
        while (head) {
            fn = head.fn;
            head = head.next;
            try {
                fn();
            } catch (e) {
                if (head) notify();
                else last = undefined;
                throw e;
            }
        }
        last = undefined;
        if (parent) parent.enter();
    };

    // Node.js
    if (isNode) {
        notify = function () {
            process.nextTick(flush);
        };
        // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
    } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
        let toggle = true;
        const node = document.createTextNode('');
        new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
        notify = function () {
            node.data = String(toggle = !toggle);
        };
        // environments with maybe non-completely correct, but existent Promise
    } else if (Promise && Promise.resolve) {
        // Promise.resolve without an argument throws an error in LG WebOS 2
        const promise = Promise.resolve(undefined);
        notify = function () {
            promise.then(flush);
        };
        // for other environments - macrotask based on:
        // - setImmediate
        // - MessageChannel
        // - window.postMessag
        // - onreadystatechange
        // - setTimeout
    } else {
        notify = function () {
            // strange IE + webpack dev server bug - use .call(global)
            macrotask.call(_global, flush);
        };
    }

    return function (fn: Handler) {
        const task: Task = {fn: fn, next: undefined};
        if (last) last.next = task;
        if (!head) {
            head = task;
            notify();
        }
        last = task;
    };
})();
export default microTask;