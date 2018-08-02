import $ from './lib/jquery'
import Bangla from './lib/bangla'

const BANGLA = Symbol('bangla')

$.fn.bangla = function (key, val) {
  const selector = this.each(function () {
    if (!this[BANGLA]) {
      this[BANGLA] = new Bangla(this, key)
    }
    switch (key) {
      case 'on':
        this[BANGLA].setEnable(true)
        break
      case 'off':
        this[BANGLA].setEnable(false)
        break
      case 'toggle':
        this[BANGLA].toggleEnable()
        break
    }
  })

  if (this.length !== 1) {
    return null
  }
  switch (key) {
    case 'tool':
      return this[0][BANGLA]
    case 'enable':
      if (typeof val === 'boolean') {
        this[0][BANGLA].setEnable(val)
      }
      return this[0][BANGLA].enable
  }

  return selector
}
