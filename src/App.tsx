import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroScreen from './components/IntroScreen';
import TestScreen from './components/TestScreen';
import ResultScreen from './components/ResultScreen';
import { ComputedResult } from './utils/calculator';

type ScreenState = 'intro' | 'test' | 'result';

function App() {
  const [screen, setScreen] = useState<ScreenState>('intro');
  const [result, setResult] = useState<ComputedResult | null>(null);

  const startTest = () => {
    setScreen('test');
  };

  const handleComplete = (computedResult: ComputedResult) => {
    setResult(computedResult);
    setScreen('result');
  };

  const handleRestart = () => {
    setResult(null);
    setScreen('intro');
  };

  return (
    <div className="max-w-[980px] mx-auto p-4 sm:p-6 pb-14 min-h-screen">
      <AnimatePresence mode="wait">
        {screen === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <IntroScreen onStart={startTest} />
          </motion.div>
        )}
        
        {screen === 'test' && (
          <motion.div
            key="test"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <TestScreen onComplete={handleComplete} onBack={() => setScreen('intro')} />
          </motion.div>
        )}

        {screen === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            <ResultScreen result={result} onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
