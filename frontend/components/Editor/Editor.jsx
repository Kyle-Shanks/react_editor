import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Prism from "prismjs";
import {
    ComponentContainer,
    EditorContainer,
    TextArea,
    CodeDisplay,
    LanguageDisplay,
} from './styles.js';

// TODO: Specialized key handlers for each language
// - This can be used for things like tag autocomplete in HTML

/* TODO: Quality of life things
    - On backspace, if the selectionStart and selectionEnd are the same and
      the 4 chars before are a tab, delete the tab
    - Add a system for undos and redos, they are p broken right now
*/

// TODO: Need a function to grab the content on the line before and after the caret.

const TAB = '    ';
const INITIAL_EDITOR_HEIGHT = 320; // 20rem

const Editor = ({ className, content, language, updateContent }) => {
    const BASE_CLASS_NAME = 'Editor';
    const [editorHeight, setEditorHeight] = useState(INITIAL_EDITOR_HEIGHT);
    const outputRef = useRef();

    const getLines = () => content.split("\n");

    // Get the line numbers for the current selection
    const getSelectionLines = (start, end) => {
        const lines = getLines();
        const selectionRange = [null, null];
        let total = 0;

        for (let i = 0; i < lines.length; i++) {
            total += lines[i].length + 1; // +1 for new line char
            if (selectionRange[0] === null && total >= start) selectionRange[0] = i;
            if (selectionRange[1] === null && total >= end) selectionRange[1] = i;
        }

        return selectionRange;
    };

    const handleTabAction = (e) => {
        e.preventDefault();
        const ref = e.currentTarget;
        const start = ref.selectionStart;
        const end = ref.selectionEnd;
        const lines = getLines();
        let startShift = 4;
        let endShift = 0;

        if (e.shiftKey) {
            startShift = 0;
            const selectRange = getSelectionLines(start, end);
            for (let i = selectRange[0]; i < selectRange[1] + 1; i++) {
                if (lines[i].slice(0, 4) === TAB) {
                    lines[i] = lines[i].slice(4);
                    i === selectRange[0] ? startShift = -4 : endShift -= 4;
                }
            }
            updateContent(lines.join("\n"));
        } else if (start !== end) {
            const selectRange = getSelectionLines(start, end);
            for (let i = selectRange[0]; i < selectRange[1] + 1; i++) {
                lines[i] = `${TAB}${lines[i]}`;
                if (i !== selectRange[0]) endShift += 4;
            }
            updateContent(lines.join("\n"));
        } else {
            updateContent(`${content.substring(0, end)}${TAB}${content.substring(end, content.length)}`);
        }

        // Janky way to move selection start end end to the correct position after the update
        setTimeout(() => {
            ref.selectionStart = start + startShift;
            ref.selectionEnd = end + startShift + endShift;
        }, 0);
    };

    const handleNewLine = (e) => {
        e.preventDefault();
        const ref = e.currentTarget;
        const start = ref.selectionStart;
        const end = ref.selectionEnd;
        const lines = getLines();
        const selectRange = getSelectionLines(start, end);
        const indentation = lines[selectRange[0]].match(/^\s+/)?.[0] || '';

        updateContent(`${content.substring(0, start)}\n${indentation}${content.substring(end, content.length)}`);

        // Janky way to move selection start end end to the correct position after the update
        setTimeout(() => {
            ref.selectionStart = start + indentation.length + 1;
            ref.selectionEnd = start + indentation.length + 1;
        }, 0);
    };

    const handlePairChar = (e) => {
        e.preventDefault();
        const ref = e.currentTarget;
        const start = ref.selectionStart;
        const end = ref.selectionEnd;

        const charMap = {
            '(': ')',
            '[': ']',
            '{': '}',
            '\'': '\'',
            '"': '"',
            '`': '`',
        };

        if (start === end) {
            // Add the pair chars and increment start and end positions
            updateContent(`${content.substring(0, end)}${e.key}${charMap[e.key]}${content.substring(end, content.length)}`);
        } else {
            // Surround selection in pair chars and increment start and end positions
            updateContent(
                `${content.substring(0, start)}${e.key}`
                + `${content.substring(start, end)}`
                + `${charMap[e.key]}${content.substring(end, content.length)}`
            );
        }

        // Janky way to move selection start end end to the correct position after the update
        setTimeout(() => {
            ref.selectionStart = start + 1;
            ref.selectionEnd = end + 1;
        }, 0);
    };

    const handleKeyDown = (e) => {
        const pairChars = ['(', '[', '{', '\'', '"', '`'];

        if (e.key === 'Tab') {
            handleTabAction(e);
        } else if (e.key === 'Enter') {
            handleNewLine(e);
        } else if (pairChars.includes(e.key)) {
            handlePairChar(e);
        }
    };

    useEffect(() => {
        Prism.highlightAll();
        if (outputRef.current.clientHeight !== editorHeight) {
            setEditorHeight(outputRef.current.clientHeight);
        }
    }, [language, content]);

    return (
        <ComponentContainer className={`${BASE_CLASS_NAME} ${className}`.trim()}>
            <EditorContainer>
                <TextArea
                    className={`${BASE_CLASS_NAME}__Input`}
                    style={{ height: editorHeight }}
                    value={content}
                    onChange={e => updateContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                />
                <CodeDisplay className={`${BASE_CLASS_NAME}__Output`} ref={outputRef}>
                    <code className={`language-${language}`}>{content}</code>
                    {/* Added to update height when an empty line is added at the end */}
                    <br/>
                </CodeDisplay>
            </EditorContainer>
            <LanguageDisplay>{language}</LanguageDisplay>
        </ComponentContainer>
    );
};

Editor.propTypes = {
    className: PropTypes.string,
    content: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    updateContent: PropTypes.func.isRequired,
};

Editor.defaultProps = {
    className: '',
};

export default Editor;
