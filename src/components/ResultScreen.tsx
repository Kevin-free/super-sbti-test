import { useState, useRef, useEffect } from 'react';
import { motion,  } from 'framer-motion';
import { Download, RefreshCw, Lock, Unlock } from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { ComputedResult } from '../utils/calculator';
import { dimensionOrder, dimensionMeta, DIM_EXPLANATIONS } from '../data/dimensions';
import { TYPE_IMAGES } from '../data/types';

interface ResultScreenProps {
  result: ComputedResult;
  onRestart: () => void;
}

export default function ResultScreen({ result, onRestart }: ResultScreenProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const posterRef = useRef<HTMLDivElement>(null);
  const type = result.finalType;
  const imageSrc = TYPE_IMAGES[type.code] || null;

  useEffect(() => {
    QRCode.toDataURL(window.location.origin, {
      width: 80,
      margin: 1,
      color: {
        dark: '#4d6a53',
        light: '#ffffff',
      },
    }).then(setQrCodeUrl);
  }, []);

  const handleSimulatePayment = () => {
    setShowPayment(true);
    // Simulate 2 seconds payment
    setTimeout(() => {
      setShowPayment(false);
      setUnlocked(true);
    }, 2000);
  };

  const generatePoster = async () => {
    if (!posterRef.current) return;
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f6faf6',
        ignoreElements: (element) => {
          // Skip elements that might have unsupported color functions
          const computedStyle = window.getComputedStyle(element);
          const bgColor = computedStyle.backgroundColor;
          const color = computedStyle.color;
          return bgColor.includes('oklab') || color.includes('oklab');
        },
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `SBTI_${type.code}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate poster', err);
      alert('海报生成失败，请重试');
    }
  };

  return (
    <div className="space-y-6">
      {/* 核心结果展示 & 海报区域 */}
      <div className="bg-white rounded-3xl border border-[#dbe8dd] shadow-[0_16px_40px_rgba(47,73,55,0.08)] p-5 sm:p-8">
        
        {/* 海报截图容器 */}
        <div ref={posterRef} className="p-4 -m-4 sm:p-0 sm:m-0 bg-white">
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {/* 左侧大图 */}
            <div className="flex-1 min-h-[320px] bg-gradient-to-b from-white to-[#f7fbf8] border border-[#dbe8dd] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-12 -bottom-12 w-36 h-36 rounded-full bg-gradient-to-b from-[#7fa5861f] to-[#7fa58603] pointer-events-none" />
              {imageSrc ? (
                <div className="flex-1 flex items-center justify-center relative z-10 mb-4">
                  <img src={imageSrc} alt={type.cn} className="max-h-[220px] object-contain drop-shadow-xl rounded-xl" crossOrigin="anonymous" />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-6xl font-bold text-[#e2ede4] mb-4">
                  {type.code}
                </div>
              )}
              <div className="text-center font-medium text-[#4d6a53] bg-white/60 backdrop-blur-sm rounded-xl py-2 px-4 inline-block mx-auto border border-[#dbe8dd]/50 relative z-10">
                "{type.intro}"
              </div>
            </div>

            {/* 右侧核心信息 */}
            <div className="flex-1 flex flex-col justify-center bg-gradient-to-b from-[#ffffff] to-[#fbfdfb] border border-[#dbe8dd] rounded-3xl p-6 sm:p-8">
              <div className="text-xs font-bold tracking-widest text-[#4d6a53] mb-2 uppercase">
                {result.modeKicker}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#1e2a22] tracking-tight mb-2">
                {type.code} <span className="text-2xl text-[#6a786f] font-medium ml-1">({type.cn})</span>
              </h1>
              
              <div className="inline-flex items-center gap-2 bg-[#edf6ef] border border-[#dbe8dd] text-[#4d6a53] font-bold px-4 py-2 rounded-full text-sm self-start mt-4">
                {result.badge}
              </div>
              
              <p className="mt-4 text-[#6a786f] text-sm leading-relaxed">
                {result.sub}
              </p>

              {/* QR code and share prompt - always visible */}
              <div className="mt-6 pt-4 border-t border-[#dbe8dd] flex items-center gap-3">
                {qrCodeUrl && (
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 p-1">
                    <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
                  </div>
                )}
                <div className="text-xs text-[#6a786f]">
                  <div className="font-bold text-[#1e2a22] mb-0.5">截图分享测试</div>
                  <div className="text-[11px]">扫码跳转当前网站</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 基本简评 (总是可见) */}
          <div className="mt-6 bg-[#fbfdfb] border border-[#dbe8dd] rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[#1e2a22] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#4d6a53] rounded-full inline-block"></span>
              人格素描
            </h3>
            <p className="text-[#304034] text-[15px] leading-[1.8] whitespace-pre-wrap">
              {type.desc}
            </p>
          </div>
        </div>

        {/* 动作区 */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-end">
          <button 
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#dbe8dd] text-[#6a786f] font-medium hover:bg-[#f6faf6] transition-colors"
          >
            <RefreshCw size={18} />
            再测一次
          </button>
          <button 
            onClick={generatePoster}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4d6a53] text-white font-bold shadow-lg shadow-[#4d6a53]/20 hover:-translate-y-0.5 transition-transform"
          >
            <Download size={18} />
            保存海报分享
          </button>
        </div>
      </div>

      {/* 付费墙 / 详细解析区 */}
      <div className="bg-white rounded-3xl border border-[#dbe8dd] shadow-[0_16px_40px_rgba(47,73,55,0.08)] overflow-hidden">
        
        {!unlocked ? (
          <div className="relative p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            {/* 模糊背景暗示内容 */}
            <div className="absolute inset-0 opacity-10 pointer-events-none blur-sm" aria-hidden="true">
              <div className="grid grid-cols-2 gap-4 p-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-24 bg-[#4d6a53] rounded-xl"></div>
                ))}
              </div>
            </div>
            
            <div className="relative z-10 bg-white/90 backdrop-blur border border-[#dbe8dd] p-8 rounded-3xl shadow-xl max-w-md w-full">
              <div className="w-16 h-16 bg-[#edf6ef] text-[#4d6a53] rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#1e2a22] mb-2">解锁完整深度分析</h3>
              <p className="text-[#6a786f] text-sm mb-6">
                包含全部 15 个维度的精细得分、性格短板解析以及专属发展建议。
              </p>
              
              {showPayment ? (
                <div className="space-y-4">
                  <div className="animate-spin text-[#4d6a53] mx-auto w-8 h-8">
                    <RefreshCw size={32} />
                  </div>
                  <p className="text-sm text-[#4d6a53] font-medium animate-pulse">模拟支付中，请稍候...</p>
                </div>
              ) : (
                <button 
                  onClick={handleSimulatePayment}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4d6a53] to-[#3a5240] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                >
                  ¥ 9.90 一键解锁
                </button>
              )}
              <div className="mt-4 text-xs text-[#a0b0a5]">
                * 这是一个模拟的付费流程，不会真实扣款
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.5 }}
            className="p-5 sm:p-8 bg-[#fbfdfb]"
          >
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#dbe8dd]">
              <div className="w-10 h-10 bg-[#edf6ef] text-[#4d6a53] rounded-full flex items-center justify-center">
                <Unlock size={20} />
              </div>
              <h3 className="text-2xl font-bold text-[#1e2a22]">15 维度深度剖析</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dimensionOrder.map(dim => {
                const level = result.levels[dim];
                const explanation = DIM_EXPLANATIONS[dim][level];
                const meta = dimensionMeta[dim];
                
                return (
                  <div key={dim} className="bg-white border border-[#dbe8dd] rounded-2xl p-5 hover:border-[#bcd0c1] transition-colors">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div>
                        <div className="text-xs text-[#6a786f] mb-1">{meta.model}</div>
                        <div className="font-bold text-[#1e2a22] text-[15px]">{meta.name}</div>
                      </div>
                      <div className="bg-[#edf6ef] text-[#4d6a53] font-black px-3 py-1 rounded-lg text-lg">
                        {level}
                      </div>
                    </div>
                    <div className="w-full bg-[#f2f7f3] h-1.5 rounded-full mb-3 overflow-hidden">
                      <div 
                        className="bg-[#4d6a53] h-full rounded-full" 
                        style={{ width: `${(result.rawScores[dim] / 6) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[#6a786f] text-sm leading-relaxed">
                      {explanation}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 p-6 bg-[#edf6ef] rounded-2xl border border-[#dbe8dd]/50 text-center">
              <p className="text-[#4d6a53] font-medium text-sm">
                本测试仅供娱乐。别拿它当诊断、面试、相亲、分手、算命或人生判决书。你可以笑，但别太当真。
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
