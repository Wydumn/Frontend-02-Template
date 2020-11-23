/**
 * generator
 *  function *
 *    * mark 函数是生成器
 *
 *
 * @return
 *  iterator
 *   */

let createIterator = function *(items) {
  for (let i = 0; i < items.length; i++) {
    yield items[i];
  }

  /* yield 关键字只能用于生成器内部，生成器内部函数使用会抛错
  items.forEach(function(item) {
    yield item + 1;   // SyntaxError: Unexpected identifier
  }) */

  /*  yield 1;  // yield强制中断执行流
  yield 2;
  yield 3; */
}

let iterator = createIterator([1, 2, 3]);

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());