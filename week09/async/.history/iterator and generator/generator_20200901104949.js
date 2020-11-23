/**
 * generator
 *  function * 
 *    * mark 函数是生成器
 * 
 * 
 * @return 
 *  iterator
 *   */

function *createIterator() {
  for (let i = 0; i < items.length; i++) {
    yield items[i];
  }
 
  /*  yield 1;  // yield强制中断执行流
  yield 2;
  yield 3; */
}

let iterator = createIterator();

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());