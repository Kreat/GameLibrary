import React from 'react';

const DndImage: React.FC = () => {
  return (
    <div 
      className="w-full h-full flex items-center justify-center bg-red-900"
      style={{ 
        backgroundImage: 'radial-gradient(circle, #7c0516 0%, #4a0505 100%)',
      }}
    >
      <div className="relative">
        {/* D20 die outline */}
        <div className="w-32 h-32 relative transform rotate-45 mx-auto">
          <div className="absolute inset-0 bg-red-600 border-4 border-yellow-900 transform rotate-45"></div>
          
          {/* "20" number */}
          <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
            <span className="text-5xl font-bold text-white">20</span>
          </div>
        </div>
        
        {/* Game title */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-red-700 px-4 py-1 rounded border-2 border-yellow-900 w-60 text-center">
          <span className="text-xl font-bold text-yellow-200">DUNGEONS & DRAGONS</span>
        </div>
      </div>
    </div>
  );
};

export default DndImage;