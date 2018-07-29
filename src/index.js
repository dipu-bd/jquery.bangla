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
  let selectedWord = null

  const showSuggestion = function (e) {
    if (!word.length) return
    const past = avro.candidate(word)
    const words = avro.suggest(word).words
    selectedWord = past || (words && words[0]) || word
    console.log('--------------------------------')
    console.log('[' + selectedWord + ']')
    words.forEach(v => console.log(v))
    console.log()
  }

  const updateRunning = (e) => {
    if (e.ctrlKey && [KEY_CODE.DOT, KEY_CODE.SPACE].indexOf(e.keyCode) >= 0) {
      isBN = !isBN
    }
    if (!isBN) return true

    switch (e.keyCode) {
      case KEY_CODE.ESC:
        if (!word) return true
        word = ''
        return false
      case KEY_CODE.BACKSPACE:
        if (!word) return true
        if (e.ctrlKey) {
          word = ''
        } else {
          word = word.substr(0, word.length - 1)
        }
        return false
    }

    if (e.altKey || e.ctrlKey) {
      return true
    }
    if (e.keyCode === 190 ||
        (e.keyCode >= 65 && e.keyCode <= 90) ||
        (e.keyCode >= 96 && e.keyCode <= 105)) {
      word += e.key
      return false
    }

    if (e.key !== 'Shift' && word.length) {
      insertAtCursor($elem, selectedWord)
      avro.commit(word, selectedWord)
      word = ''
      if ([KEY_CODE.ENTER, KEY_CODE.TAB].indexOf(e.keyCode) >= 0) {
        return false
      }
    }

    return true
  }

  $elem.keydown((e) => {
    try {
      return updateRunning(e)
    } finally {
      showSuggestion(e)
    }
  })
}

$.fn.initBangla = function () {
  return this.each((v) => registerInputTool($(this, v)))
}

export default registerInputTool
