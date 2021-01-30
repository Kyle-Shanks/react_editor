import React, { useState, useLayoutEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Prism from 'prismjs';
import 'frontend/util/prism-line-numbers';
import languageMap from './editorLanguageMap';
import {
    ComponentContainer,
    EditorContainer,
    TextArea,
    CodeDisplay,
    Stats,
    StatsDisplay,
    LanguageDisplay,
    LanguageMenu,
    LanguageOption,
} from './styles.js';

// TODO
// - Add commands for quality of life
//   - cmd+shift+k to delete line(s)
//   - cmd+x to cut line(s)
// - Should add styles for hiding line numbers and the stats bar on the bottom (not zen mode enough)
// - New lines don't scroll the editor bc of the handler. Need to implement scroll functionality
// - Add an undo and redo system
// - Need to clean up the code a bit
//   - Move methods to a different file if possible
//   - Add constants and things
// - Can add specialized key handlers for specific languages (e.g. tag autocomplete in HTML)
//   - This seems like a lot so I may skip this

const NL = '\n';
// const TAB = '\t';
const TAB = '    ';
const BASE_CLASS_NAME = 'Editor';
const INITIAL_EDITOR_HEIGHT = 576; // 36rem

const Editor = ({ className, content, language, updateContent, updateLanguage }) => {
    const [editorHeight, setEditorHeight] = useState(INITIAL_EDITOR_HEIGHT);
    const [stats, setStats] = useState('');
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const textareaRef = useRef();
    const outputRef = useRef();

    const toggleLanguageMenu = () => setIsLanguageMenuOpen(!isLanguageMenuOpen);

    const handleLanguageSelect = (lang) => {
        updateLanguage(lang);
        setIsLanguageMenuOpen(false);
    }

    const updateStats = () => {
        const { value, selectionStart, selectionEnd } = textareaRef.current;

        const linesBeforeStart = value.slice(0, selectionStart).split('\n');
        const startLine = linesBeforeStart.length;
        const startLineIdx = linesBeforeStart[linesBeforeStart.length - 1].length + 1;

        const linesBeforeEnd = value.slice(0, selectionEnd).split('\n');
        const endLine = linesBeforeEnd.length;
        const endLineIdx = linesBeforeEnd[linesBeforeEnd.length - 1].length + 1;

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
        const selectRange = getSelectionLines(start, end);
        let startShift = TAB.length;
        let endShift = 0;

        if (e.shiftKey) {
            startShift = 0;
            for (let i = selectRange[0]; i < selectRange[1] + 1; i++) {
                if (lines[i].slice(0, TAB.length) === TAB) {
                    lines[i] = lines[i].slice(TAB.length);
                    i === selectRange[0] ? startShift = -(TAB.length) : endShift -= TAB.length;
                }
            }
            handleContentUpdate(lines.join(NL), start + startShift, end + startShift + endShift);
        } else if (start !== end) {
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
        const prevChar = select.textBefore.slice(-1);
        const nextChar = select.textAfter[0];
        const willIndent = ['{', '[', '(', '`'].includes(prevChar);
        const newCaretPosition = start + indentation.length + 1 + (willIndent ? TAB.length : 0);

        const indentCharMap = {
            '{': '}',
            '[': ']',
            '(': ')',
            '`': '`',
        };

        const indentContent = willIndent
            ? `${TAB}${nextChar === indentCharMap[prevChar] ? NL : ''}${indentation}`
            : '';

        handleContentUpdate(
            `${select.textBefore}${NL}${indentation}${indentContent}${select.textAfter}`,
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

    const handleLineDuplication = (e) => {
        e.preventDefault();
        const ref = e.currentTarget;
        const start = ref.selectionStart;
        const end = ref.selectionEnd;
        const lines = getLines();
        const selectRange = getSelectionLines(start, end);

        const beforeContent = lines.slice(0, selectRange[1] + 1);
        const afterContent = lines.slice(selectRange[1] + 1);
        const lineContent = lines.slice(selectRange[0], selectRange[1] + 1);
        const lineContentLength = lineContent.join(NL).length;

        handleContentUpdate(
            [...beforeContent, ...lineContent, ...afterContent].join(NL),
            start + lineContentLength + 1,
            end + lineContentLength + 1
        );
    };

    const handleMoveLinesUp = (e) => {
        e.preventDefault();
        const ref = e.currentTarget;
        const start = ref.selectionStart;
        const end = ref.selectionEnd;
        const lines = getLines();
        const selectRange = getSelectionLines(start, end);

        const beforeContent = lines.slice(0, selectRange[0] - 1);
        const afterContent = lines.slice(selectRange[1] + 1);
        const lineBefore = lines[selectRange[0] - 1];
        const lineContent = lines.slice(selectRange[0], selectRange[1] + 1);

        handleContentUpdate(
            [...beforeContent, ...lineContent, lineBefore, ...afterContent].join(NL),
            start - lineBefore.length - 1,
            end - lineBefore.length - 1
        );
    };

    const handleMoveLinesDown = (e) => {
        e.preventDefault();
        const ref = e.currentTarget;
        const start = ref.selectionStart;
        const end = ref.selectionEnd;
        const lines = getLines();
        const selectRange = getSelectionLines(start, end);

        const beforeContent = lines.slice(0, selectRange[0]);
        const afterContent = lines.slice(selectRange[1] + 2);
        const lineAfter = lines[selectRange[1] + 1];
        const lineContent = lines.slice(selectRange[0], selectRange[1] + 1);

        handleContentUpdate(
            [...beforeContent, lineAfter, ...lineContent, ...afterContent].join(NL),
            start + lineAfter.length + 1,
            end + lineAfter.length + 1
        );
    };

    const handleCommands = (e) => {
        // Meta Commands
        if (e.metaKey) {
            if (e.shiftKey && !e.ctrlKey && !e.altKey) {
                switch (e.key) {
                    case 'd': handleLineDuplication(e); break;
                    default: return;
                }
            } else if (e.ctrlKey && !e.shiftKey && !e.altKey) {
                switch (e.key) {
                    case 'ArrowUp': handleMoveLinesUp(e); break;
                    case 'ArrowDown': handleMoveLinesDown(e); break;
                    default: return;
                }
            }
        }
    };

    const handleKeyDown = (e) => {
        const pairChars = ['(', ')', '[', ']', '{', '}', '\'', '"', '`'];

        if (e.key === 'Tab') {
            handleTabAction(e);
        } else if (e.key === 'Enter') {
            handleNewLine(e);
        } else if (pairChars.includes(e.key)) {
            handlePairChar(e);
        } else {
            handleCommands(e);
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
                    onClick={() => { if (isLanguageMenuOpen) setIsLanguageMenuOpen(false); }}
                    onKeyDown={handleKeyDown}
                    onKeyUp={delayedUpdateStats}
                    onMouseUp={delayedUpdateStats}
                    spellCheck={false}
                />
                <CodeDisplay className={`${BASE_CLASS_NAME}__Output`} ref={outputRef}>
                    <code className={`language-${language} line-numbers`}>{content}</code>
                    {/* Added to update height when an empty line is added at the end */}
                    <br/>
                </CodeDisplay>
            </EditorContainer>
            <Stats>
                <StatsDisplay>{stats}</StatsDisplay>
                <LanguageDisplay
                    active={isLanguageMenuOpen}
                    onClick={toggleLanguageMenu}
                >
                    {languageMap[language]}
                </LanguageDisplay>
            </Stats>
            <LanguageMenu active={isLanguageMenuOpen}>
                {Object.keys(languageMap).map((lang) => (
                    <LanguageOption
                        key={`lang_option_${lang}`}
                        onClick={() => { handleLanguageSelect(lang); }}
                    >
                        {languageMap[lang]}
                    </LanguageOption>
                ))}
            </LanguageMenu>
        </ComponentContainer>
    );
};

Editor.propTypes = {
    className: PropTypes.string,
    content: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    updateContent: PropTypes.func.isRequired,
    updateLanguage: PropTypes.func.isRequired,
};

Editor.defaultProps = {
    className: '',
};

export default Editor;
