const m = require('mithril');

const KanjiLiteral = {
    _backgroundClass: (dictionary, kanji) => {
        if (dictionary.joyo().includes(kanji)) {
            return 'bg-light-yellow';
        } else if (dictionary.jinmeiyo().includes(kanji)) {
            return 'bg-mid-red';
        }
        return 'bg-mid-blue';
    },
    _borderClass: (dictionary, kanji) => {
        if (dictionary.joyo().includes(kanji)) {
            return 'b--yellow';
        } else if (dictionary.jinmeiyo().includes(kanji)) {
            return 'b--red';
        }
        return 'b--blue';
    },
    view: function({attrs: {dictionary, kanji, large}}) {
        return m(
            '.pointer.grow.ma1.lh-solid.pa1.br3.ba.kosugi-maru',
            {
                class: [
                    this._backgroundClass(dictionary, kanji),
                    this._borderClass(dictionary, kanji),
                    large ? 'f-05' : 'f2',
                ].join(' '),
                onclick: () => m.route.set(`/${kanji}`, null)
            },
            kanji,
        );
    },
};

module.exports = {
    KanjiLiteral,
};
