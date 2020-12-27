import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Editor from 'frontend/components/Editor';

const debounce = (callback, wait) => {
    let timeout;
    return (...args) => {
        const later = () => {
            clearTimeout(timeout);
            callback(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

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
                <style>${cssContent}</style>
            </head>
            <body>
                ${htmlContent}
                <script>${jsContent}</script>
            </body>
        </html>
    `;

        doc.open('text/htmlreplace');
        doc.write(pageContent);
        doc.close();
    }, 100);
};

const debouncedIframeUpdate = debouncedIframeUpdate || debounce(updateIframe, 2000);

const App = ({ className }) => {
    const BASE_CLASS_NAME = 'App';
    const [htmlContent, setHtmlContent] = useState('<!-- HTML here -->');
    const [cssContent, setCssContent] = useState('/* CSS here */');
    const [jsContent, setJsContent] = useState('// JS here');
    const iframe = document.getElementById('iframe');

    useEffect(() => {
        debouncedIframeUpdate(iframe, htmlContent, cssContent, jsContent);
    }, [htmlContent, cssContent, jsContent]);

    return (
        <div className={`${BASE_CLASS_NAME} ${className}`.trim()}>
            <Editor content={htmlContent} language={'html'} updateContent={setHtmlContent} />
            <Editor content={cssContent} language={'css'} updateContent={setCssContent} />
            <Editor content={jsContent} language={'javascript'} updateContent={setJsContent} />
        </div>
    );
};

App.propTypes = {
    className: PropTypes.string,
};

App.defaultProps = {
    className: '',
};

export default App;
