'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { SURVEY_QUESTIONS, type SurveyQuestion } from '@/lib/survey-questions';

interface PersonalitySurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  onComplete: (responses: Record<string, any>) => void;
}

export default function PersonalitySurveyModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  onComplete
}: PersonalitySurveyModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  if (!isOpen) return null;

  const currentQuestion = SURVEY_QUESTIONS[currentQuestionIndex];
  const totalQuestions = SURVEY_QUESTIONS.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Check if current question has been answered
  const currentAnswer = responses[currentQuestion.id];
  const isAnswered = currentAnswer !== undefined && currentAnswer !== null && currentAnswer !== '';

  // For multi-select, check if at least one option is selected
  const hasValidAnswer = currentQuestion.type === 'multi-select'
    ? Array.isArray(currentAnswer) && currentAnswer.length > 0
    : isAnswered;

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Submit survey
      onComplete(responses);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const value = responses[question.id];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-2 md:space-y-3">
            {question.options?.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-center p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-purple-50 active:scale-98 ${
                  value === option
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponse(question.id, e.target.value)}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 flex-shrink-0"
                />
                <span className="ml-3 text-sm md:text-base text-gray-700 leading-relaxed">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multi-select':
        const selectedValues = value || [];
        return (
          <div className="space-y-2 md:space-y-3 max-h-96 overflow-y-auto pr-2">
            {question.options?.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-center p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-purple-50 active:scale-98 ${
                  selectedValues.includes(option)
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v: string) => v !== option);
                    handleResponse(question.id, newValues);
                  }}
                  className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500 flex-shrink-0"
                />
                <span className="ml-3 text-sm md:text-base text-gray-700 leading-relaxed">{option}</span>
              </label>
            ))}
            {selectedValues.length > 0 && (
              <p className="text-sm text-purple-600 font-medium mt-3">
                {selectedValues.length} selected
              </p>
            )}
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {question.options?.map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResponse(question.id, idx + 1)}
                  className={`aspect-square rounded-xl transition-all transform active:scale-95 text-lg md:text-xl font-bold flex items-center justify-center ${
                    value === idx + 1
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs md:text-sm text-gray-600 px-1">
              <span className="text-left max-w-[45%]">{question.options?.[0]}</span>
              <span className="text-right max-w-[45%]">{question.options?.[question.options.length - 1]}</span>
            </div>
          </div>
        );

      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 md:p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className="text-xl md:text-2xl font-bold truncate">Personality Survey</h2>
                <p className="text-sm md:text-base text-purple-100 mt-1 truncate">
                  Help us understand {recipientName} better
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs md:text-sm mt-2">
              <span className="truncate">{currentQuestion.category}</span>
              <span className="flex-shrink-0 ml-2">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-xl mx-auto">
              {/* Question Number & Category Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold text-lg flex-shrink-0">
                  {currentQuestionIndex + 1}
                </span>
                <span className="text-sm text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full">
                  {currentQuestion.category}
                </span>
              </div>

              {/* Question */}
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* Answer Input */}
              {renderQuestion(currentQuestion)}

              {/* Optional hint for text questions */}
              {currentQuestion.type === 'text' && (
                <p className="text-sm text-gray-500 mt-3 italic">
                  Tip: The more specific you are, the better the recommendations!
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4 md:p-6 flex justify-between gap-3">
            <button
              onClick={handleBack}
              disabled={isFirstQuestion}
              className="flex items-center gap-2 px-4 md:px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm md:text-base"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!hasValidAnswer}
              className="flex items-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-sm md:text-base"
            >
              {isLastQuestion ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Profile</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
