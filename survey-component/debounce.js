export default function debounce(fn, wait = 0) {
  let called = false;
  return function debounceReturn(...args) {
    if (!called) {
      const context = this;
      called = true;
      setTimeout(() => {
        called = false;
        fn.apply(context, args);
      }, wait);
    }
  };
}
