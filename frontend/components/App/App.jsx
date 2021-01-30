import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Editor from 'frontend/components/Editor';
import { ComponentContainer } from './styles';

const App = ({ className }) => {
    const BASE_CLASS_NAME = 'App';
    const [language, setLanguage] = useState('javascript');
    const [content, setContent] = useState('');

    const updateContent = (text) => setContent(text);
    const updateLanguage = (lang) => setLanguage(lang);

    return (
        <ComponentContainer className={`${BASE_CLASS_NAME} ${className}`.trim()}>
            <Editor
                content={content}
                language={language}
                updateContent={updateContent}
                updateLanguage={updateLanguage}
            />
        </ComponentContainer>
    );
};

App.propTypes = {
    className: PropTypes.string,
};

App.defaultProps = {
    className: '',
};

export default App;
