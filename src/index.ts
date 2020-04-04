import microTask from "./microtask";

enum State {
    padding = "padding",
    fulfilled = "fulfilled",
    rejected = "rejected"
}

type Resolve<T> = (value: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;

type OnFulfilledFn<T, T2> = ((value: T) => T2 | PromiseLike<T2>);
type OnRejectedFn<T> = ((reason: any) => T | PromiseLike<T>)

function isPromiseLike(target: any): target is PromiseLike<any> {
    return target/*null也是object*/ && typeof target === "object" && typeof target.then === "function";
}

let id = 0;
export default class MyPromise<T = void> implements PromiseLike<T> {
    private readonly id = id; // debugger用
    private status: State = State.padding;
    private value: T;
    private fulfillList: ((value: T) => void)[] = [];
    private rejectList: ((reason: any) => void)[] = [];
    private finallyList: any[] = []; // 从fulfill和reject里摘出来

    public constructor(executor: (resolve: Resolve<T>, reject: Reject) => void) {
        this.id = id++;
        // console.log("MyPromise id:", this.id);

        // 调用callback
        function runCallback(callbackList: Function[], value?: T) {
            let cb;
            while ((cb = callbackList.shift())) {
                cb(value);
            }
        }

        // 通过status决定调用的callback
        const run = (status: State, value: T) => {
            this.status = status;
            this.value = value;
            const lists = {
                [State.rejected]: this.rejectList,
                [State.fulfilled]: this.fulfillList,
            };
            const list = lists[status];
            runCallback(list, value);
            // 最后调用finally
            runCallback(this.finallyList, value);
        };
        const resolve: Resolve<T> = (value) => {
            const onThen = (status: State) => {
                return (value: T) => run(status, value);
            };
            if (isPromiseLike(value)) {
                value.then(onThen(State.fulfilled), onThen(State.rejected));
                return;
            }
            microTask(() => onThen(State.fulfilled)(value));
        };

        const reject: Reject = (reason) => {
            const handler = () => {
                // 未catch异常
                if (!this.rejectList.length)
                    // 不能让reject阻塞finally所以设为异步
                    microTask(() => {
                        throw "(in MyPromise id:" + this.id + ") " + reason;
                    });
                run(State.rejected, reason);
            };
            microTask(handler);
        };
        executor(resolve, reject);
    }

    // resolve<T>(value: T | PromiseLike<T>): Promise<T>;
    public static resolve<T2>(value?: T2 | PromiseLike<T2>): MyPromise<T2> {
        if (isPromiseLike(value)) return value as MyPromise<T2>;
        return new MyPromise<T2>(res => res(value!));
    }

    // reject<T = never>(reason?: any): Promise<T>;
    public static reject<T = never>(reason?: any): MyPromise<T> {
        return new MyPromise<T>((res, rej) => rej(reason));
    }

    // race<T>(values: readonly T[]): Promise<T extends PromiseLike<infer U> ? U : T>;
    public static race<T>(values: readonly T[]): MyPromise<T extends PromiseLike<infer U> ? U : T> {
        return new MyPromise<any>((resolve, reject) => {
            values.forEach(value => {
                if (isPromiseLike(value))
                    value.then(value => resolve(value), reject);
                else
                    resolve(value);
            });
        });
    }

    // all<TAll>(values: Iterable<TAll | PromiseLike<TAll>>): Promise<TAll[]>;
    // all<T>(values: readonly (T | PromiseLike<T>)[]): Promise<T[]>; // => [MP<number>,MP<number>,string] string处会报错
    // public static all<T>(values: readonly T[]): MyPromise<(T extends PromiseLike<infer U> ? U : T)[]> {
    public static all<T, T2 = PromiseLike<T>>(values: readonly (T | T2)[]): MyPromise<(T2 extends PromiseLike<infer U> ? U : T2)[]> {
        return new MyPromise<any[]>((resolve, reject) => {
            const resultList: any[] = Array(values.length);
            let count = 0; // 计数
            const fulfilled = (index: number) => (value: any) => {
                resultList[index] = value;
                if (++count === values.length) resolve(resultList);
            };

            // Promise.all([]).then(v => console.log(v)); // === > [];
            if (!values.length) {
                resolve(resultList);
                return;
            }

            // Promise.all([...])
            values.forEach((value, index) => {
                const onFulfilled = fulfilled(index);
                if (isPromiseLike(value))
                    value.then(onFulfilled, p => reject(p));
                else
                    // 非PromiseLike直接返回原值
                    onFulfilled(value);
            });

        });
    }

    // catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    public catch<TResult = never>(
        onRejected?: OnRejectedFn<TResult> | undefined | null,
    ): MyPromise<T | TResult> {
        return this.then(null, onRejected);
    }

    // finally(onfinally?: (() => void) | undefined | null): Promise<T>
    public finally(onFinally?: (() => void) | undefined | null): MyPromise<T> {
        const status = this.status;
        const value = this.value;
        // return this.then(handler, handler); // MyPromise.reject().finally() 不会抛异常
        return new MyPromise<T>((resolve, reject) => {
            const handler = (value: T) => {
                if (typeof onFinally === "function") onFinally();
                resolve(value);
            };
            switch (status) {
                // 当状态为pending时，将then方法回调函数加入执行队列等待执行
                case State.padding:
                    this.finallyList.push(handler);
                    break;
                // 当状态已经改变时，立即执行对应的回调函数
                case State.fulfilled:
                case State.rejected:
                    handler(value);
                    break;
            }
        });
    }

    //then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2>;
    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: OnFulfilledFn<T, TResult1> | undefined | null,
        onRejected?: OnRejectedFn<TResult2> | undefined | null,
    ): MyPromise<TResult1 | TResult2> {
        const {status, value} = this;
        // const status = this.status;
        // const value = this.value;

        // 在内部调用 泛型没有意义 无法知道到底是什么类型
        const result = new MyPromise<TResult1 | TResult2>((resolve, reject) => {
            const fulfilled = (value: T) => {
                try {
                    if (typeof onFulfilled !== "function") {
                        resolve(value as any);
                        return;
                    }
                    const result = onFulfilled(value);
                    if (isPromiseLike(result)) {
                        result.then(resolve, reject);
                        return;
                    }
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            };
            const rejected = (reason: any) => {
                try {
                    if (typeof onRejected !== "function") {
                        reject(reason);
                        return;
                    }
                    const result = onRejected(reason);
                    if (isPromiseLike(result)) {
                        result.then(resolve, reject);
                        return;
                    }
                    // then 返回的promise是fulfill状态
                    resolve(result);

                } catch (e) {
                    reject(e);
                }
            };
            switch (status) {
                // 当状态为pending时，将then方法回调函数加入执行队列等待执行
                case State.padding:
                    this.fulfillList.push(fulfilled);
                    this.rejectList.push(rejected);
                    break;
                // 当状态已经改变时，立即执行对应的回调函数
                case State.fulfilled:
                    fulfilled(value);
                    break;
                case State.rejected:
                    rejected(value);
                    break;
            }
        });
        return result;
    }

}