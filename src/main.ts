import 'reflect-metadata';
/*========= CLASS DECORATOR=========*/

function LogClass(constructor: Function) {
    console.log(`Class ${constructor.name} was instantiated.`);
}

@LogClass
class User {
    constructor(
        public name: string,
        public age?: number
    ) {}
}

const user = new User('Ahmad', 90);
const user2 = new User('Beni');

//=========== METHOD DECORATOR===========

function LogMethod(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        console.log(`Method ${propertyKey} was called with arguments: ${args}`);
        return originalMethod.apply(this, args);
    };

    return descriptor;
}

function LogResult(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        console.log(originalMethod.apply(this, args));
        return originalMethod.apply(this, args);
    };

    return descriptor;
}

@LogClass
class Calculator {
    @LogMethod
    @LogResult
    add(a: number, b: number) {
        return a + b;
    }
}

const calc = new Calculator();
calc.add(5, 3);

//=============== ACCESOR DECORATOR =============//

function ValidateAge(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalSetter = descriptor.set;
    //console.log(descriptor);
    descriptor.set = function (value: number) {
        if (value < 0 || value > 100) {
            throw new Error('Age must be between 0 and 100.');
        }

        originalSetter!.call(this, value);
    };

    return descriptor;
}

class Person {
    private _age: number = 0;

    @ValidateAge
    set age(value: number) {
        this._age = value;
    }

    get age() {
        return this._age;
    }
}

const person = new Person();
person.age = 2;
console.log(person.age);

//============== PROPERTIES DECORATOR================//
function Required(target: any, propertyKey: string) {
    const metadataKey = `__required__${propertyKey}`;
    Object.defineProperty(target, metadataKey, {
        value: true,
        configurable: false
    });
}

class Employee {
    @Required
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

function validate(obj: any) {
    for (const key in obj) {
        const metadataKey = `__required__${key}`;
        if (obj[metadataKey] && !obj[key]) {
            throw new Error(`${key} is required`);
        } else {
            console.log(obj[key]);
        }
    }
}

const emp = new Employee('beni');
validate(emp);

//============= PARAMETER DECORATOR ============//

function Validate(type: any) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        const existingValidators =
            Reflect.getOwnMetadata('validators', target, propertyKey) || [];
        existingValidators.push({ index: parameterIndex, type });
        Reflect.defineMetadata(
            'validators',
            existingValidators,
            target,
            propertyKey
        );
    };
}

function mustValid(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const validators =
            Reflect.getOwnMetadata('validators', target, propertyKey) || [];

        for (const { index, type } of validators) {
            if (typeof args[index] !== type) {
                throw new Error(
                    `Invalid parameter at index ${index}. Expected type ${type}, but received ${typeof args[
                        index
                    ]}.`
                );
            }
        }
        return originalMethod.apply(this, args);
    };
}

class Validation {
    @mustValid
    public valid(
        @Validate('string') name: string,
        @Validate('number') age: number
    ) {
        console.log(`Name: ${name}, Age: ${age}`);
    }
}

const example = new Validation();
example.valid('beni', 30);
