import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Editor from 'frontend/components/Editor';

const App = ({ className }) => {
    const BASE_CLASS_NAME = 'App';
    const [lang, setLang] = useState('javascript');

    return (
        <div className={`${BASE_CLASS_NAME} ${className}`.trim()}>
            <Editor language={lang} />
        </div>
    );
};

App.propTypes = {
    className: PropTypes.string,
};

App.defaultProps = {
    className: '',
};

export default App;