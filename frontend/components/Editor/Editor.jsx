import React from 'react';
import PropTypes from 'prop-types';

const Editor = ({ className }) => {
    const BASE_CLASS_NAME = 'Editor';

    return (
        <div className={`${BASE_CLASS_NAME} ${className}`.trim()}>
            testing editor
        </div>
    );
};

Editor.propTypes = {
    className: PropTypes.string,
};

Editor.defaultProps = {
    className: '',
};

export default Editor;