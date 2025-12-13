import pdfMake from "pdfmake/build/pdfmake.min.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import type {TDocumentDefinitions} from "pdfmake/interfaces";
import type {Term} from "@/views/Main.vue";

pdfMake.vfs = pdfFonts.vfs;

export function printPdf(terms: Term[], isStyled: boolean) {
    let docDefinition: TDocumentDefinitions
    if (isStyled) {

        const formattedTerms = terms.map(term => {
            if (term.term && term.description && term.year && term.isIn)
                return {
                    unbreakable: true,
                    margin: [0, 10, 0, 10],   // etwas mehr Raum zwischen den Boxen

                    table: {
                        widths: ['*'],
                        body: [[
                            {
                                stack: [
                                    {text: term.term.toUpperCase(), style: 'termName'},

                                    {text: term.description, style: 'termDescription', margin: [0, 5, 0, 6]},

                                    {
                                        text: [
                                            'Noch gebräuchlich: ',
                                            {
                                                text: term.isIn ? 'JA' : 'NEIN',
                                                color: term.isIn ? '#00ff66' : '#ff4444',
                                                bold: true
                                            }
                                        ],
                                        style: 'meta',
                                        margin: [0, 2, 0, 4] // etwas mehr Luft
                                    },

                                    {text: 'Jahr: ' + term.year, style: 'meta', margin: [0, 2, 0, 4]},

                                    {text: 'Links', style: 'linkheading', margin: [0, 6, 0, 3]},

                                    {
                                        ul: term.links.map(link => ({
                                            text: link,
                                            style: 'link',
                                            link,
                                            decoration: 'underline',
                                            listType: 'none',
                                            margin: [0, 1, 0, 1]
                                        }))
                                    }
                                ]
                            }
                        ]]
                    },

                    layout: {
                        fillColor: '#1f0000',
                        hLineWidth: () => 2,
                        vLineWidth: () => 2,
                        hLineColor: () => '#ff0000',
                        vLineColor: () => '#ff0000',

                        // leicht mehr Innenabstand
                        paddingTop: () => 14,
                        paddingBottom: () => 14,
                        paddingLeft: () => 14,
                        paddingRight: () => 14
                    }
                }
        });

        const url = window.location.href;
        const pdfWidth = 595.35;
        const pdfHeight = 841.995;

        docDefinition = {
            info: {
                title: 'Brainrot Wörterbuch',
            },
            pageSize: {width: pdfWidth, height: pdfHeight},

            background: () => ({
                canvas: [{
                    type: 'rect',
                    x: 0,
                    y: 0,
                    w: pdfWidth,
                    h: pdfHeight,
                    color: '#000'
                }]
            }),

            content: [
                {text: 'BRAINROT WÖRTERBUCH', style: 'header', margin: [5, 20, 5, 30]},
                ...formattedTerms
            ],

            header: {
                margin: [10, 10, 10, 0],
                columns: [
                    {
                        text: 'Brainrot Wörterbuch — ' + new Date().toLocaleString('de-DE'),
                        style: {fontSize: 9, color: '#ffcccc'}
                    },
                    {
                        qr: url,
                        fit: 35,
                        alignment: "right",
                        foreground: '#b30000',   // Schwarz (beste Scanbarkeit)
                        background: '#ffcccc'
                    }
                    // hellrot                   }
                ]
            },

            footer: (current, count) => ({
                text: `${current} / ${count}`,
                alignment: 'right',
                margin: [0, 8, 10, 0],
                color: '#ff9999',
                fontSize: 9
            }),

            styles: {
                header: {
                    fontSize: 26,   // leicht größer
                    bold: true,
                    alignment: 'center',
                    color: '#ff0000'
                },
                termName: {
                    fontSize: 17,   // +1
                    bold: true,
                    color: '#ff4d4d'
                },
                termDescription: {
                    fontSize: 11,   // +1
                    color: '#ffdede',
                    italics: true
                },
                meta: {
                    color: '#ff9999',
                    fontSize: 10,   // +1
                },
                linkheading: {
                    bold: true,
                    color: '#ff4444',
                    fontSize: 11
                },
                link: {
                    fontSize: 9,    // +1
                    color: '#ff9999'
                }
            }
        };
    } else {
        const formattedTerms = terms.map(term => {
            if (term.term && term.description && term.year && term.isIn)
                return {
                    unbreakable: true,
                    stack: [
                        {text: term.term, style: 'termName', marginTop: 20},
                        {
                            ul: [
                                {
                                    text: term.description, style: 'termDescription', listType: 'none'
                                },
                                {
                                    listType: 'none',
                                    stack: [
                                        {
                                            text: [
                                                'Noch gebräuchlich: ',
                                                {
                                                    text: term.isIn ? 'ja' : 'nein',
                                                    color: term.isIn ? 'green' : 'red'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {text: 'Jahr: ' + term.year, listType: 'none'},
                                {text: 'Links', style: 'linkheading', listType: 'none'},
                                {
                                    ul:
                                        term.links.map(link => {
                                            return {text: link, style: 'link', link: link, decoration: 'underline', listType: 'none'};
                                        })

                                },


                            ]
                        }
                    ]

                }
        });

        const url = window.location.href;
        const pdfWidth = 595.35;
        const pdfHeight = 841.995;

        docDefinition = {
            info: {
                title: 'Brainrot Wörterbuch',
            },
            pageSize: {
                width: pdfWidth,
                height: pdfHeight,
            },
            content: [
                {text: 'Brainrot Wörterbuch', style: 'header'},
                {ul: formattedTerms}
            ],
            header: {
                margin: [5, 5, 5, 0],
                columns: [
                    {
                        text: 'Brainrot Wörterbuch, Version vom: ' + new Date().toLocaleString('de-DE'),
                        style: {fontSize: 10}
                    },
                    {
                        qr: url,
                        fit: 40, // Reduced from 60
                        alignment: "right",
                        margin: [0, 0, 0, 0] // Add some vertical margin
                    }
                ]
            },
            footer: function (currentPage, pageCount) {
                return [
                    {
                        text: currentPage + " / " + pageCount, alignment: "right", margin: [0, 10, 10, 0]
                    },
                ];
            },
            styles: {
                linkheading: {bold: true, marginTop: 1},
                link: {color: 'blue', fontSize:8},
                termName: {fontSize: 16, bold: true},
                termDescription: {italics: true},
                In: {color: 'green'},
                notIn: {color: 'red'},
                header: {
                    fontSize: 30,
                    bold: true,
                    alignment: 'center',
                }
            },
        };
    }


    pdfMake.createPdf(docDefinition).download('brainrot.pdf');
}
