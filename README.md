# Bangla Input Tools

A versatile bangla input tools for the web

**Live Demo**: https://dipu-bd.github.io/bangla-input/ 

## Installation

```
$ npm i --save jquery jquery.bninput
```

## Usage (Webpack)

```javascript
import 'jquery.bninput';

// Or,
require('jquery.bninput');

// Then, on some editable elements...

$('input[type="text"]').bninput(); // input box

$('textarea').bninput(); // text area

$('div[contenteditable="true"]').bninput(); // content editable div

$('.note-editable').bninput(contentEditable: true) // summer-note (a free WYSWYG editor)
```

## License

> [Mozilla Public License Version 2.0](https://github.com/dipu-bd/bangla-input/blob/master/LICENSE)
