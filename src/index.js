import $ from './jquery'
import Bangla from './bangla'

const BANGLA = Symbol('bangla')

$.fn.bangla = function (a, b) {
  return this.each(function () {
    if (!this[BANGLA]) {
      this[BANGLA] = new Bangla(this, a)
      return this[BANGLA]
    }
    switch (a) {
      case 'toggle':
        return this[BANGLA].toggleLang()
      case 'enable':
        if (typeof b === 'boolean') {
          this[BANGLA].enable = b
        }
        return this[BANGLA].enable
    }
  })
}
