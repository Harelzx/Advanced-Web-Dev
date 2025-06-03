"use client";
import { FaLightbulb } from "react-icons/fa";

export default function StudyExplanation({
  explanation,
  show,
  title = "הסבר מפורט:",
}) {
  if (!show) return null;

  return (
    <div className="mt-8 relative px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-sm"></div>
      <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 border-r-4 border-blue-400 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center mb-4">
          <div className="bg-blue-500 text-white rounded-full p-2 ml-3">
            <FaLightbulb size={20} />
          </div>
          <h4 className="font-bold text-xl text-blue-800">{title}</h4>
        </div>
        <div className="bg-white/60 rounded-xl p-4 border border-blue-200">
          <p className="text-blue-700 whitespace-pre-line text-right leading-relaxed text-lg">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
