
Stuff to do around here

 - Refactor tests to use should.js, to get better messages
 - Do better error reporting from routes. The error handling is a start, but I am quite sure not every route is using it.
  - Test that routes yield error status codes and not just 500.
  - A better API for by-timestamp queries. Right now we have `new Event(<start>, <end>).byTimestamp()` and that is just plain confusing. We need to use static methods.

There are a few `TODO` comments splattered through the code too.

