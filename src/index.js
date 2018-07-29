import AvroPhonetic from './lib/avro.min.js'

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

function insertAtCursor ($elem, text) {
  const pos = $elem.caret('pos')
  if ($elem.attr('contenteditable') === 'true') {
    const node = document.createTextNode(text)
    console.log(node)
    $elem.append()
  } else {
    let val = $elem.val()
    val = val.substr(0, pos) + text + val.substr(pos)
    $elem.val(val)
  }
  $elem.caret('pos', pos + text.length)
}

function registerInputTool ($elem, v) {
  if (v) console.log('config', v)
  let isBN = true

  const avro = AvroPhonetic(
    function () {
      return JSON.parse(KVStore.getItem(STORE_KEY) || '{}')
    },
    function (candidates) {
      KVStore.setItem(STORE_KEY, JSON.stringify(candidates || {}))
    }
  )

  let word = ''
  let suggestions = []
  let selectedIndex = -1

  const updateView = () => {
    // get or generate view
    if (!window.document.getElementById('bangla--suggestions')) {
      const view = $(`<div id="bangla-suggestions">&nbsp;</div>`)
      $('body').append(view)
      view.css({
        'font-size': $elem.css('font-size') || (16 + 'px'),
        'display': 'none',
        'z-index': '10000',
        'position': 'fixed',
        'min-width': '200px',
        'background': '#f7f7f9',
        'border-radius': '3px',
        'border': '1px solid #dcdcdf',
        'box-shadow': '0 0 5px 0 rgba(#000, 0.18), 0 0 0 1px rgba(#000, 0.12)'
      })
    }
    const view = $('#bangla-suggestions')

    // check if in need of view
    view.html('')
    if (!word) {
      return view.css('display', 'none')
    }

    // add current running word
    const running = $(`<div>${word}</div>`)
    running.css({
      'color': 'navy',
      'font-style': 'bold',
      'font-weight': '1.15em',
      'margin': '3px',
      'margin-bottom': 0,
      'padding': '5px 12px',
      'background': 'white',
      'border-bottom': '1px solid #dedfe5'
    })
    view.append(running)

    // generate suggestion list
    suggestions.slice(0, 10).map((val, index) => {
      const item = $(`<div>${val}</div>`)
      item.css({
        'cursor': 'pointer',
        'padding': '6px 14px',
        'border-top': '1px solid #dedfe5'
      })
      if (index === selectedIndex) {
        item.css({
          'color': 'white',
          'background': '#39f'
        })
      }
      item.click(() => {
        selectedIndex = index
        selectCurrentWord()
      })
      view.append(item)
    })

    // display the view
    const offset = $elem.caret('offset')
    view.css({
      display: 'block',
      top: (offset.top + offset.height + 5) + 'px',
      left: offset.left + 'px'
    })
  }

  const buildSuggestion = function (e) {
    if (!word.length) return
    const past = avro.candidate(word)
    suggestions = avro.suggest(word).words
    selectedIndex = suggestions.indexOf(past)
    if (selectedIndex < 0 && suggestions.length) {
      selectedIndex = 0
    }
  }

  const setWord = (newWord) => {
    word = newWord || ''
    if (word) buildSuggestion()
    updateView()
  }

  const setSelectedIndex = (index) => {
    if (suggestions.length > 0) {
      selectedIndex = (index + suggestions.length) % suggestions.length
    } else {
      selectedIndex = -1
    }
    updateView()
  }

  const selectCurrentWord = () => {
    let selected = word
    if (selectedIndex >= 0 || selectedIndex < suggestions.length) {
      selected = suggestions[selectedIndex]
    }
    $elem.focus()
    insertAtCursor($elem, selected)
    avro.commit(word, selected)
    setWord('')
  }

  $elem.keydown((e) => {
    if (e.ctrlKey && [KEY_CODE.DOT, KEY_CODE.SPACE].indexOf(e.keyCode) >= 0) {
      isBN = !isBN
    }
    if (!isBN) return true

    switch (e.keyCode) {
      case KEY_CODE.UP:
        setSelectedIndex(selectedIndex - 1)
        if (selectedIndex >= 0) return false
        break
      case KEY_CODE.DOWN:
        setSelectedIndex(selectedIndex + 1)
        if (selectedIndex >= 0) return false
        break
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
      selectCurrentWord()
      if ([KEY_CODE.ENTER, KEY_CODE.TAB].indexOf(e.keyCode) >= 0) {
        return false
      }
    }

    return true
  })
}

$.fn.bninput = function () {
  return this.each((v) => registerInputTool($(this, v)))
}

export default registerInputTool
