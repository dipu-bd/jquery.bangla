import ViewBox from './view-box'
import AvroPhonetic from './lib/avro.min'

require('./lib/jquery.caret')

const KVStore = window.localStorage
const $ = window.$ || window.jQuery || console.error('Error: jQuery does not exists!')

const STORE_KEY = '__avro--candidates'

const KEY_CODE = {
  ESC: 27,
  TAB: 9,
  ENTER: 13,
  CTRL: 17,
  A: 65,
  P: 80,
  N: 78,
  Z: 90,
  0: 96,
  9: 105,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  BACKSPACE: 8,
  SPACE: 32,
  DOT: 190
}

function registerInputTool ($elem, view) {
  // Necessary variables
  let isBN = true
  let word = ''
  let suggestions = []
  let selectedIndex = -1
  let caretPosBeforeBlur = 0

  // Initialize avro
  const avro = AvroPhonetic(
    function () {
      return JSON.parse(KVStore.getItem(STORE_KEY) || '{}')
    },
    function (candidates) {
      KVStore.setItem(STORE_KEY, JSON.stringify(candidates || {}))
    }
  )

  // Initialize view
  view.onClick((index) => {
    selectedIndex = index
    commitCurrentWord()
  })

  // Updates the current word
  const setWord = (newWord) => {
    word = newWord || ''
    suggestions = []
    selectedIndex = -1
    // get new suggestions
    if (word) {
      const past = avro.candidate(word)
      suggestions = avro.suggest(word).words
      selectedIndex = suggestions.indexOf(past)
      if (suggestions.length && selectedIndex < 0) {
        selectedIndex = 0
      }
    }
    // update the view
    view.suggestions = suggestions
    view.active = selectedIndex
    view.word = word
    view.update()
  }

  // Sets the selected index
  const setSelectedIndex = (index) => {
    selectedIndex = -1
    if (typeof index === 'number' && suggestions.length > 0) {
      selectedIndex = (index + suggestions.length) % suggestions.length
    }
    view.setSelected(selectedIndex)
  }

  // Commit the current word
  const commitCurrentWord = () => {
    let selected = null
    if (selectedIndex >= 0 || selectedIndex < suggestions.length) {
      selected = suggestions[selectedIndex]
    }
    selected = selected || word
    insertAtCursor(selected)
    avro.commit(word, selected)
    setWord('')
  }

  const insertAtCursor = (text) => {
    if (!$elem.is(':focus')) {
      $elem.focus()
    }
    let pos = $elem.caret('pos')
    if ($elem.attr('contenteditable') !== 'true') {
      // not content-editable
      let val = $elem.val()
      val = val.substr(0, pos) + text + val.substr(pos)
      $elem.val(val)
    } else {
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
        console.log(document.selection.createRange())
      }
    }
    $elem.caret('pos', pos + text.length)
  }

  //
  // Watch on window KeyDown
  //
  $(window).keydown((e) => {
    if (e.keyCode === KEY_CODE.ESC && word) {
      setWord('')
      return false
    }
  })

  //
  // Watch on element blur event
  //
  $elem.blur(() => {
    caretPosBeforeBlur = $elem.caret('pos')
  })
  $elem.focus(() => {
    $elem.caret('pos', caretPosBeforeBlur || 0)
  })

  //
  // Watch on element KeyDown
  //
  $elem.keydown((e) => {
    if (e.ctrlKey && [KEY_CODE.DOT, KEY_CODE.SPACE].indexOf(e.keyCode) >= 0) {
      isBN = !isBN
    }
    if (!isBN) return true
    switch (e.keyCode) {
      case KEY_CODE.UP:
        if (!word) return true
        setSelectedIndex(selectedIndex - 1)
        if (selectedIndex >= 0) return false
        break
      case KEY_CODE.DOWN:
        if (!word) return true
        setSelectedIndex(selectedIndex + 1)
        if (selectedIndex >= 0) return false
        break
      case KEY_CODE.A:
        if (!e.ctrlKey || !word) break
        setWord('')
        return true
      case KEY_CODE.ESC:
        if (!word) return true
        setWord('')
        return false
      case KEY_CODE.BACKSPACE:
        if (!word) return true
        if (e.ctrlKey) {
          setWord('')
        } else {
          setWord(word.substr(0, word.length - 1))
        }
        return false
    }

    if (e.altKey || e.ctrlKey) {
      return true
    }
    if (e.keyCode === 190 ||
        (e.keyCode >= 65 && e.keyCode <= 90) ||
        (e.keyCode >= 96 && e.keyCode <= 105)) {
      setWord(word + e.key)
      return false
    }

    if (e.key !== 'Shift' && word.length) {
      commitCurrentWord()
      if ([KEY_CODE.ENTER, KEY_CODE.TAB].indexOf(e.keyCode) >= 0) {
        return false
      }
    }

    return true
  })
}

$.fn.bangla = function (action, ...params) {
  return this.each(function () {
    const view = new ViewBox($(this))
    registerInputTool($(this), view)
  })
}

export default registerInputTool
