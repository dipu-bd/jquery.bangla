import $ from './jquery'
import styles from '../config/styles'

// to make the caret blinking
window._caretBlinker = window._caretBlinker || (
  setInterval(() => $('.caret-blink').fadeIn(300).fadeOut(500), 1000)
)

export default class ViewBox {
  constructor ($elem, id) {
    this.$elem = $elem
    this.word = ''
    this.active = -1
    this.onclick = null
    this.suggestions = []

    // generate id
    this.id = 'bangla--suggestion_'
    this.id += $elem.attr('id') || Math.floor(Math.random() * 10000)
    this.id = id || this.id

    // update view on resize
    $(window).resize((e) => {
      if (this.word) this.toggleVisible()
    })
  }

  buildView () {
    if (!document.getElementById(this.id)) {
      $('body').append(`<div id="${this.id}"></div>`)
    }
    if (!this.$view) {
      this.$view = $(`#${this.id}`)
      this.$view.css(styles.viewBox)
      this.$view.html('')
      this.$running = null
      this.$list = null
    }
  }

  buildRunningItem () {
    if (!this.$running) {
      this.$running = $('<div><span class="word"></span></div>')
      this.$running.css(styles.runningWord)
      // add caret
      const caret = $('<span class="caret-blink">&nbsp</span>')
      caret.css(styles.caret)
      this.$running.append(caret)
      // add to current view
      if (this.$view) {
        this.$view.prepend(this.$running)
      }
    }
    this.$running.find('.word').text(this.word)
  }

  buildListItems () {
    // create new list if not exists
    if (!this.$list) {
      this.$list = $('<div class="list"></div>')
    }
    // add to current view
    if (this.$view) {
      this.$view.append(this.$list)
    }
    // build list items
    this.$list.html('')
    this.suggestions.slice(0, 10).forEach((val, index) => {
      const item = $(`<div>${val}</div>`)
      item.css(styles.listItem)
      if (index === this.active) {
        item.css(styles.listItemActive)
      }
      item.click(() => {
        if (this.onclick && $.isFunction(this.onclick)) {
          this.onclick(index, this.word, this)
        }
      })
      this.$list.append(item)
    })
  }

  toggleVisible () {
    if (!this.$view) {
      this.buildView()
    }

    if (!this.word) {
      return this.$view.css('display', 'none')
    }

    const offset = this.$elem.caret('offset')
    let top = (offset.top + offset.height + 3) + 'px'
    // const height = offset.top + view.height() + 5
    // if (height > window.innerHeight) {   // check if the view should be on top
    //   top = (offset.top - window.scrollY - view.height() - 7) + 'px'
    //   view.append(running)
    // }
    this.$view.css({
      display: 'block',
      top,
      left: (offset.left) + 'px'
    })
  }

  update () {
    setTimeout(() => {
      this.buildView()
      this.buildRunningItem()
      this.buildListItems()
      this.toggleVisible()
    }, 1)
  }

  clear () {
    this.suggestions = []
    this.active = -1
    this.word = ''
    this.update()
  }

  setSuggestions (suggestions) {
    this.suggestions = suggestions || []
    this.buildListItems()
  }

  setWord (word) {
    this.word = word
    this.update()
  }

  setSelected (index) {
    this.active = -1
    if (index >= 0) {
      this.active = (index + this.suggestions.length) % this.suggestions.length
    }
    if (this.active < 0 && this.suggestions.length > 0) {
      this.active = 0
    }
    this.update()
  }

  getSelectedWord () {
    if (this.active < 0) return this.word
    return this.suggestions[this.active] || this.word
  }
}
