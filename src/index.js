import AvroPhonetic from './lib/avro.min.js'

function registerInputTool ($elem) {
  const avro = AvroPhonetic(
    () => {
      return {}
    },
    (candidates) => {
      console.log(candidates)
    }
  )

  console.log(avro.suggest('bangla'))
  // avro.commit('bangla', selectedWord)
  // avro.candidate('bangla')
}

const jquery = window.$ || window.jQuery
if (jquery) {
  jquery.fn.initBangla = function () {
    return this.each(() => registerInputTool(jquery(this)))
  }
}

export default registerInputTool
