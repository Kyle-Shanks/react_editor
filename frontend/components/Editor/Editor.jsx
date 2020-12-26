import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Prism from "prismjs";

const Editor = ({ className, initialContent, language }) => {
    const BASE_CLASS_NAME = 'Editor';
    const [content, setContent] = useState(initialContent);

    const handleKeyDown = (e) => {
        // Handle tabs
        if (e.key === 'Tab') {
            e.preventDefault();

            const ref = e.currentTarget;
            const pos = ref.selectionStart;
            setContent(`${content.substring(0, pos)}    ${content.substring(pos, content.length)}`);

            // Janky way to cursor move to the correct position after the state update
            setTimeout(() => {
                ref.selectionStart = pos + 4;
                ref.selectionEnd = pos + 4;
            }, 5);
        }
    };

    useEffect(Prism.highlightAll, [language, content]);

    return (
        <div className={`${BASE_CLASS_NAME} ${className}`.trim()}>
            <textarea
                className={`${BASE_CLASS_NAME}__Input`}
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <pre className={`${BASE_CLASS_NAME}__Output`}>
                <code className={`language-${language}`}>{content}</code>
            </pre>
        </div>
    );
};

Editor.propTypes = {
    className: PropTypes.string,
    initialContent: PropTypes.string,
    // TODO: Make language array for this
    language: PropTypes.string.isRequired,
};

Editor.defaultProps = {
    className: '',
    initialContent: '',
};

export default Editor;