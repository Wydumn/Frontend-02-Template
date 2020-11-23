function createIterator(items) {
  var i = 0;

  return {

    next: function () {
      var done = (i >= items.length);
      var value = !done ? items[i++] : undefined;

      return {
        done: done,
        value: value
      }
    }
  };
}

var iterator = createIterator([ 1, 2, 3 ]);

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());

/**
 * what is iterator?
 *  an object, has an attribute next, return an object which has two fields: done(mark is there any element not be accessed.) and value(the element)
 *
 *  */