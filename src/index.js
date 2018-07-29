import AvroPhonetic from './lib/avro.min.js'

const $ = window.$ || window.jQuery || console.error('Error: jQuery does not exists!')

function insertAtCursor ($elem, text) {
  const pos = $elem.caret('pos')
  if ($elem.attr('contenteditable') === 'true') {
    const node = document.createTextNode(text)
    console.log(node)
  } else {
    let val = $elem.val()
    val = val.substr(0, pos) + text + val.substr(pos)
    $elem.val(val)
  }
  $elem.caret('pos', pos + text.length)
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
      insertAtCursor($elem, words[0])
      word = ''
    } else {
      word += ch
      return false
    }
  })
}

require('./lib/jquery.caret')
$.fn.initBangla = function () {
  return this.each(() => registerInputTool($(this)))
}

export default registerInputTool
