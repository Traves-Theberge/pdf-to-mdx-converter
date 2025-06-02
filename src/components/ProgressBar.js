import React from 'react';

const ProgressBar = ({ progress }) => (
  <div className="mt-6">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-blue-600">Converting</span>
      </div>
      <span className="text-sm font-medium text-blue-600">
        {Math.round(progress)}%
      </span>
    </div>
    <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

export default ProgressBar;