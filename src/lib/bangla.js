import './jquery.caret'
import $ from './jquery'
import ViewBox from './view-box'
import AvroPhonetic from '../provider/avro.min'
import {insertAtCursor, KEY_CODE} from './utils'

export default class BanglaInputTool {
  constructor (elem, config) {
    this.$elem = $(elem)

    config = config || {}
    this.enable = !!config.enable
    this.store = config.store || window.localStorage
    this.storeKey = config.key || '__avro--candidates'
    this.provider = config.provider || this.getAvroProvider() // default provider

    this.initView(config)
    this.trackCaret()
    this.watchWindow()
    this.watchElement()
  }

  trackCaret () {
    if (!this.$elem.caret) {
      return console.error('Caret.js is not initialized for this element: ', this.$elem)
    }
    let caret = 0
    this.$elem.blur(() => {
      caret = this.$elem.caret('pos')
    })
    this.$elem.focus(() => {
      this.$elem.caret('pos', caret || 0)
    })
  }

  getAvroProvider () {
    const $this = this
    return AvroPhonetic(
      function () {
        return JSON.parse($this.store.getItem($this.storeKey) || '{}')
      },
      function (candidates) {
        $this.store.setItem($this.storeKey, JSON.stringify(candidates || {}))
      }
    )
  }

  initView (config) {
    this.view = new ViewBox(this.$elem, config)
    this.view.onclick = () => {
      this.commitCurrentWord()
    }
  }

  commitCurrentWord () {
    const selected = this.view.getSelectedWord()
    insertAtCursor(this.$elem, selected)
    this.provider.commit(this.view.word, selected)
    this.view.clear()
  }

  setWord (word) {
    if (word) {
      const past = this.provider.candidate(word)
      const suggestions = this.provider.suggest(word).words
      this.view.setSuggestions(suggestions)
      this.view.setSelected(suggestions.indexOf(past))
      this.view.setWord(word)
    } else {
      this.view.clear()
    }
  }

  toggleEnable () {
    this.setEnable(!this.enable)
  }

  setEnable (val) {
    this.enable = val
    if (!this.enable) {
      this.view.clear()
    }
  }

  watchWindow () {
    const $this = this
    $(window).keydown((e) => $this._checkEscape(e))
  }

  watchElement () {
    const $this = this
    this.$elem.keydown((e) => $this._processKeypress(e))
  }

  _checkEscape (evt) {
    if (evt.keyCode === KEY_CODE.ESC && this.view.word) {
      this.view.clear()
    }
    return true
  }

  _isWordKey (e) {
    if (e.altKey || e.ctrlKey) return false
    if (e.keyCode === KEY_CODE.DOT) return true
    if (e.keyCode >= KEY_CODE.A && e.keyCode <= KEY_CODE.Z) return true
    if (e.keyCode >= KEY_CODE.ZERO && e.keyCode <= KEY_CODE.NINE) return !e.shiftKey
    if (e.keyCode >= KEY_CODE.NUMPAD_ZERO && e.keyCode <= KEY_CODE.NUMPAD_NINE) return true
  }

  _processKeypress (e) {
    this._checkEscape(e)

    if (e.ctrlKey && [KEY_CODE.DOT, KEY_CODE.SPACE].indexOf(e.keyCode) >= 0) {
      return this.toggleEnable()
    }

    if (!this.enable) return true

    // Check for action key sequence
    const word = this.view.word
    switch (e.keyCode) {
      case KEY_CODE.UP: // select previous
        if (!word) return true
        this.view.setSelected(this.view.active - 1)
        if (this.view.active >= 0) return false
        break
      case KEY_CODE.DOWN: // select next
        if (!word) return true
        this.view.setSelected(this.view.active + 1)
        if (this.view.active >= 0) return false
        break
      case KEY_CODE.A: // clear selection
        if (!e.ctrlKey || !word) break
        this.view.clear()
        return true
      case KEY_CODE.ESC:
        if (!word) return true
        this.view.clear()
        return false
      case KEY_CODE.BACKSPACE:
        if (!word) return true
        if (e.ctrlKey) {
          this.view.clear()
        } else {
          this.setWord(word.substr(0, word.length - 1))
        }
        return false
    }

    // Do not take key on ALT or CTRL
    if (e.altKey || e.ctrlKey) {
      return true
    }

    // Check if key needs to be taken
    if (this._isWordKey(e)) {
      this.setWord(word + e.key)
      return false
    }

    // Commit current word on invalid key
    const goodKeys = [
      KEY_CODE.CAPS_LOCK,
      KEY_CODE.SHIFT
    ]
    if (word.length && goodKeys.indexOf(e.keyCode) < 0) {
      this.commitCurrentWord()
      if ([KEY_CODE.ENTER, KEY_CODE.TAB].indexOf(e.keyCode) >= 0) {
        return false
      }
    }

    return true
  }
}
