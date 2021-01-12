import React, { useState, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Prism from "prismjs";
import {
    ComponentContainer,
    EditorContainer,
    TextArea,
    CodeDisplay,
    LanguageDisplay,
} from './styles.js';

// TODO: Need to clean up the code a bit and add constants and things

// TODO: Specialized key handlers for each language
// - This can be used for things like tag autocomplete in HTML
// - Also should add new line and tab when hitting enter after open tag

/* TODO: Quality of life things
    - Need to check if the next line has indent before adding the new line when hitting enter after a pair character
    - Add a system for undos and redos, they are p broken right now
        - Should have a debounced function for normal character additions
        - Should add to revisions array on any tab or enter key press (or other big actions i guess)
*/

const NL = '\n';
const TAB = '\t';
const INITIAL_EDITOR_HEIGHT = 320; // 20rem

const Editor = ({ className, content, language, updateContent }) => {
    const BASE_CLASS_NAME = 'Editor';
    const [editorHeight, setEditorHeight] = useState(INITIAL_EDITOR_HEIGHT);
    const outputRef = useRef();

    const getLines = () => content.split(NL);

    // Get the line numbers for the current selection
    const getSelectionLines = (start, end) => {
        const lines = getLines();
        const selectionRange = [null, null];
        let total = 0;

        for (let i = 0; i < lines.length; i++) {
            total += lines[i].length;
            if (selectionRange[0] === null && total >= start) selectionRange[0] = i;
            if (selectionRange[1] === null && total >= end) selectionRange[1] = i;
            total++; // for new line char
        }

        return selectionRange;
    };

    // Returns selection text, text before and after selection, and line numbers
    const getSelectionInfo = (start, end) => ({
        range: getSelectionLines(start, end),
        textBefore: content.slice(0, start),
        text: content.slice(start, end),
        textAfter: content.slice(end),
    });

    const handleTabAction = (e) => {
        e.preventDefault();
        const ref = e.currentTarget;
        const start = ref.selectionStart;
        const end = ref.selectionEnd;
        const lines = getLines();
        let startShift = TAB.length;
        let endShift = 0;

        if (e.shiftKey) {
            startShift = 0;
            const selectRange = getSelectionLines(start, end);
            for (let i = selectRange[0]; i < selectRange[1] + 1; i++) {
                if (lines[i].slice(0, TAB.length) === TAB) {
                    lines[i] = lines[i].slice(TAB.length);
                    i === selectRange[0] ? startShift = -(TAB.length) : endShift -= TAB.length;
                }
            }
            updateContent(lines.join(NL));
        } else if (start !== end) {
            const selectRange = getSelectionLines(start, end);
            for (let i = selectRange[0]; i < selectRange[1] + 1; i++) {
                lines[i] = `${TAB}${lines[i]}`;
                if (i !== selectRange[0]) endShift += TAB.length;
            }
            updateContent(lines.join(NL));
        } else {
            updateContent(`${content.substring(0, end)}${TAB}${content.substring(end)}`);
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
        const select = getSelectionInfo(start, end);
        const lines = getLines();
        const indentation = lines[select.range[0]].match(/^\s+/)?.[0] || '';
        const willIndent = ['{', '[', '(', '`'].includes(select.textBefore.slice(-1));

        updateContent(
            `${select.textBefore}${NL}${indentation}${willIndent ? `${TAB}${NL}${indentation}` : ''}${select.textAfter}`
        );

        // Janky way to move selection start end end to the correct position after the update
        setTimeout(() => {
            ref.selectionStart = start + indentation.length + 1 + (willIndent ? TAB.length : 0);
            ref.selectionEnd = start + indentation.length + 1 + (willIndent ? TAB.length : 0);
        }, 0);
    };

    const handlePairChar = (e) => {
        const ref = e.currentTarget;
        const start = ref.selectionStart;
        const end = ref.selectionEnd;
        const select = getSelectionInfo(start, end);
        const nextChar = select.textAfter[0];
        const pairMap = {
            '(': ')',
            '[': ']',
            '{': '}',
            '\'': '\'',
            '"': '"',
            '`': '`',
        };

        // If opening character
        if (Object.keys(pairMap).includes(e.key)) {
            if (start !== end) {
                // Surround selection in pair chars
                updateContent(
                    `${select.textBefore}${e.key}`
                    + `${select.text}`
                    + `${pairMap[e.key]}${select.textAfter}`
                );
            } else if (e.key !== nextChar) {
                // Add the pair chars
                updateContent(`${select.textBefore}${e.key}${pairMap[e.key]}${select.textAfter}`);
            }
        } else {
            // Default functionality to replace selection with character
            if (start !== end) return;

            if (e.key !== nextChar) {
                // Add closing character
                updateContent(`${select.textBefore}${e.key}${select.textAfter}`);
            }
        }

        e.preventDefault();

        // Janky way to move selection start end end to the correct position after the update
        setTimeout(() => {
            ref.selectionStart = start + 1;
            ref.selectionEnd = end + 1;
        }, 0);
    };

    const handleKeyDown = (e) => {
        const pairChars = ['(', ')', '[', ']', '{', '}', '\'', '"', '`'];

        if (e.key === 'Tab') {
            handleTabAction(e);
        } else if (e.key === 'Enter') {
            handleNewLine(e);
        } else if (pairChars.includes(e.key)) {
            handlePairChar(e);
        }
    };

    useLayoutEffect(() => {
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
