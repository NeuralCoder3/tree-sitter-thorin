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
        // [$.b, $.e],
        [$.e],
        // [$.o, $.de],
        // [$.ax],
        [$.L],
    ],
    rules: {
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

        // TODO: ceck prec
        ax: $ => prec.left(seq('%', $.sym, '.', $.sym, optional(seq('.', $.sym)))),
        L: $ => choice(
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
        ),
        I: $ => choice(
            seq(repeat1($.dec), repeat1($.sub)),
            seq(repeat1($.dec), '_', repeat1($.dec)),
        ),




        // import
        i: $ => seq('.import', $.sym, ';'),
        // declaration
        d: $ => choice(
            seq('.ax', $.ax, ':', field('type',$.e), ';'),
            seq('.let', $.p, '=', $.e, ';'),
            prec(16,seq('.Pi', $.sym, optional(seq(':', field('type', $.e))), ',', field('dom',$.e), $.n)),

            seq('.con', $.sym, $.p, $.n),
            prec(15,seq('.fun', $.sym, $.p, '->', field('codom',$.e), $.n)),
            prec(14,seq('.lam', $.sym, $.p, '->', field('codom',$.e), $.n)),

            // TODO: what is the v
            // seq('.Arr'  , $.sym, optional(seq(':', field('type', $.e))), ',', field('shape',$.e), optional(seq(',', $.v)), $.n),
            // seq('.pack' , $.sym, optional(seq(':', field('type', $.e))), ',', field('shape',$.e), optional(seq(',', $.v)), $.n),
            // seq('.Sigma', $.sym, optional(seq(':', field('type', $.e))), ',', field('arity',$.l), optional(seq(',', $.v)), $.n),
            seq('.Arr'  , $.sym, optional(seq(':', field('type', $.e))), ',', field('shape',$.e), $.n),
            seq('.pack' , $.sym, optional(seq(':', field('type', $.e))), ',', field('shape',$.e), $.n),
            seq('.Sigma', $.sym, optional(seq(':', field('type', $.e))), ',', field('arity',$.L), $.n),

            seq('.def', $.sym, $.n),
        ),
        // nominal definition
        n: $ => choice(
            ';',
            $.o,
        ),
        // operand of definition
        o: $ => choice(
            seq('=', $.de, ';'),
            seq('=', '{', commaSep1($.e), '}', ';'),
        ),
        // pattern
        p: $ => choice(
            seq($.sym, optional(seq(':', $.e))),
            seq(optional(seq($.sym, '::')), '(', commaSep1($.g), ')', optional(seq(':', $.e))),
            seq(optional(seq($.sym, '::')), '[', commaSep1($.b), ']', optional(seq(':', $.e))),
        ),
        // group pattern
        g: $ => choice(
            $.p,
            // TODO: repeat1 optional is nonsensical
            seq(repeat(seq($.sym, '::')), ':', $.e),
        ),
        // binder pattern
        // TODO: precedence might be wrong solution
        b: $ => prec(20,choice(
            seq(optional(seq($.sym, '::')), field('type', $.e)),
            seq(optional(seq($.sym, '::')), '[', commaSep1($.b), ']', optional(seq(':', $.e))),
        )),
        // optional type ascription
        // t: $ => optional(seq(':', $.e)),
        // optional symbol
        // s: $ => optional(seq($.sym, '::')),
        // declaration expression
        // TODO: ceck prec
        de: $ => prec.right(seq(repeat($.d), $.e)),
        // expression
        e: $ => choice(
            '.Univ',
            seq('.Type', $.e),
            '*',
            '□',
            '.Nat',
            '.Idx',
            '.Bool',
            seq('{', $.de, '}'),
            prec(19,seq($.L, ':', field('type', $.e))),
            '.ff',
            '.tt',
            seq(choice('.bot', '.top'), optional(seq(':', field('type', $.e)))),
            $.sym,
            $.ax,
            prec.left(17,seq($.e, $.e)),
            seq($.sym, ':', field('dom', $.e), '->', field('codom', $.e), '.', field('body', $.e)),
            seq('.cn', $.sym, $.p, '=', $.de),
            prec(13,seq('.fn', $.sym, $.p, '->', field('codom', $.e), '=', $.de)),
            // λ
            prec(12,seq('.lam'  , $.sym, $.p, '->', field('codom', $.e), '=', $.de)),
            prec.right(11,seq(field('dom', $.e), '->', field('codom', $.e))),
            // TODO: or is this the pi prec
            seq('Π', $.b, '->', field('codom', $.e)),
            seq($.e, '#', $.sym),
            prec.left(18,seq($.e, '#', field('index', $.e))),
            seq('.ins', '(', field('tuple', $.e), ',', field('index', $.e), ',', field('value', $.e), ')'),
            seq('(', commaSep1($.e), ')', optional(seq(':', field('type', $.e)))),
            seq('[', commaSep1($.b), ']'),
            // TODO: what does the i mean?
            seq('‹', field('shape', $.e), ';', field('body', $.e), '›'),
            seq('«', field('shape', $.e), ';', field('body', $.e), '»'),
        ),
        comment: $ => token(seq('//', /.*/)),
    }

});
