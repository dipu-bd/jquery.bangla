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

// to make the caret blinking
window._caretBlinker = window._caretBlinker || (
  setInterval(() => $('.caret-blink').fadeIn(300).fadeOut(500), 1000)
)

function registerInputTool ($elem, v) {
  // modify configs
  if (v) console.log('config', v)

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

  // Build the current view
  const buildView = () => {
    // get or generate view
    const id = 'bangla--suggestions'
    if (!window.document.getElementById(id)) {
      const view = $(`<div id="${id}">&nbsp;</div>`)
      $('body').append(view)
      view.css({
        'font-size': $elem.css('font-size') || (16 + 'px'),
        'display': 'none',
        'z-index': 10000,
        'position': 'fixed',
        'padding': '1px',
        'min-width': '200px',
        'background': '#f7f7f9',
        'border-radius': '3px',
        'border': '1px solid #d6d9db',
        'box-shadow': '0 0 5px 0 rgba(#000, 0.18), 0 0 0 1px rgba(#000, 0.12)'
      })
    }
    return $(`#${id}`)
  }

  // Builds the current word view
  const buildRunningItem = (view) => {
    const running = $(`<div>${word}</div>`)
    running.css({
      'color': 'navy',
      'font-style': 'bold',
      'font-weight': '1.15em',
      'margin': '3px',
      'margin-bottom': 0,
      'background': '#fafafc',
      'overflow': 'visible',
      'padding': '5px 12px',
      'border-bottom': '1px solid #dedfe5',
      'transform': 'translateZ(0)',
      '-moz-transform': 'translateZ(0)',
      '-webkit-transform': 'translateZ(0)'
    })
    const caret = $('<span class="caret-blink">&nbsp</span>')
    caret.css({
      'display': 'inline-block',
      'width': '2px',
      'background-color': '#444',
      'margin-left': '1px'
    })
    running.append(caret)
    view.append(running)
  }

  // Build the list items
  const buildListItems = (view) => {
    suggestions.slice(0, 10).forEach((val, index) => {
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
        commitCurrentWord()
      })
      view.append(item)
    })
  }

  // Udpates the view
  const updateView = () => {
    // get or generate view
    const view = buildView()
    view.html('')

    // check if we need to show view
    if (!word) {
      return view.css('display', 'none')
    }

    // add current running word
    buildRunningItem(view)

    // generate suggestion list
    buildListItems(view)

    // display the view
    const offset = $elem.caret('offset')
    let top = (offset.top + offset.height - window.scrollY + 3) + 'px'
    // const height = offset.top + view.height() + 5
    // if (height > window.innerHeight) {   // check if the view should be on top
    //   top = (offset.top - window.scrollY - view.height() - 7) + 'px'
    //   view.append(running)
    // }
    view.css({
      display: 'block',
      top,
      left: (offset.left) + 'px'
    })
    // console.log(offset.left, offset.top)
  }

  // Builds the suggestion list
  const buildSuggestions = function (e) {
    if (word) {
      const past = avro.candidate(word)
      suggestions = avro.suggest(word).words
      selectedIndex = suggestions.indexOf(past)
      if (selectedIndex < 0 && suggestions.length) {
        selectedIndex = 0
      }
    } else {
      suggestions = []
      selectedIndex = -1
    }
  }

  // Updates the current word
  const setWord = (newWord) => {
    word = newWord || ''
    buildSuggestions()
    updateView()
  }

  // Sets the selected index
  const setSelectedIndex = (index) => {
    if (suggestions.length > 0) {
      selectedIndex = (index + suggestions.length) % suggestions.length
    } else {
      selectedIndex = -1
    }
    updateView()
  }

  // Commit the current word
  const commitCurrentWord = () => {
    let selected = word
    if (selectedIndex >= 0 || selectedIndex < suggestions.length) {
      selected = suggestions[selectedIndex]
    }
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
  // Watch on element blur event
  //
  $elem.blur(() => {
    caretPosBeforeBlur = $elem.caret('pos')
  })
  $elem.focus(() => {
    $elem.caret('pos', caretPosBeforeBlur || 0)
  })

  //
  // Watch on window Resize
  //
  $(window).resize((e) => {
    if (isBN && word) updateView()
  })

  //
  // Watch on window OnScroll
  //
  $(window).scroll((e) => {
    if (isBN && word) updateView()
  })

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
  // Watch on element KeyDown
  //
  $elem.keydown((e) => {
    if (e.ctrlKey && [KEY_CODE.DOT, KEY_CODE.SPACE].indexOf(e.keyCode) >= 0) {
      isBN = !isBN
    }
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

$.fn.bangla = function () {
  return this.each((v) => registerInputTool($(this, v)))
}

export default registerInputTool
