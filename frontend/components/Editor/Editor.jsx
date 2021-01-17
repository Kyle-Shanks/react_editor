import React, { useState, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Prism from 'prismjs';
import 'prismjs/components/prism-css-extras';
import 'prismjs/components/prism-js-extras';
import {
    ComponentContainer,
    EditorContainer,
    TextArea,
    CodeDisplay,
    StatsDisplay,
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
    - Add hotkeys like comment line and undo and redo and things
*/

const NL = '\n';
const TAB = '\t';
const BASE_CLASS_NAME = 'Editor';
// const INITIAL_EDITOR_HEIGHT = 336; // 21rem
const INITIAL_EDITOR_HEIGHT = 288; // 21rem - 3rem for the info display on the bottom

const Editor = ({ className, content, language, updateContent }) => {
    const [editorHeight, setEditorHeight] = useState(INITIAL_EDITOR_HEIGHT);
    const [stats, setStats] = useState('');
    const textareaRef = useRef();
    const outputRef = useRef();

    const updateStats = () => {
        const { value, selectionStart, selectionEnd } = textareaRef.current;

        const linesBeforeStart = value.slice(0, selectionStart).split('\n');
        const startLine = linesBeforeStart.length - 1;
        const startLineIdx = linesBeforeStart[linesBeforeStart.length - 1].length;

        const linesBeforeEnd = value.slice(0, selectionEnd).split('\n');
        const endLine = linesBeforeEnd.length - 1;
        const endLineIdx = linesBeforeEnd[linesBeforeEnd.length - 1].length;

        const str = `${value.split(NL).length}L ${value.length}C [${startLine}, ${startLineIdx}`
            + (selectionStart !== selectionEnd ? ` -> ${endLine}, ${endLineIdx}]` : ']');

        if (str !== stats) setStats(str);
    };

    const delayedUpdateStats = () => setTimeout(updateStats, 0);

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

    const updateCaretPosition = (start, end) => {
        if (start !== undefined) textareaRef.current.selectionStart = start;
        if (end !== undefined) textareaRef.current.selectionEnd = end;
    };

    const updateTextareaContent = (text, start, end) => {
        textareaRef.current.value = text;
        updateCaretPosition(start, end);
    };

    // Update the content and set the caret position for the editor
    const handleContentUpdate = (text, start, end) => {
        updateTextareaContent(text, start, end);
        updateContent(text);
    };

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
            handleContentUpdate(lines.join(NL), start + startShift, end + startShift + endShift);
        } else if (start !== end) {
            const selectRange = getSelectionLines(start, end);
            for (let i = selectRange[0]; i < selectRange[1] + 1; i++) {
                lines[i] = `${TAB}${lines[i]}`;
                if (i !== selectRange[0]) endShift += TAB.length;
            }
            handleContentUpdate(lines.join(NL), start + startShift, end + startShift + endShift);
        } else {
            handleContentUpdate(
                `${content.substring(0, end)}${TAB}${content.substring(end)}`,
                start + startShift,
                end + startShift + endShift
            );
        }
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
        const newCaretPosition = start + indentation.length + 1 + (willIndent ? TAB.length : 0);

        handleContentUpdate(
            `${select.textBefore}${NL}${indentation}`
            + `${willIndent ? `${TAB}${NL}${indentation}` : ''}`
            + `${select.textAfter}`,
            newCaretPosition,
            newCaretPosition
        );
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
                handleContentUpdate(
                    `${select.textBefore}${e.key}${select.text}${pairMap[e.key]}${select.textAfter}`,
                    start + 1,
                    end + 1
                );
            } else if (e.key !== nextChar) {
                // Add the pair chars
                handleContentUpdate(
                    `${select.textBefore}${e.key}${pairMap[e.key]}${select.textAfter}`,
                    start + 1,
                    end + 1
                );
            } else {
                updateCaretPosition(start + 1, end + 1);
            }
        } else {
            // Default functionality to replace selection with character
            if (start !== end) return;

            if (e.key !== nextChar) {
                // Add closing character
                handleContentUpdate(
                    `${select.textBefore}${e.key}${select.textAfter}`,
                    start + 1,
                    end + 1
                );
            } else {
                updateCaretPosition(start + 1, end + 1);
            }
        }

        e.preventDefault();
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

        delayedUpdateStats();
    };

    useLayoutEffect(() => {
        updateTextareaContent(content, 0, 0);
        updateStats();
    }, []);

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
                    ref={textareaRef}
                    style={{ height: editorHeight }}
                    onChange={(e) => {
                        updateContent(e.target.value);
                        delayedUpdateStats();
                    }}
                    onKeyDown={handleKeyDown}
                    onKeyUp={delayedUpdateStats}
                    onMouseUp={delayedUpdateStats}
                    spellCheck={false}
                />
                <CodeDisplay className={`${BASE_CLASS_NAME}__Output`} ref={outputRef}>
                    <code className={`language-${language}`}>{content}</code>
                    {/* Added to update height when an empty line is added at the end */}
                    <br/>
                </CodeDisplay>
            </EditorContainer>
            <StatsDisplay>{stats}</StatsDisplay>
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
