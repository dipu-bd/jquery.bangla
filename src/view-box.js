import styles from './styles'

const $ = window.$ || window.jQuery || console.error('Error: jQuery does not exists!')

// to make the caret blinking
window._caretBlinker = window._caretBlinker || (
  setInterval(() => $('.caret-blink').fadeIn(300).fadeOut(500), 1000)
)

export default class ViewBox {
  constructor ($elem, id) {
    this.$elem = $elem
    this.word = ''
    this.suggestions = []
    this.active = -1
    this.onclick = null
    this.id = id || 'bangla--suggestions'
  }

  buildView () {
    if (!this.$view || !document.getElementById(this.id)) {
      this.$view = $(`<div id="${this.id}"></div>`)
      this.$view.css(styles.viewBox)
      if (this.$running) {
        this.$view.prepend(this.$running)
      }
      if (this.$list) {
        this.$view.append(this.$list)
      }
      $('body').append(this.$view)
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
    if (!this.$list) {
      this.$list = $('<div class="list"></div>')
      // add to current view
      if (this.$view) {
        this.$view.append(this.$list)
      }
    }
    this.$list.html('')
    this.suggestions.slice(0, 10).forEach((val, index) => {
      const item = $(`<div>${val}</div>`)
      item.css(styles.listItem)
      if (index === this.active) {
        item.css(styles.listItemActive)
      }
      item.click(() => {
        this.active = index
        if (this.onclick && $.isFunction(this.onclick)) {
          this.onclick(index, this.word, this)
        }
      })
      this.$list.append(item)
    })
  }

  showOrHide () {
    if (!this.word) {
      return this.$view.css('display', 'none')
    }

    const offset = this.$elem.caret('offset')
    let top = (offset.top + offset.height - window.scrollY + 3) + 'px'
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
    this.buildView()
    this.buildRunningItem()
    this.buildListItems()
    this.showOrHide()
  }

  setSuggestions (suggestions) {
    this.suggestions = suggestions || []
    this.buildListItems()
  }

  setWord (word) {
    this.word = word
    this.buildRunningItem()
    this.showOrHide()
  }
}
