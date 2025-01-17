/*

https://anydsl.github.io/thorin2/langref.html


*/
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)))
}


module.exports = grammar({
    name: 'thorin',
    extras: $ => [
        /\s/,
        $.comment,
    ],
    conflicts: $ => [
        // [$.L]
    ],
    rules: {
        // top: $ => $.e,

        // module
        m: $ => seq(repeat($.i), repeat($.d)),

        s0b: $ => /0[bB]/,
        s0o: $ => /0[oO]/,
        s0x: $ => /0[xX]/,
        bin: $ => /[01]/,
        oct: $ => /[0-7]/,
        dec: $ => /[0-9]/,
        sub: $ => /[₀-₉]/,
        hex: $ => /[0-9a-fA-F]/,
        eE: $ => /[eE]/,
        pP: $ => /[pP]/,
        sign: $ => /[+-]/,
        sym: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

        // literals
        L: $ => prec.left(choice(
            repeat1($.dec),
            seq($.s0b, repeat1($.bin)),
            seq($.s0o, repeat1($.oct)),
            seq($.s0x, repeat1($.hex)),
            seq($.sign, repeat1($.dec)),
            seq($.sign, $.s0b, repeat1($.bin)),
            seq($.sign, $.s0o, repeat1($.oct)),
            seq($.sign, $.s0x, repeat1($.hex)),
            seq(optional($.sign), repeat1($.dec), $.eE, $.sign, repeat1($.dec)),
            seq(optional($.sign), repeat1($.dec), '.', repeat($.dec), optional(seq($.eE, $.sign, repeat1($.dec)))),
            seq(optional($.sign), repeat($.dec), '.', repeat1($.dec), optional(seq($.eE, $.sign, repeat1($.dec)))),
            seq(optional($.sign), $.s0x, repeat1($.hex), $.pP, $.sign, repeat1($.dec)),
            seq(optional($.sign), $.s0x, repeat1($.hex), '.', repeat($.hex), $.pP, $.sign, repeat1($.dec)),
            seq(optional($.sign), $.s0x, repeat($.hex), '.', repeat1($.hex), $.pP, $.sign, repeat1($.dec)),
        )),

        // import
        i: $ => seq('.import', $.sym, ';'),

        // TODO: ceck prec
        ax: $ => prec.left(seq('%', $.sym, '.', $.sym, optional(seq('.', $.sym)))),

        // declaration
        d: $ => choice(
            seq('.let', $.p, '=', $.e, ';'),
        ),

        // pattern
        p: $ => choice(
            seq($.sym, optional(seq(':', $.e))),
        ),

        // declaration expression
        de: $ => (seq(repeat($.d), $.e)),
        // expression
        e: $ => choice(
            '.Univ',
            '*',
            '□',
            '.Nat',
            '.Idx',
            '.Bool',
            '.ff',
            '.tt',
            seq('.Type', $.e),
            $.sym,
            $.ax,

            // 42: ...
            // TODO: optional type (else nat)
            prec.left(19,seq($.L, optional(seq(':', field('type', $.e))))),
            seq(choice('.bot', '.top'), optional(seq(':', field('type', $.e)))),

            // block
            seq('{', $.de, '}'),
            // e e
            prec.left(17,seq($.e, $.e)),

            seq($.sym, ':', field('dom', $.e), '->', field('codom', $.e), '.', field('body', $.e)),
            seq('.cn', $.sym, $.p, '=', $.de),
            prec(13,seq('.fn', $.sym, $.p, '->', field('codom', $.e), '=', $.de)),
            // TODO: λ vs .lam
            prec(12,seq('.lam'  , $.sym, $.p, '->', field('codom', $.e), '=', $.de)),
            prec.right(11,seq(field('dom', $.e), '->', field('codom', $.e))),
            // TODO: or is this the pi prec
            // seq('Π', $.b, '->', field('codom', $.e)),
            // TODO: duplicate
            // seq($.e, '#', $.sym),
            prec.left(18,seq($.e, '#', field('index', $.e))),
            seq('.ins', '(', field('tuple', $.e), ',', field('index', $.e), ',', field('value', $.e), ')'),
            seq('(', commaSep1($.e), ')', optional(seq(':', field('type', $.e)))),
            // seq('[', commaSep1($.b), ']'),
            // TODO: what does the i mean?
            seq('‹', field('shape', $.e), ';', field('body', $.e), '›'),
            seq('«', field('shape', $.e), ';', field('body', $.e), '»'),
        ),

        // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
        comment: $ => token(choice(
            seq('//', /(\\(.|\r?\n)|[^\\\n])*/),
            seq(
                '/*',
                /[^*]*\*+([^/*][^*]*\*+)*/,
                '/'
            )
        )),
    }

});
