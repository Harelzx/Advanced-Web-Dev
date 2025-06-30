"use client";
import React from 'react';

export default function LearningItem({
  item,
  index,
  isCompleted,
  toggleStepCompletion,
  totalItems,
  isOpen,
  onToggle
}) {
  return (
    <div
      className={`group relative panels rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
        isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-100'
      }`}
    >
      {/* Completion Checkbox */}
      <button
        onClick={() => toggleStepCompletion(index)}
        className={`absolute top-6 left-6 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
          isCompleted
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400 panels'
        }`}
        aria-label={`סימון שלב ${index + 1} כהושלם`}
      >
        {isCompleted && <span className="text-sm">✓</span>}
      </button>

      {/* Step Number Badge */}
      <div
        className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
          isCompleted ? 'bg-green-600' : 'bg-blue-600'
        }`}
      >
        {isCompleted ? '✓' : index + 1}
      </div>

      <div className="p-8 pt-20">
        {/* Topic Title */}
        <h2 
          onClick={onToggle}
          className={`flex justify-between items-center cursor-pointer text-2xl md:text-3xl font-bold mb-4 group-hover:text-blue-600 transition-colors ${
            isCompleted ? 'text-green-700 line-through' : 'text-gray-800'
          }`}
        >
          {item.topic}

          {/* Toggle indicator - rotating arrow */}
          <span
            className={`ml-2 transition-transform duration-300 ${
              isOpen ? 'rotate-90' : 'rotate-0'
            }`}
          >
            ▶
          </span>
        </h2>


        {/* Expanded Content */}
        {isOpen &&  (
          <>
        {/* Explanation */}
        <div className="panels rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 text-sm">💡</span>
            </div>
            <p className="text-color leading-relaxed text-sm sm:text-base md:text-lg">
              {item.explanation}
            </p>
            
          </div>
        </div>

        {/* Video Section */}
        {item.videoUrl && (
          <div className="panels rounded-xl p-6 mb-6 border border-red-200 dark:border-red-400 bg-red-50 dark:bg-red-900">
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <div className="w-8 h-8 bg-red-200 dark:bg-red-700 rounded-full flex items-center justify-center">
                <span className="text-red-700 dark:text-red-100">🎥</span>
              </div>
              <h3 className="font-bold text-gray-800 dark:text-red-100 text-sm sm:text-base md:text-lg">
                סרטון הסבר
              </h3>
            </div>

            <div className="w-full mb-4 rounded-lg overflow-hidden shadow-md">
              <iframe
                className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px]"
                src={item.videoUrl.replace("watch?v=", "embed/")}
                title={`סרטון עבור ${item.topic}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <a
              href={item.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              צפה ביוטיוב
            </a>
          </div>
        )}

          </>
        )}
      </div> {/* ← סוגר את p-8 pt-20 */}

      {/* Progress Line */}
      {index < totalItems - 1 && (
        <div
          className={`absolute -bottom-4 right-1/2 w-1 h-8 transition-colors ${
            isCompleted ? 'bg-green-400' : 'bg-gray-300'
          }`}
        ></div>
      )}
    </div> 
  );
}
