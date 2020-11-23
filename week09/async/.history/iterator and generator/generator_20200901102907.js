function *createIterator() {
  yield 1;
  yield 2;
  yield 3;
}

let iterator = createIterator();

console.log(iterator.next().value);
console.log(iterator.next().value);
console.log(iterator.next().value);