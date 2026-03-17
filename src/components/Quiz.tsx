import React, { useState, useEffect } from 'react';
import { generateQuizQuestions, QuizQuestion } from '../services/gemini';
import { Loader2, CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function Quiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const loadQuestions = async () => {
    setIsLoading(true);
    setIsFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    try {
      const newQuestions = await generateQuizQuestions(5);
      setQuestions(newQuestions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleSelectAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    if (option === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a365d]" />
        <p className="text-[#1a365d] font-medium">Preparing your examination, Brother...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-red-500">Failed to load questions. Please try again.</p>
        <button onClick={loadQuestions} className="px-4 py-2 bg-[#1a365d] text-[#d4af37] rounded-lg">Retry</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 p-6 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-serif text-[#1a365d]">Examination Complete</h2>
        <div className="text-6xl font-bold text-[#d4af37]">
          {score} / {questions.length}
        </div>
        <p className="text-slate-600 text-lg">
          {score === questions.length ? "Excellent work, Brother. Your knowledge is sound." : "Continue your labor and study the ritual, Brother."}
        </p>
        <button 
          onClick={loadQuestions}
          className="flex items-center gap-2 px-6 py-3 bg-[#1a365d] text-[#d4af37] rounded-xl hover:bg-[#0f294a] transition-colors mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          Take Another Quiz
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 h-full flex flex-col pt-12">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-serif text-[#1a365d]">Ritual Knowledge</h2>
        <span className="text-sm font-medium text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex-1 flex flex-col">
        <h3 className="text-xl font-medium text-slate-800 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3 flex-1">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            
            let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ";
            
            if (!isAnswered) {
              buttonClass += "border-slate-200 hover:border-[#1a365d] hover:bg-slate-50 text-slate-700";
            } else {
              if (isCorrect) {
                buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-800";
              } else if (isSelected) {
                buttonClass += "border-red-500 bg-red-50 text-red-800";
              } else {
                buttonClass += "border-slate-200 bg-slate-50 text-slate-400 opacity-50";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(option)}
                disabled={isAnswered}
                className={buttonClass}
              >
                <span className="font-medium">{option}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8">
            <div className={`p-4 rounded-xl mb-6 ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-200'}`}>
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold block mb-1">Explanation:</span>
                {currentQuestion.explanation}
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-3 bg-[#1a365d] text-[#d4af37] rounded-xl hover:bg-[#0f294a] transition-colors"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
