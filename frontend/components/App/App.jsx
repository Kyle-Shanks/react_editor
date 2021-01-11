import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Editor from 'frontend/components/Editor';
import { debounce } from 'frontend/util';
import { ComponentContainer, FlexContainer, IFrame } from './styles';

const IFRAME_UPDATE_DELAY_TIME = 2000; // ms

const cssResetStyles = `
    html, body, div, span, applet, object, iframe,
    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
    a, abbr, acronym, address, big, cite, code,
    del, dfn, em, img, ins, kbd, q, s, samp,
    small, strike, strong, sub, sup, tt, var,
    b, u, i, center,
    dl, dt, dd, ol, ul, li,
    fieldset, form, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, canvas, details, embed,
    figure, figcaption, footer, header, hgroup,
    menu, nav, output, ruby, section, summary,
    time, mark, audio, video {
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 100%;
        font: inherit;
        vertical-align: baseline;
    }
    /* HTML5 display-role reset for older browsers */
    article, aside, details, figcaption, figure,
    footer, header, hgroup, menu, nav, section {
        display: block;
    }
    body {
        line-height: 1;
    }
    ol, ul {
        list-style: none;
    }
    blockquote, q {
        quotes: none;
    }
    blockquote:before, blockquote:after,
    q:before, q:after {
        content: '';
        content: none;
    }
    table {
        border-collapse: collapse;
        border-spacing: 0;
    }
`;

const iframeStyles = `
    html {
        height: 100% !important;
        width: 50% !important; // 50% of outer window size
    }
`;

const updateIframe = (iframe, htmlContent, cssContent, jsContent) => {
    // Reload iframe bc javascript variables
    iframe.contentWindow.location.reload();

    // Janky delay to wait for the iframe to reload
    setTimeout(() => {
        const doc = iframe.contentDocument;
        const pageContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Neat Title</title>
                    <style>
                        ${iframeStyles}
                        ${cssResetStyles}
                        ${cssContent}
                    </style>
                </head>
                <body>
                    ${htmlContent}
                    <script>${jsContent}</script>
                </body>
            </html>
        `;

        doc.open();
        doc.write(pageContent);
        doc.close();
    }, 100);
};

const debouncedIframeUpdate = debounce(updateIframe, IFRAME_UPDATE_DELAY_TIME);

const App = ({ className }) => {
    const BASE_CLASS_NAME = 'App';
    const [htmlContent, setHtmlContent] = useState('<!-- HTML here -->');
    const [cssContent, setCssContent] = useState('/* CSS here */');
    const [jsContent, setJsContent] = useState('// JS here');
    const iframeRef = useRef();

    useEffect(
        () => { debouncedIframeUpdate(iframeRef.current, htmlContent, cssContent, jsContent); },
        [htmlContent, cssContent, jsContent]
    );

    return (
        <ComponentContainer className={`${BASE_CLASS_NAME} ${className}`.trim()}>
            <FlexContainer>
                <Editor content={htmlContent} language={'html'} updateContent={setHtmlContent} />
                <Editor content={cssContent} language={'css'} updateContent={setCssContent} />
                <Editor content={jsContent} language={'javascript'} updateContent={setJsContent} />
            </FlexContainer>
            <FlexContainer>
                <IFrame id="iframe" ref={iframeRef} />
            </FlexContainer>
        </ComponentContainer>
    );
};

App.propTypes = {
    className: PropTypes.string,
};

App.defaultProps = {
    className: '',
};

export default App;
