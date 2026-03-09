# Project Overview

This repository contains a simple web project with HTML, CSS, and JavaScript files for a login/dashboard interface. Below are some fundamental JavaScript concepts explained as requested.

## JavaScript Fundamentals

### 1. Difference Between `var`, `let`, and `const`

- **`var`**: Function-scoped or globally-scoped if declared outside a function. It is hoisted to the top of its scope and can be redeclared. Variables declared with `var` can be updated and redefined.
- **`let`**: Block-scoped (within `{}`), not hoisted in the same way as `var` (though declaration is hoisted but not initialized). It cannot be redeclared in the same scope but can be updated. `let` helps avoid accidental global leaks and redeclaration.
- **`const`**: Also block-scoped and must be initialized when declared. It cannot be updated or redeclared. For objects and arrays declared with `const`, the reference cannot change but the contents can be modified.

### 2. The Spread Operator (`...`)

The spread operator expands iterable elements (like arrays, strings, or objects) into individual elements. It is used to clone or merge arrays/objects, pass elements as function arguments, or convert iterable data into a list. Example: `const arr2 = [...arr1, 4];` or `const obj2 = {...obj1, name: "new"};`.

### 3. Difference Between `map()`, `filter()`, and `forEach()`

- **`map()`** returns a new array by applying a function to each element of the original array. It does not mutate the original.
- **`filter()`** returns a subset of the array containing elements that pass a provided test function. It also returns a new array and leaves the original intact.
- **`forEach()`** executes a provided function once for each array element but does not return anything; it’s generally used for side effects and does not create a new array.

### 4. Arrow Functions

Arrow functions provide a concise syntax for writing functions using `=>`. They inherit the `this` context from their enclosing scope (lexical `this`), and they cannot be used as constructors or have their own `arguments` object. Example: `const add = (a, b) => a + b;`.

### 5. Template Literals

Template literals are string literals enclosed by backticks (`` ` ``) that allow embedded expressions using `${...}`. They support multi-line strings and interpolation, making string construction more readable compared to traditional concatenation.
