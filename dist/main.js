"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
/*========= CLASS DECORATOR=========*/
function LogClass(constructor) {
    console.log(`Class ${constructor.name} was instantiated.`);
}
let User = class User {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
};
User = __decorate([
    LogClass
], User);
const user = new User('Ahmad', 90);
const user2 = new User('Beni');
//=========== METHOD DECORATOR===========
function LogMethod(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        console.log(`Method ${propertyKey} was called with arguments: ${args}`);
        return originalMethod.apply(this, args);
    };
    return descriptor;
}
function LogResult(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        console.log(originalMethod.apply(this, args));
        return originalMethod.apply(this, args);
    };
    return descriptor;
}
let Calculator = class Calculator {
    add(a, b) {
        return a + b;
    }
};
__decorate([
    LogMethod,
    LogResult
], Calculator.prototype, "add", null);
Calculator = __decorate([
    LogClass
], Calculator);
const calc = new Calculator();
calc.add(5, 3);
//=============== ACCESOR DECORATOR =============//
function ValidateAge(target, propertyKey, descriptor) {
    const originalSetter = descriptor.set;
    //console.log(descriptor);
    descriptor.set = function (value) {
        if (value < 0 || value > 100) {
            throw new Error('Age must be between 0 and 100.');
        }
        originalSetter.call(this, value);
    };
    return descriptor;
}
class Person {
    constructor() {
        this._age = 0;
    }
    set age(value) {
        this._age = value;
    }
    get age() {
        return this._age;
    }
}
__decorate([
    ValidateAge
], Person.prototype, "age", null);
const person = new Person();
person.age = 2;
console.log(person.age);
//============== PROPERTIES DECORATOR================//
function Required(target, propertyKey) {
    const metadataKey = `__required__${propertyKey}`;
    Object.defineProperty(target, metadataKey, {
        value: true,
        configurable: false
    });
}
class Employee {
    constructor(name) {
        this.name = name;
    }
}
__decorate([
    Required
], Employee.prototype, "name", void 0);
function validate(obj) {
    for (const key in obj) {
        const metadataKey = `__required__${key}`;
        if (obj[metadataKey] && !obj[key]) {
            throw new Error(`${key} is required`);
        }
        else {
            console.log(obj[key]);
        }
    }
}
const emp = new Employee('beni');
validate(emp);
//============= PARAMETER DECORATOR ============//
function Validate(type) {
    return function (target, propertyKey, parameterIndex) {
        const existingValidators = Reflect.getOwnMetadata('validators', target, propertyKey) || [];
        existingValidators.push({ index: parameterIndex, type });
        Reflect.defineMetadata('validators', existingValidators, target, propertyKey);
    };
}
function mustValid(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        const validators = Reflect.getOwnMetadata('validators', target, propertyKey) || [];
        for (const { index, type } of validators) {
            if (typeof args[index] !== type) {
                throw new Error(`Invalid parameter at index ${index}. Expected type ${type}, but received ${typeof args[index]}.`);
            }
        }
        return originalMethod.apply(this, args);
    };
}
class Validation {
    valid(name, age) {
        console.log(`Name: ${name}, Age: ${age}`);
    }
}
__decorate([
    mustValid,
    __param(0, Validate('string')),
    __param(1, Validate('number'))
], Validation.prototype, "valid", null);
const example = new Validation();
example.valid('beni', 30);
