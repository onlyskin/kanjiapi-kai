const m = require('mithril');
const { isKana } = require('wanakana');
const { Api } = require('./api');
const { Dictionary } = require('./dictionary');
const Kanji = require('./kanji');
const Kana = require('./kana');
const { config } = require('./config');

function isKanji(data) {
    if (!data) return false;

    return data.kanji !== undefined;
}

function isReading(data) {
    if (!data) return false;

    return data.reading !== undefined;
}

const Meaning = {
    view: ({attrs: {meaning}}) => {
        return m('.meaning', meaning);
    },
};

const WordChar = {
    view: ({attrs: {character}}) => {
        return m(
            'span',
            isKana(character) ?
            {} : 
            {
                class: 'hover-shadow',
                onclick: e => {
                    m.route.set(`/${e.target.textContent}`, null);
                },
            },
            character,
        );
    },
};

const WordMeanings = {
    view: ({attrs: {meanings}}) => {
        return meanings.map((meaning, index, arr) => {
            return m(
                'p',
                arr.length < 2 ?
                meaning.glosses.join(', ') :
                `${index + 1}. ${meaning.glosses.join(', ')}`,
            );
        });
    },
};

const Word = {
    view: ({attrs: {word}}) => {
        return m(
            '.flex-row.word-card',
            m(
                '.flex-row.flex-right',
                m(
                    '.word',
                    [...word.variant.written]
                      .map(character => m(WordChar, {character})),
                ),
            ),
            m(
                '.vertical-flex',
                [
                    m(
                        '.word-reading',
                        Kana.formatReading(word.variant.pronounced),
                    ),
                    m(
                        '.word-meaning.serif',
                        m(WordMeanings, {meanings: word.meanings}),
                    ),
                ],
            ),
        );
    },
};

const Reading = {
    view: ({attrs: {type, reading}}) => {
        return m(
            '',
            {
                class: [config.isRomaji ? 'romanized' : '', type].join(' '),
                onclick: () => m.route.set(`/${reading}`, null),
            },
            Kana.formatReading(reading),
        );
    },
};

const KanjiLiteral = {
    view: ({attrs: {kanji}}) => {
        return m(
            dictionary.joyo().includes(kanji) ?
            '.joyo.kanji' :
            dictionary.jinmeiyo().includes(kanji) ?
            '.jinmeiyo.kanji' :
            '.kanji',
            { onclick: () => m.route.set(`/${kanji}`, null) },
            kanji,
        );
    },
};

const KanjiInfo = {
    view: function ({attrs: {kanji, words}}) {
        return m('.info', [
            m('.field.serif', 'Kanji'),
            m('.field-value', m(KanjiLiteral, {kanji: kanji.kanji})),
            m('.field.serif', 'Grade'),
            m('.field-value', Kanji.grade(kanji)),
            m('.field.serif', 'JLPT'),
            m('.field-value', Kanji.jlpt(kanji)),
            m('.field.serif', 'Strokes'),
            m('.field-value', kanji.stroke_count),
            m('.field.serif', 'Unicode'),
            m('.field-value', Kanji.unicode(kanji)),
            m('.field.serif', 'Meanings'),
            m(
                '.field-value',
                kanji.meanings.map(meaning => m(Meaning, {meaning})),
            ),
            m('.field.serif', 'Kun'),
            m('.field-value', kanji.kun_readings.map(reading => {
                return m(Reading, {type: 'kun-reading', reading});
            })),
            m('.field.serif', 'On'),
            m('.field-value', kanji.on_readings.map(reading => {
                return m(Reading, {type: 'on-reading', reading});
            })),
            m('.field.serif', 'Nanori'),
            m(
                '.field-value',
                kanji.name_readings.map(reading => {
                    return m(Reading, {type: 'name-reading', reading});
                }),
            ),
            m('.field.serif', {style: {border: 'none'}}, 'Words'),
            m(
                '.flex-row.field-value.words',
                {style: {border: 'none'}},
                words ?
                Kanji.wordsForKanji(kanji.kanji, words)
                  .map(word => m(Word, {word})) :
                m(Loading),
            ),
        ]);
    },
};

const ReadingInfo = {
    view: ({attrs: {reading}}) => {
        return m('.info', [
            m('.field.serif', 'Reading'),
            m('.field-value', m(
                Reading,
                {type: 'reading', reading: reading.reading},
            )),
            m('.field.serif', 'Main Kanji'),
            m(
                '.field-value',
                reading.main_kanji.map(kanji => m(KanjiLiteral, {kanji})),
            ),
            m('.field.serif', 'Name Kanji'),
            m(
                '.field-value',
                reading.name_kanji.map(kanji => m(KanjiLiteral, {kanji})),
            ),
        ]);
    },
};

const Info = {
    view: function({attrs: {subject}}) {
        if (isKanji(subject)) {
            return m(
                KanjiInfo, {
                    kanji: subject,
                    words: dictionary.wordsFor(subject),
                });
        } else if (isReading(subject)) {
            return m(ReadingInfo, {reading: subject});
        }
    },
};

const RomajiToggle = {
    view: function() {
        return m(
            '#romaji-toggle',
            {
                onclick: _ => config.toggleRomaji(),
            },
            'あ/a'
        );
    },
};

const Header = {
    view: function() {
        return m('header.align-center', [
            m('h1', '漢字解'),
            m('h1.romanized', 'KanjiKai'),
        ]);
    },
};

const About = {
    view: function() {
        return [
            m('h2.center-text.romanized', 'About'),
            m('#about.center-text.romanized', [
                m('p', [
                    'This site is powered by ',
                    m('a[href=https://kanjiapi.dev]', 'kanjiapi.dev'),
                ]),
            ])
        ];
    },
};

const Loading = {
    view: function() {
        return m('.loader');
    },
};

const BadSearch = {
    view: function() {
        return m('.align-center.medium-padding', 'Not Found');
    },
};

const Page = {
    view: function({attrs}) {
        const searchResult = dictionary.lookup(attrs.search);

        return m('.page.vertical-flex', [
            m(Header),
            m(
                '.content.vertical-flex',
                m(RomajiToggle),
                m('input[text]#kanji-input', {
                    value: attrs.search,
                    onchange: e => {
                        m.route.set(`/${e.target.value}`, null);
                    },
                }),
                searchResult._status === 'ok' ?
                m(Info, {subject: searchResult.result}) :
                searchResult._status === 'pending' ?
                m(Loading) :
                m(BadSearch),
            ),
            m('footer.vertical-flex', m(About)),
        ]);
    },
};

function init() {
    m.route(document.body, '/字', {
        '/:search': Page,
    });
}

const api = new Api(m.request);
const dictionary = new Dictionary(api, m.redraw);

init();
