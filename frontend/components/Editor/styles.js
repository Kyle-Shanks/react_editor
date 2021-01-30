import styled from 'styled-components';

const EDITOR_BACKGROUND_COLOR = '#1c252c';
const EDITOR_TEXT_COLOR = '#6a7a85';
const EDITOR_TEXT_COLOR_2 = '#8a9aa5';
const EDITOR_SELECTION_TINT = 'rgba(180,225,255,0.125)';
const EDITOR_TINT_1 = 'rgba(205,235,255,0.08)';
const EDITOR_TINT_2 = 'rgba(205,235,255,0.2)';
const EDITOR_TINT_3 = 'rgba(205,235,255,0.35)';
const EDITOR_TINT_4 = 'rgba(205,235,255,0.6)';
const EDITOR_SHADE_1 = 'rgba(0,0,0,0.1)';
const EDITOR_SHADE_2 = 'rgba(0,0,0,0.24)';
const EDITOR_SHADE_3 = 'rgba(0,0,0,0.4)';
const EDITOR_SHADE_4 = 'rgba(0,0,0,0.6)';

export const ComponentContainer = styled.div`
    display: block;
    position: relative;
    width: calc(100vw - 2rem);
    max-width: 48rem;
    margin: auto;
    background: ${EDITOR_BACKGROUND_COLOR};
    font-size: 13px;
    font-family: Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace;
    border-radius: 0.25rem;
    overflow: hidden;
`;

export const EditorContainer = styled.div`
    display: block;
    position: relative;
    height: 36rem;
    padding: 0 2rem;
    overflow: auto;
`;

const editorStyles = `
    font-size: 13px;
    font-family: Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace;
    text-shadow: none;
    white-space: pre-wrap !important;
    word-spacing: normal;
    overflow-wrap: break-word;
    word-break: keep-all;
    line-height: 1.5;
    tab-size: 4;
`;

export const TextArea = styled.textarea`
    z-index: 10;
    position: absolute;
    min-height: 100%;
    width: calc(100% - 4rem);
    padding: 2rem 2rem 0;
    resize: none;
    color: #b7c5d3;
    overflow: hidden;
    ${editorStyles}

    /* Hide the textarea content */
    background-color: transparent;
    border: none;
    outline: none;
    // -webkit-text-fill-color: rgba(255,255,255,0.1); // For testing
    -webkit-text-fill-color: transparent;

    &::selection {
        text-shadow: none;
        background-color: ${EDITOR_SELECTION_TINT};
    }
`;

export const CodeDisplay = styled.pre`
    display: block;
    position: relative;
    min-height: 100%;
    padding: 2rem 2rem 0;
    ${editorStyles}

    & > code {
        display: block;
        ${editorStyles}
    }
`;

export const Stats = styled.div`
    z-index: 20;
    display: flex;
    position: relative;
    justify-content: space-between;
    padding: 1rem 3rem;
    background-color: ${EDITOR_BACKGROUND_COLOR};
    color: ${EDITOR_TEXT_COLOR};
`;

export const StatsDisplay = styled.div`
    padding: 0.5rem 1rem;
`;

export const LanguageDisplay = styled.div`
    padding: 0.5rem 1rem;
    border-radius: 0.125rem;
    background-color: ${props => props.active ? EDITOR_TINT_1 : 'transparent'};

    &:hover {
        cursor: pointer;
        background-color: ${EDITOR_TINT_1};
    }
`;

export const LanguageMenu = styled.div`
    z-index: 30;
    position: absolute;
    height: 12rem;
    width: 12rem;
    right: 3rem;
    bottom: 3.5rem;
    border-radius: 0.25rem;
    background-color: ${EDITOR_TINT_1};
    overflow: auto;

    // Toggle styles
    opacity: ${props => props.active ? '1' : '0'};
    pointer-events: ${props => props.active ? 'all' : 'none'};
    transform: translateY(${props => props.active ? '0' : '1.5'}rem);
`;

export const LanguageOption = styled.div`
    display: block;
    position: relative;
    background-color: transparent;
    padding: 0.75rem 1rem;
    color: ${EDITOR_TEXT_COLOR_2};

    &:hover {
        cursor: pointer;
        background-color: ${EDITOR_TINT_1};
    }
`;
