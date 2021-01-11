import styled from 'styled-components';

export const ComponentContainer = styled.div`
    display: block;
    position: relative;
    height: 20rem;
    width: calc(100vw - 2rem);
    max-width: 40rem;
    margin: 1rem auto;
    background: #1c252c;
    font-size: 13px;
    font-family: Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace;
    border-radius: 0.125rem;
    box-shadow: 0 2px 10px 1px rgba(0,0,0,0.35);
`;

export const EditorContainer = styled.div`
    display: block;
    position: relative;
    height: 100%;
    overflow: auto;
`;

const editorStyles = `
    font-size: 13px;
    text-shadow: none;
    white-space: pre-wrap;
    word-spacing: normal;
    overflow-wrap: break-word;
    line-height: 1.5;
    overflow: hidden;
    tab-size: 4;
`;

export const TextArea = styled.textarea`
    z-index: 10;
    position: absolute;
    min-height: 100%;
    width: 100%;
    padding: 1.5rem 2rem;
    resize: none;
    color: #b7c5d3;
    ${editorStyles}

    /* Hide the textarea content */
    background-color: transparent;
    border: none;
    outline: none;
    -webkit-text-fill-color: transparent;

    &::selection {
        text-shadow: none;
        background-color: rgba(255,255,255,0.14);
    }
`;

export const CodeDisplay = styled.pre`
    display: block;
    position: relative;
    min-height: 100%;
    padding: 1.5rem 2rem;
    ${editorStyles}

    & > code {
        display: block;
        ${editorStyles}
    }
`;

export const LanguageDisplay = styled.div`
    z-index: 100;
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 1rem;
    color: rgba(200,235,255,0.35);
    pointer-events: none;
`;
