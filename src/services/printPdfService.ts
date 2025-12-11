import pdfMake from "pdfmake/build/pdfmake.min.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import type {TDocumentDefinitions} from "pdfmake/interfaces";
import type {Term} from "@/views/Main.vue";

pdfMake.vfs = pdfFonts.vfs;

export function printPdf(terms: Term[]) {
    const formattedTerms = terms.map(term => {
        if (term.term && term.description && term.year && term.isIn)
            return {
                stack: [
                    {text: term.term, style: 'termName', marginTop: 20},
                    {
                        ul: [
                            {
                                text: term.description, style: 'termDescription', listType: 'none'
                            },
                            {
                                text: 'Noch gebräuchlich: ' + (term.isIn ? 'ja' : 'nein'),
                                style: term.isIn ? 'In' : 'notIn',
                                listType: 'none'
                            },
                            {text: 'Jahr: ' + term.year,listType: 'none'},
                            {text: 'Links', style: 'linkheading',listType: 'none'},
                            {
                                ul:
                                    term.links.map(link => {
                                        return {text: link, style: 'link', link: link, decoration: 'underline'}
                                    })

                            },


                        ]
                    }
                ]

            }
    });

    const docDefinition: TDocumentDefinitions = {
        content: [
            {text: 'Brainrot Wörterbuch', style: 'header'},
            {ul: formattedTerms}
        ],
        header: {
            text: 'Brainrot Wörterbuch, Version vom: ' + new Date().toLocaleString('de-DE'),
            style: {fontSize: 10},
            margin: 10
        },
        footer: function (currentPage, pageCount) {
            return [
                {text: currentPage + '/' + pageCount, alignment: 'right', margin: 10}
            ];
        },
        styles: {
            linkheading: {bold: true, marginTop: 1},
            link: {color: 'blue'},
            termName: {fontSize: 16, bold: true},
            termDescription: {italics: true},
            In: {color: 'green'},
            notIn: {color: 'red'},
            header: {
                fontSize: 30,
                bold: true,
                alignment: 'center',
            }
        }
    };


    pdfMake.createPdf(docDefinition).download();
}
