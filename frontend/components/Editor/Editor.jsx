import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Prism from "prismjs";
import { ComponentContainer, TextArea, CodeDisplay } from './styles.js';

/* TODO: Quality of life things
    - On keep indentation of the current line when adding a new line
    - On backspace, if the selectionStart and selectionEnd are the same and
      the 4 chars before are a tab, delete the tab
    - On [, {, (, ", ', or `, automatically add the other half
    - Add a system for undos and redos, they are p broken right now
*/

const TAB = '    ';

const Editor = ({ className, initialContent, language }) => {
    const BASE_CLASS_NAME = 'Editor';
    const [content, setContent] = useState(initialContent);
    const [editorHeight, setEditorHeight] = useState(320);
    const outputRef = useRef();

    const getLines = () => content.split("\n");

    // Get the line numbers for the current selection
    const getSelectionLines = (start, end) => {
        const lines = getLines();
        const selectionRange = [null, null];
        let total = 0;

        for (let i = 0; i < lines.length; i++) {
            total += lines[i].length + 1;
            if (selectionRange[0] === null && total >= start) selectionRange[0] = i;
            if (selectionRange[1] === null && total >= end) selectionRange[1] = i;
        }

        return selectionRange;
    };

    const handleTabActions = (e) => {
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
            setContent(lines.join("\n"));
        } else if (start !== end) {
            const selectRange = getSelectionLines(start, end);
            for (let i = selectRange[0]; i < selectRange[1] + 1; i++) {
                lines[i] = `${TAB}${lines[i]}`;
                if (i !== selectRange[0]) endShift += 4;
            }
            setContent(lines.join("\n"));
        } else {
            setContent(`${content.substring(0, end)}${TAB}${content.substring(end, content.length)}`);
        }

        // Janky way to move selection start end end to the correct position after the update
        setTimeout(() => {
            ref.selectionStart = start + startShift;
            ref.selectionEnd = end + startShift + endShift;
        }, 0);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') handleTabActions(e);
    };

    useEffect(() => {
        Prism.highlightAll();
        if (outputRef.current.clientHeight !== editorHeight) {
            setEditorHeight(outputRef.current.clientHeight);
        }
    }, [language, content]);

    return (
        <ComponentContainer className={`${BASE_CLASS_NAME} ${className}`.trim()}>
            <TextArea
                className={`${BASE_CLASS_NAME}__Input`}
                style={{ height: editorHeight }}
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
            />
            <CodeDisplay className={`${BASE_CLASS_NAME}__Output`} ref={outputRef}>
                <code className={`language-${language}`}>{content}</code>
                {/* Added so that an empty line at the end will update height */}
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