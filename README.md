# Bangla Input Tools

A versatile bangla input tools for the web

**Live Demo**: https://dipu-bd.github.io/jquery.bangla/ 

## Installation

```
$ npm i --save jquery jquery.bangla
```

## Usage (Webpack)

```javascript
import 'jquery.bangla';

// Or,
require('jquery.bangla');

// Then, on some editable elements...

$('input[type="text"]').bangla(); // input box

$('textarea').bangla(); // text area

$('div[contenteditable="true"]').bangla(); // content editable div

$('.note-editable').bangla() // summer-note (a free WYSWYG editor)
```

## Usage (Browser)

1. Clone this repository and go to project folder.
2. Perform `npm install`
3. Then `npm run build`
4. Copy the script file inside `dist/` folder to your static assets directory
5. See the example in [gh-pages branch](https://github.com/dipu-bd/jquery.bangla/blob/gh-pages/index.html) for usage.

## License

> [Mozilla Public License Version 2.0](https://github.com/dipu-bd/jquery.bangla/blob/master/LICENSE)
