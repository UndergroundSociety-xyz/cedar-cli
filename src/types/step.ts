export interface Step {
    name: string
    blend? :
        | 'normal'
        | 'atop'
        | 'dest-atop'
        | 'xor'
        | 'add'
        | 'saturate'
        | 'multiply'
        | 'screen'
        | 'overlay'
        | 'darken'
        | 'lighten'
        | 'colour-dodge'
        | 'colour-burn'
        | 'hard-light'
        | 'soft-light'
        | 'difference'
        | 'exclusion'
}