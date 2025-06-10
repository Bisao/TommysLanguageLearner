
import { useState, useCallback } from 'react';

export const useReadingTips = () => {
  const [showTips, setShowTips] = useState(false);

  const showTipsPanel = useCallback(() => {
    setShowTips(true);
  }, []);

  const hideTipsPanel = useCallback(() => {
    setShowTips(false);
  }, []);

  const toggleTipsPanel = useCallback(() => {
    setShowTips(prev => !prev);
  }, []);

  return {
    showTips,
    showTipsPanel,
    hideTipsPanel,
    toggleTipsPanel
  };
};
