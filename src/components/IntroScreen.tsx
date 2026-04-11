import { PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#dbe8dd] shadow-[0_16px_40px_rgba(47,73,55,0.08)] overflow-hidden relative">
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-b from-[#7fa5862e] to-[#7fa58605] pointer-events-none" />
      
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-center p-10 sm:p-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 text-xs text-[#4d6a53] border border-[#dbe8dd] bg-[#edf6ef] rounded-full px-3 py-2 mb-6 font-medium">
            ✨ 全新体验版
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1e2a22] leading-[1.1]">
            MBTI已经过时，<br />
            <span className="text-[#4d6a53]">SBTI</span>来了。
          </h1>
          <p className="mt-6 text-[#6a786f] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            基于15个维度、25种隐秘人格类型的深度审判。<br/>
            世界已经够乱了，准备好面对你真实的电子魂魄了吗？
          </p>
          
          <div className="mt-10 flex justify-center">
            <button
              onClick={onStart}
              className="flex items-center gap-2 bg-[#4d6a53] text-white px-8 py-4 rounded-2xl shadow-[0_12px_30px_rgba(77,106,83,0.18)] font-bold text-lg hover:-translate-y-1 hover:shadow-xl transition-all active:scale-95"
            >
              <PlayCircle size={24} />
              开始测试
            </button>
          </div>
        </motion.div>
        
        <div className="mt-16 pt-8 border-t border-[#dbe8dd] w-full flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm text-[#6a786f]">
          <span>原作者：B站@蛆肉儿串儿</span>
          <span>重制版：基于React生态体验升级</span>
        </div>
      </div>
    </div>
  );
}
