/**
 * @see https://github.com/richardchien/cqhttp-node-sdk/blob/master/src/callable.js
 */

class CallableInstance extends Function {
  constructor(property: string) {
    super();
    const func = this.constructor.prototype[property]
    const apply = function () { return func.apply(apply, arguments) }
    Object.setPrototypeOf(apply, this.constructor.prototype)
    Object.getOwnPropertyNames(func).forEach(function (p) {
      Object.defineProperty(apply, p, Object.getOwnPropertyDescriptor(func, p))
    })
    return apply
  }
}

export default CallableInstance

// function CallableInstance (property: string) {
//   const func = this.constructor.prototype[property];
//   const apply = function () { return func.apply(apply, arguments); }
//   Object.setPrototypeOf(apply, this.constructor.prototype);
//   Object.getOwnPropertyNames(func).forEach(function (p) {
//     Object.defineProperty(apply, p, Object.getOwnPropertyDescriptor(func, p));
//   });
//   return apply;
// }
// CallableInstance.prototype = Object.create(Function.prototype);

// export {CallableInstance}
