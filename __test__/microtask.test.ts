import microTask from "../src/microtask";

test("microtask", async () => {
    let str = "";
    const p1 = new Promise(resolve => {

        setTimeout(function () {
            // console.log("timeout");
            str += "timeout";
            resolve();
        });

    });
    const p2 = new Promise(resolve => {
        microTask(function () {
            // console.log("microtask");
            str += "microtask";
            resolve();
        });
    });

    // console.log("start");
    str += "start";

    await Promise.all([p1, p2]);
    expect(str).toBe("startmicrotasktimeout");
});