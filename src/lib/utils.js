export const KEY_CODE = {
  ESC: 27,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  CAPS_LOCK: 20,
  ALT: 18,
  A: 65,
  P: 80,
  N: 78,
  Z: 90,
  ZERO: 96,
  NINE: 105,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  BACKSPACE: 8,
  SPACE: 32,
  DOT: 190
}

export function insertAtCursor ($elem, text) {
  if (!$elem) return
  text = text || ''

  // focus on input
  if (!$elem.is(':focus')) {
    $elem.focus()
  }

  // get caret position
  if (!$elem.caret) {
    return console.log('Caret.js is not enalbed for: ', $elem)
  }
  let pos = $elem.caret('pos')

  try {
    // if not content editable
    if ($elem.attr('contenteditable') !== 'true') {
      let val = $elem.val()
      const start = $elem.prop('selectionStart')
      const stop = $elem.prop('selectionEnd')
      val = val.substr(0, start) + text + val.substr(stop)
      return $elem.val(val)
    }
    // when content-ediable
    if (window.getSelection) {
      const sel = window.getSelection()
      if (sel.getRangeAt && sel.rangeCount) {
        const range = sel.getRangeAt(0)
        const selectedText = range.extractContents().textContent
        if (selectedText) {
          $elem.trigger({ type: 'keypress', which: KEY_CODE.BACKSPACE })
          pos -= selectedText.length
        }
        // range.deleteContents()
        range.insertNode(document.createTextNode(text))
      }
    } else if (document.selection && document.selection.createRange) {
      document.selection.createRange().text = text
    }
  } finally {
    $elem.caret('pos', pos + text.length)
  }
}
