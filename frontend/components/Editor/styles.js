import styled from 'styled-components';

export const ComponentContainer = styled.div`
    display: block;
    position: relative;
    height: 20rem;
    overflow: auto;
    width: calc(100vw - 2rem);
    max-width: 40rem;
    margin: 1rem auto;
    background: #1c252c;
    border-radius: 0.5rem;
    box-shadow: 0 2px 10px 1px rgba(0,0,0,0.35);
`;

const editorStyles = `
    font-size: 13px;
    text-shadow: none;
    font-family: Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace;
    white-space: pre-wrap;
    word-spacing: normal;
    line-height: 1.5;
    overflow: hidden;
`;

export const TextArea = styled.textarea`
    z-index: 100;
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
