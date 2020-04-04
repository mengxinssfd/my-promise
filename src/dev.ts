import MyPromise from "./index";
// import MyPromise2 from "./other";
// import microTask from "./microtask";

/*const p = new Promise<number>((res, rej) => {
    res();
});
p.then(value => {

}).catch((reason => {
})).finally();

const pa = Promise.all([p]);
pa.then();

const mp = new MyPromise<number>((resolve, reject) => {
    setTimeout(() => {
        reject(10086);
    }, 10);
});
mp.then(value => {
    return value;
}, reason => {
    console.log(reason);
    return 123;
}).then(value => {
    console.log(value);
}, reason => {
});
// MyPromise.reject();
MyPromise.reject("reject catch").catch(reason => {
    console.log(reason);
}).finally(function () {
    console.log("mp reject catch finally");
});

Promise.reject("reject catch").catch(reason => {
    console.log(reason);
}).finally(function () {
    console.log("p reject catch finally");
});

MyPromise.resolve().finally(function () {
    console.log("resolve finally");
});

const mp11 = new MyPromise<number>(res => setTimeout(() => res(1), 500));
const mp12 = new MyPromise<number>(res => setTimeout(() => res(2), 1000));
// const mp13 = new MyPromise<number>(res => res(3));
MyPromise.race([mp11, mp12, "123"]).then(value => {
    console.log("mp race", value);
});
const p1 = new Promise<number>(res => setTimeout(() => res(1), 500));
const p2 = new Promise<number>(res => setTimeout(() => res(2), 100));
const p3 = new Promise<number>(res => setTimeout(() => res(3), 200));
Promise.race([p1, p2, p3]).then(value => {
    console.log("p race", value);
});

// all

const mp111 = new MyPromise<number>(res => setTimeout(() => res(1), 500));
const mp121 = new MyPromise<number>(res => setTimeout(() => res(2), 100));
// const mp13 = new MyPromise<number>(res => res(3));
MyPromise.all([mp111, mp121, "true", true, null, undefined, {a: 123}, function () {

}]).then(value => {
    console.log("mp all", value);
}).catch(reason => console.log(reason));


MyPromise.all([]);//.then(value => console.log("empty", value));

const p11 = new Promise<number>(res => setTimeout(() => res(1), 500));
const p21 = new Promise<number>(res => setTimeout(() => res(2), 100));
const p31 = new Promise<number>(res => setTimeout(() => res(3), 200));
Promise.all([p11, p21, p31, Promise.reject("hhhh")]).then(value => console.log("p all", value)).catch(reason => console.log(reason));

// *********Promise.reject();***********
MyPromise2.reject("MyPromise2 reject").finally(() => {
    console.log("MyPromise2 finally");
});
// Promise reject finally不会塞到reject里面
Promise.reject("Promise reject").finally(() => {
    console.log("Promise finally");
});
MyPromise.reject("MyPromise reject 1").finally(() => {
    console.log("MyPromise finally  1");
});
// debugger
MyPromise.reject("MyPromise reject 2").catch(() => {
}).finally(() => {
    console.log("MyPromise finally  2");
});

setTimeout(function () {
    console.log("task", "timeout");
});
console.log(microTask(function () {
    console.log("task", "microtask");
}));
console.log("task", "start");*/
/*new Promise(res => {
    console.log("promise1");
    res();
}).then(() => {
    new Promise(r => {
        r();
    }).then(() => {
        console.log("then 2-1");
    }).then(() => {
        console.log("then2-2");
    });
}).then(() => {
    console.log("then12");
});*/
new MyPromise(res => {
    console.log("MyPromise1");
    res();
}).then(() => {
    console.log("then 1-1");
    new MyPromise(r => {
        console.log("MyPromise2");
        r();
    }).then(() => {
        console.log("then 2-1");
    }).then(() => {
        console.log("then 2-2");
    });
}).then(() => {
    console.log("then 1-2");
});
