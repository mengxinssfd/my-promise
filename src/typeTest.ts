const obj1 = {a: 1, b: 2, c: 3};

const obj2: Omit<typeof obj1, "a"> = {b: 1, c: 3}; // 去掉a
const obj3: Pick<typeof obj1, "a"> = {a: 2}; // 只要a
const obj4: Partial<typeof obj1> = {c: 1}; // 全部转为可选参数
const obj5: Required<typeof obj4> = {a: 1, b: 2, c: 3}; // 全部转为必选参数 与Partial相反
const obj6: Readonly<typeof obj4> = {a: 1, b: 2, c: 3}; // 全部转为readonly参数
// obj6.a = 1;
const obj7: Record<"a" | "b", number> = {a: 123, b: 123}; //  === obj7:{a:number,b:number}
const obj8: Exclude<{ a: number, b: string, c: number }, typeof obj1> = {a: 123, b: "12", c: 1}; //  如果type1 extends obj1则为never否则为type1
const obj9: Extract<{ a: number, b: number, c: number }, typeof obj1> = {a: 123, b: 123, c: 1}; //  如果type1 extends obj1则为type1否则为never 与Exclude相反
const obj11: Exclude<"a" | "b", "a"> = "b"; // type Exclude<T, U> = T extends U ? never : T; 如果type1 extends obj1则为never否则为type1
const obj12: Extract<"a" | "b", "a"> = "a"; // Extract<T, U> = T extends U ? T : never; 如果type1 extends obj1则为type1否则为never 与Exclude相反
const obj10: NonNullable<typeof obj1> = {a: 123, b: 123, c: 1}; //  T extends null | undefined ? never : T;

interface FnType {
    a: string;
    b: number;

    new(a: string, b: number): FnType

    (c: string, d: number): string;
}

// @ts-ignore
const Fn: FnType = function (this: FnType, a, b) {
    if (this instanceof Fn) {
        this.a = a;
        this.b = b;
    }
    return a + b;
};


const f1 = Fn("123", 1223);
const f = new Fn("1212", 123);

console.log(f1);
console.log(f, f.b);

const v1: Parameters<typeof Fn> = ["a", 2]; // 取出test的参数类型
class Class {
    a: string;
    b: string;

    constructor(a: string, b: string) {
        this.a = a;
        this.b = b;
    }

}

const v2: ConstructorParameters<typeof Class> = ["a", "3"]; // 取出test的参数类型
const v3: ReturnType<typeof Fn> = "123"; // 函数返回值类型
const v4: InstanceType<FnType> = new Fn("", 1); // class构造函数返回值类型 需要函

type o = { obj: object };

function fn3(a: { key: string, v: any } | o) {
    console.log((a as Exclude<typeof a, o>).key);
}


