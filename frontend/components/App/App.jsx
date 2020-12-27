import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Editor from 'frontend/components/Editor';


const testCode = `/**
 * Test Function
 * @param {string[]} arr
 *
 * @returns {string[]}
 */
const test = (arr) => {
    const cap = arr.map((str) => str.toUpperCase());
    return cap;
};`;

const testCss = `/* Test CSS */
@import url(main.css);

$color: #654321;

textarea {
    height: 100px;
    color: rgba(255,255,255,0.6);
    background-color: $color;
}`;

const App = ({ className }) => {
    const BASE_CLASS_NAME = 'App';
    const [lang, setLang] = useState('javascript');

    const updateLang = (e) => setLang(e.currentTarget.value);

    return (
        <div className={`${BASE_CLASS_NAME} ${className}`.trim()}>
            <select onChange={updateLang} value={lang}>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="javascript">JS</option>
            </select>
            <Editor initialContent={testCode} language={lang} />
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