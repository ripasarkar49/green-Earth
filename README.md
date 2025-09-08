 <!-- Create a README file to answer the following question- -->

1.  What is the difference between var, let, and const?
    Ans: _ var => function scoped, redeclaration allowed.
    _ let => block scoped, can reassign, no redeclare. \* const => block scoped, cannot reassign, but objects can change.

2.  What is the difference between map(), forEach(), and filter()?
    Ans: _ forEach() 1. Loops through array just to do something. 2. Does NOT return a new array.
    _ map()
    Loops and creates a new array with modified values. \* filter()
    Loops and creates a new array with only items that meet a condition.

3.  What are arrow functions in ES6?
    Ans: Arrow functions are shorter syntax for writing functions. They also lexically bind this (useful in certain situations).
    If only one parameter, parentheses are optional: x => x \* 2
    If function body is single expression, return is implicit.

4.  How does destructuring assignment work in ES6?
    Ans: Destructuring allows you to extract values from arrays or objects into variables easily.

5.  Explain template literals in ES6. How are they different from string concatenation?
    Ans:
    *Explain template literals in ES6:
    Template literals are strings enclosed in backticks (` `) instead of quotes.
    They allow string interpolation and multiline strings easily.
    *different from string concatenation:
    No need for + concatenation.
    Supports multiline without \n.
    Can embed expressions directly: ${40 + 3} => 43
