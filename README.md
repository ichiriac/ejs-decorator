# ejs-decorator

Why ? Because the native EJS library does not provides blocks and inheritance. I could use another EJS compliant library or a fork but it does not feels a good solution as EJS may be improved and these solutions may become deprecated.

The promise here is to not change anything from the source code of EJS and still use the library out of the box.

---
>> WORK IN PROGRESS / NOT TESTED
---

# Usage

You can both use your own instance of EJS or just initialize this library directly :

```js
// using your local EJS version
var ejs = require('ejs-decorator')(
  require('ejs')
);
// using the default EJS version shipped with this module 
var ejs = require('ejs-decorator');
```

Sample usage with express :

```js
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs-decorator');
```

# Helpers

## Inheritance 

```html
<%_ layout("default") _%>
some texts ....
```

## Defining Blocks

```html
<%_ block("demo", function() { _%>
some texts ....
<%_ }); _%>
```

## Using Blocks

```html
<%- render("demo"); %>
```

## Define helpers

```html
<%_ helper("foo", function(bar) { _%>
  Hello <%= bar %> !
<%_ }) _%>
```

## Using helpers

```html
<%= foo("baz") %>
```

# Extending your-self EJS

You can also provide your own functions and improve it's functions

## hookOutput

```js
var ejs = require('ejs-decorator');
ejs.hookOutput('sample', function(args, locals, options, output) {
  return output.replaceAll(args[0], args[1]);
});
```

And usage : 
```html
<%_ sample('\n', 'br') _%>
- line 1
- line 2
...
```

## hookCallback

```js
var ejs = require('ejs-decorator');
ejs.hookCallback('sample', function(args, locals, options, cb) {
  // @todo
});
```

And usage : 
```html
- line 1
<%_ sample('\n', 'br', function() { _%>
- line 2
- line 3
<%_ }); _%>
...
```

# License

MIT