
/**
 * This file contains the mock implementation of Mongoose Schema for testing
 */

// Enhanced Schema mock class with method support
export class SchemaMock {
  definition: any;
  indexes: any[] = [];
  virtuals: Record<string, any> = {};
  hooks: Record<string, any[]> = {};
  methodsObj: Record<string, Function> = {};

  constructor(definition: any, options?: any) {
    this.definition = definition;
  }

  index(fields: any, options?: any) {
    this.indexes.push({ fields, options });
    return this;
  }

  virtual(name: string) {
    const virtualObj = {
      get: (fn: Function) => {
        this.virtuals[name] = { getter: fn };
        return virtualObj;
      },
      set: (fn: Function) => {
        if (!this.virtuals[name]) this.virtuals[name] = {};
        this.virtuals[name].setter = fn;
        return virtualObj;
      }
    };
    return virtualObj;
  }

  pre(action: string, callback: Function) {
    if (!this.hooks[action]) this.hooks[action] = [];
    this.hooks[action].push(callback);
    return this;
  }

  post(action: string, callback: Function) {
    if (!this.hooks[`post:${action}`]) this.hooks[`post:${action}`] = [];
    this.hooks[`post:${action}`].push(callback);
    return this;
  }

  get methods() {
    return this.methodsObj;
  }
  
  set methods(methodsObj: Record<string, Function>) {
    this.methodsObj = methodsObj;
  }
}

// Make SchemaClass both a function and a class
const SchemaClass = function(definition: any, options?: any) {
  return new SchemaMock(definition, options);
} as any;

// Assign the constructor
SchemaClass.prototype = SchemaMock.prototype;
SchemaClass.constructor = SchemaMock;

export default SchemaClass;
