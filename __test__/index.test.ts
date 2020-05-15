import MyPromise from "../src/index";

function sleep(delay: number = 0): Promise<void> {
    return new Promise(res => setTimeout(res, delay));
}

const str = {
    test: "test",
    all: "all",
    finally: "finally",
    race: "race",
    resolve: "resolve",
    reject: "reject",
};
test("private resolve", async function () {
    let mpv1 = "test";
    let mpv2 = "test";
    let mpv3 = "";
    let mpv4 = "";
    let pv1 = "test";
    let pv2 = "test";

    const mp1 = new MyPromise<string>((resolve, reject) => {
        resolve(MyPromise.resolve(mpv1));
    });
    const p1 = new Promise<string>((resolve, reject) => {
        resolve(pv1);
    });

    p1.then(value => {
        expect(pv1).toBe(value);
        pv1 = str.resolve;
        return pv1;
    }).then(value => {
        expect(value).toBe(str.resolve);
        pv2 = str.resolve;
    });

    mp1.then(value => {
        expect(mpv1).toBe(value);
        mpv1 = str.resolve;
        return mpv1;
    }).then(value => {
        expect(value).toBe(str.resolve);
        mpv2 = str.resolve;
        return MyPromise.resolve("then return promise");
    }).then(value => mpv3 = value);

    await sleep(100);

    expect(pv1).toBe(str.resolve);
    expect(pv2).toBe(str.resolve);
    expect(mpv1).toBe(str.resolve);
    expect(mpv2).toBe(str.resolve);
    expect(mpv3).toBe("then return promise");

    // value PromiseLike reject
    const mp2 = new MyPromise(resolve => {
        resolve(MyPromise.reject("rej"));
    });
    let nv1 = "";
    mp2.then(value => {
        nv1 = "resolve";
    }, reason => {
        nv1 = "reject";
    });

    await sleep(100);
    expect(nv1).toBe("reject");

    // fulfilled then  // 值是第一次赋的值
    mp1.then(value => mpv4 = value);
    await sleep(10);
    expect(mpv4).toBe("test");

    // then resolve 报错
    mp1.then(() => {
        throw new Error("error");
    }).catch(reason => mpv4 = "error catch");
    await sleep(10);
    expect(mpv4).toBe("error catch");
});
test("private reject", async function () {
    let mpv1 = "test";
    let mpv2 = "test";
    let mpv3 = "";
    let mpv4 = "";
    let pv1 = "test";
    let pv2 = "test";

    const mp1 = new MyPromise<string>((resolve, reject) => {
        reject(mpv1);
    });
    const p1 = new Promise<string>((resolve, reject) => {
        reject(pv1);
    });

    p1.then(null, value => {
        expect(pv1).toBe(value);
        pv1 = str.reject;
        return pv1;
    }).then(value => {
        expect(value).toBe(str.reject);
        pv2 = str.resolve;
    });

    mp1.then(null, value => {
        expect(mpv1).toBe(value);
        mpv1 = str.reject;
        return mpv1;
    }).then(value => {
        expect(value).toBe(str.reject);
        mpv2 = str.resolve;
    });

    MyPromise
        .reject("reject return promise")
        .then(null, reason => MyPromise.reject(reason))
        .catch(reason => mpv3 = reason);

    await sleep(100);

    expect(pv1).toBe(str.reject);
    expect(pv2).toBe(str.resolve);
    expect(mpv1).toBe(str.reject);
    expect(mpv2).toBe(str.resolve);
    expect(mpv3).toBe("reject return promise");

    // rejected then  // 值是第一次赋的值
    mp1.then(null, value => mpv4 = value);

    await sleep(10);
    expect(mpv4).toBe("test");

    // then reject 报错
    mp1.then(null, () => {
        throw new Error("error");
    }).catch(reason => mpv4 = "error catch");
    await sleep(10);
    expect(mpv4).toBe("error catch");
});
test("public resolve", async function () {
    let mpv1 = "test";
    let mpv2 = "test";
    let mpv3 = "test3";
    let pv1 = "test";
    let pv2 = "test";
    const mp = MyPromise.resolve(mpv1);
    const p = Promise.resolve(pv1);

    mp.then(value => {
        expect(mpv1).toBe(value);
        mpv1 = str.resolve;
        return mpv1;
    }, reason => {
        expect(mpv1).toBe(reason);
        mpv1 = str.reject;
        return mpv1;
    }).then(value => {
        expect(value).toBe(str.resolve);
        mpv2 = str.resolve;
        return mpv2;
    }).then().then(value => mpv3 = value);

    p.then(value => {
        expect(pv1).toBe(value);
        pv1 = str.resolve;
        return pv1;
    }, reason => {
        expect(pv1).toBe(reason);
        pv1 = str.reject;
        return pv1;
    }).then(value => {
        expect(value).toBe(str.resolve);
        pv2 = value;
    });

    await sleep(100);
    expect(mpv1).toBe(str.resolve);
    expect(mpv2).toBe(str.resolve);
    expect(mpv3).toBe(mpv2);

    expect(pv1).toBe(str.resolve);
    expect(pv2).toBe(str.resolve);

    // resolve(Promise) => Promise
    MyPromise.resolve(new MyPromise<string>(resolve => resolve("resolve(Promise)"))).then(value => mpv3 = value);

    await sleep(10);
    expect(mpv3).toBe("resolve(Promise)");
});
test("public reject", async function () {
    let result = "test";
    let result2 = "test";
    const p1 = MyPromise.reject(result);

    p1.then(value => {
        expect(result).toBe(value);
        result = str.resolve;
    }, reason => {
        expect(result).toBe(reason);
        result = str.reject;
    }).then(value => result2 = "onFulfilled", reason => result2 = "onRejected");

    await sleep(50);

    expect(result).toBe(str.reject);
    expect(result2).toBe("onFulfilled");

    // throw uncaught移动到dev.ts测试
    // 没办法catch到异常
    // expect(() => {
    //     MyPromise.reject("throw error");
    // }).toThrow();
});
test("catch and finally", async function () {
    const values: any = {};
    let result = "test";
    let result2 = "test";
    let result3 = "test";
    const p1 = MyPromise.reject(result);

    p1.catch(value => {
        expect(result).toBe(value);
        result = "catch";
        return result;
    }).then(value => {
        expect(value).toBe("catch");
        result2 = str.resolve;
    }).finally(() => {
        result3 = str.finally;
    }).finally(); // branch if (typeof onFinally !== "function")

    await sleep(100);

    expect(result2).toBe(str.resolve);
    expect(result3).toBe(str.finally);

    // Promise.reject("hello").catch().then(v=>console.log(v))
    Promise.reject("hello").catch(reason => reason).then(v => values["Promise.reject.catch.then"] = v);
    const mp2 = MyPromise.reject("hello").catch(reason => reason).then(v => values["MyPromise.reject.catch.then"] = v);

    await sleep(50);
    expect(values["Promise.reject.catch.then"]).toBe("hello");
    expect(values["Promise.reject.catch.then"]).toBe(values["MyPromise.reject.catch.then"]);

    // finally status !== padding
    mp2.finally(() => {
        values["Promise.reject.catch.then"] = "finally";
    });
    await sleep(50);
    expect(values["Promise.reject.catch.then"]).toBe("finally");
});
test("finally", async function () {
    let s1 = "";
    let s2 = "";
    let fc1 = "";
    let fc2 = "";
    const p = new Promise((res) => {
        setTimeout(res, 20);
    });
    p.finally(() => {
        s1 += "f1";
    }).then((v) => {
        s1 += "ft1";
    });
    p.then(() => {
        s1 += "t1";
    });
    p.finally(() => {
        s1 += "f2";
    });

    const myP = new MyPromise((res) => {
        setTimeout(res, 20);
    });
    myP.finally(() => {
        s2 += "f1";
    }).then((v) => {
        s2 += "ft1";
    });
    myP.then(() => {
        s2 += "t1";
    });
    myP.finally(() => {
        s2 += "f2";
    });

    Promise.reject("error").finally(() => {
        fc1 = "f";
    }).catch((e) => {
        fc1 += " error";
    });
    MyPromise.reject("error").finally(() => {
        fc2 = "f";
    }).catch((e) => {
        fc2 += " error";
    });

    await sleep(50);

    const result = "f1t1f2ft1";
    expect(s1).toBe(result);
    expect(s2).toBe(result);
    expect(fc1).toBe("f error");
    expect(fc2).toBe("f error");
});
test("race", async function () {
    let result1 = "test1";
    let result2 = "test2";
    let result3 = "test3";
    let result4 = "test4";
    let result = "";
    const p1 = new MyPromise<string>(res => setTimeout(() => res(result1), 10));
    const p2 = MyPromise.resolve(result2);
    const p3 = new MyPromise<string>(res => setTimeout(() => res(result3), 30));

    MyPromise.race([p1, p2, p3, result4]).then(value => result = value);

    await sleep(50);

    expect(result).toBe(result4);
});
test("all", async function () {
    let result1 = "test1";
    let result2 = "test2";
    let result3 = "test3";
    let result4 = "test4";
    let result: string[] = [];
    const p1 = new MyPromise<string>(res => setTimeout(() => res(result1), 10));
    const p2 = MyPromise.resolve(result2);
    const p3 = new MyPromise<string>(res => setTimeout(() => res(result3), 30));

    MyPromise.all([p1, p2, p3, result4]).then(value => {
        result = value;
    });

    await sleep(50);
    expect(result).toEqual([result1, result2, result3, result4]);

    await sleep(10);
    result.splice(0, result.length);
    MyPromise.all([p1, p2, p3, MyPromise.reject(100)]).then(value => {
        result = value;
    }).catch(reason => result4 = reason);

    await sleep(50);
    expect(result).toEqual([]);
    expect(result4).toEqual(100);

    // Promise.all([])
    let arr;
    MyPromise.all([]).then(value => {
        arr = value;
    });

    await sleep(10);
    expect(arr).toEqual([]);
});

