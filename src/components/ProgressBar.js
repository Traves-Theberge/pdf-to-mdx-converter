import React from 'react';

const ProgressBar = ({ progress }) => (
  <div className="mt-6">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-primary">Converting PDF</span>
      </div>
      <span className="text-sm font-medium text-primary">
        {Math.round(progress)}%
      </span>
    </div>
    <div className="h-1 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

export default ProgressBar;