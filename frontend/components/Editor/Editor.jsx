import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Prism from "prismjs";
import { ComponentContainer, TextArea, CodeDisplay } from './styles.js';

const Editor = ({ className, initialContent, language }) => {
    const BASE_CLASS_NAME = 'Editor';
    const [content, setContent] = useState(initialContent);
    const [editorHeight, setEditorHeight] = useState(320);
    const textareaRef = useRef();
    const outputRef = useRef();

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

    useEffect(() => {
        Prism.highlightAll();
        if (outputRef.current && outputRef.current.clientHeight !== editorHeight) {
            setEditorHeight(outputRef.current.clientHeight);
        }
    }, [language, content]);

    return (
        <ComponentContainer className={`${BASE_CLASS_NAME} ${className}`.trim()}>
            <TextArea
                className={`${BASE_CLASS_NAME}__Input`}
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{height: editorHeight}}
                spellcheck={false}
            />
            <CodeDisplay className={`${BASE_CLASS_NAME}__Output`} ref={outputRef}>
                <code className={`language-${language}`}>{content}</code>
                <br/>
            </CodeDisplay>
        </ComponentContainer>
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