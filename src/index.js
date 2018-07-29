import AvroPhonetic from './lib/avro.min.js'

function insertAtCursor (myField, myValue) {
  // IE support
  if (document.selection) {
    myField.focus()
    const sel = document.selection.createRange()
    sel.text = myValue
    return
  }
  // MOZILLA and others
  if (myField.selectionStart || Number(myField.selectionStart) === 0) {
    var startPos = myField.selectionStart
    var endPos = myField.selectionEnd
    myField.value = myField.value.substring(0, startPos) +
      myValue +
      myField.value.substring(endPos, myField.value.length)
  } else {
    myField.value += myValue
  }
}

function registerInputTool ($elem) {
  const avro = AvroPhonetic(
    () => {
      return {}
    },
    (candidates) => {
      console.log(candidates)
    }
  )

  let word = ''
  $elem.keypress((e) => {
    const ch = String.fromCharCode(e.keyCode)
    console.log(ch, word)
    if (!ch.match('[A-Za-z0-9.]')) {
      const words = avro.suggest(word).words
      console.log('--------------------------------')
      words.forEach(v => console.log(v))
      console.log('--------------------------------')
      insertAtCursor(e.target, words[0] + ch)
      word = ''
    } else {
      word += ch
    }
    return false
  })
}

const jquery = window.$ || window.jQuery
if (jquery) {
  jquery.fn.initBangla = function () {
    return this.each(() => registerInputTool(jquery(this)))
  }
}

export default registerInputTool
