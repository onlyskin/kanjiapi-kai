const m = require('mithril')
const Kana = require('./kana')
const { config } = require('./config')
const { ON, KUN } = require('./constant')

const Reading = {
  _borderClass: type => {
    if (type === KUN) {
      return 'b--pale-red'
    } else if (type === ON) {
      return 'b--pale-blue'
    }
    return 'b--pale-green'
  },
  _backgroundClass: type => {
    if (type === KUN) {
      return 'bg-pale-red'
    } else if (type === ON) {
      return 'bg-pale-blue'
    }
    return 'bg-pale-green'
  },
  view: function({ attrs: { type, reading, large } }) {
    return m(
      '.lh-solid.ma1.br3.ba.pointer.grow',
      {
        class: [
          large ? 'f1' : 'f4',
          large ? 'pa2' : 'pa1',
          config.isRomaji ? 'avenir' : 'kosugi-maru',
          this._borderClass(type),
          this._backgroundClass(type),
        ].join(' '),
        onclick: () => m.route.set(`/${reading}`, null),
      },
      Kana.formatReading(reading),
    )
  },
}

module.exports = {
  Reading,
}
