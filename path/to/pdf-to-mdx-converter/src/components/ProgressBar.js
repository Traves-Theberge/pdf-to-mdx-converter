import React from 'react';

const ProgressBar = ({ progress }) => (
  <div className="mt-4">
    <progress value={progress} max="100" className="w-full"></progress>
    <p>{Math.round(progress)}% complete</p>
  </div>
);

export default ProgressBar;
