import $ from './lib/jquery'
import Bangla from './lib/bangla'

const BANGLA = Symbol('bangla')

$.fn.bangla = function (key, val) {
  const selector = this.each(function () {
    if (!this[BANGLA]) {
      this[BANGLA] = new Bangla(this, key)
    }
  })
  switch (key) {
    case 'tool':
      if (this.length !== 1) return null
      return this[0][BANGLA]
    case 'enable':
      if (this.length !== 1) return null
      if (typeof val === 'boolean') {
        this[0][BANGLA].setEnable(val)
      }
      return this[0][BANGLA].enable
    case 'on':
      return this.each(function () {
        this[BANGLA].setEnable(true)
      })
    case 'off':
      return this.each(function () {
        this[BANGLA].setEnable(false)
      })
    case 'toggle':
      return this.each(function () {
        this[BANGLA].toggleEnable()
      })
    default:
      return selector
  }
}
