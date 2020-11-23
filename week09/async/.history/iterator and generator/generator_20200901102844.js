function *createIterator() {
  yield 1;
  yield 2;
  yield 3;
}

let iterator = createIterator();

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());