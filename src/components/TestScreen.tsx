import { useState, useMemo, useRef, useEffect } from 'react';
import { motion,  } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { questions, specialQuestions } from '../data/questions';
import { computeResult, ComputedResult } from '../utils/calculator';


interface TestScreenProps {
  onComplete: (result: ComputedResult) => void;
  onBack: () => void;
}

export default function TestScreen({ onComplete, onBack }: TestScreenProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Shuffle logic on mount
  const shuffledQuestions = useMemo(() => {
    const regular = [...questions].sort(() => Math.random() - 0.5);
    const insertIndex = Math.floor(Math.random() * regular.length) + 1;
    return [
      ...regular.slice(0, insertIndex),
      specialQuestions[0],
      ...regular.slice(insertIndex)
    ];
  }, []);

  // Compute visible questions based on answers
  const visibleQuestions = useMemo(() => {
    const visible = [...shuffledQuestions];
    const gateIndex = visible.findIndex(q => q.id === 'drink_gate_q1');
    if (gateIndex !== -1 && answers['drink_gate_q1'] === 3) {
      visible.splice(gateIndex + 1, 0, specialQuestions[1]);
    }
    return visible;
  }, [shuffledQuestions, answers]);

  const total = visibleQuestions.length;
  const done = Object.keys(answers).length;
  const percent = total > 0 ? (done / total) * 100 : 0;
  const isComplete = done === total && total > 0;

  // We can show questions sequentially or all at once like original.
  // Let's stick closer to the original but with better UI: a list of cards
  // but maybe scroll into view on next.

  const handleOptionChange = (qId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));

    // Find the next unanswered question and scroll to it
    const currentIndex = visibleQuestions.findIndex(q => q.id === qId);
    if (currentIndex !== -1 && currentIndex < visibleQuestions.length - 1) {
      // Look for the next unanswered question
      for (let i = currentIndex + 1; i < visibleQuestions.length; i++) {
        const nextQ = visibleQuestions[i];
        if (!answers[nextQ.id] && answers[nextQ.id] !== value) {
          const nextElement = questionRefs.current[nextQ.id];
          if (nextElement) {
            setTimeout(() => {
              nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
          break;
        }
      }
    }
  };

  const handleSubmit = () => {
    const res = computeResult(answers);
    onComplete(res);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#dbe8dd] shadow-[0_16px_40px_rgba(47,73,55,0.08)] p-5 sm:p-8">
      {/* Topbar Progress */}
      <div className="sticky top-4 z-10 bg-white/80 backdrop-blur-md pb-4 pt-2 border-b border-[#dbe8dd] mb-6 flex items-center justify-between gap-4">
        <button onClick={onBack} className="p-2 hover:bg-[#edf6ef] rounded-full text-[#6a786f] transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 h-3 bg-[#edf3ee] rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#97b59c] to-[#4d6a53]"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-sm font-medium text-[#6a786f] whitespace-nowrap">
          {done} / {total}
        </div>
      </div>

      <div className="space-y-6">
        {visibleQuestions.map((q, index) => (
          <motion.div
            key={q.id}
            ref={(el) => { questionRefs.current[q.id] = el; }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="border border-[#dbe8dd] rounded-[18px] p-5 sm:p-6 bg-gradient-to-b from-[#ffffff] to-[#fbfdfb]"
          >
            <div className="flex justify-between items-center mb-3 text-xs text-[#6a786f]">
              <div className="bg-[#edf6ef] border border-[#dbe8dd] px-3 py-1.5 rounded-full font-medium">
                第 {index + 1} 题
              </div>
              <div className="opacity-60">
                {q.special ? '补充题' : '维度已隐藏'}
              </div>
            </div>
            
            <h3 className="text-lg text-[#1e2a22] font-medium leading-relaxed whitespace-pre-wrap mb-5">
              {q.text}
            </h3>

            <div className="grid gap-3">
              {q.options.map((opt, i) => {
                const isSelected = answers[q.id] === opt.value;
                const letter = ['A', 'B', 'C', 'D'][i] || String(i + 1);
                
                return (
                  <label 
                    key={i} 
                    className={`
                      relative flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-[#4d6a53] bg-[#f2f7f3] shadow-sm' 
                        : 'border-[#dbe8dd] bg-white hover:border-[#bcd0c1] hover:bg-[#f8fcf9]'
                      }
                    `}
                  >
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={opt.value} 
                      checked={isSelected}
                      onChange={() => handleOptionChange(q.id, opt.value)}
                      className="peer sr-only"
                    />
                    <div className={`
                      flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold transition-colors mt-0.5
                      ${isSelected ? 'bg-[#4d6a53] border-[#4d6a53] text-white' : 'border-[#bcd0c1] text-[#6a786f]'}
                    `}>
                      {letter}
                    </div>
                    <div className={`text-[15px] leading-snug ${isSelected ? 'font-medium text-[#1e2a22]' : 'text-[#304034]'}`}>
                      {opt.label}
                    </div>
                  </label>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-[#dbe8dd] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[#6a786f] text-center sm:text-left">
          {isComplete ? '✨ 全部完成，前往审判！' : '全选完才会放行。起码把题做完整。'}
        </p>
        <button 
          disabled={!isComplete}
          onClick={handleSubmit}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#4d6a53] text-white px-8 py-4 rounded-2xl font-bold shadow-[0_8px_20px_rgba(77,106,83,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3d5542] transition-colors"
        >
          查看分析报告
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
