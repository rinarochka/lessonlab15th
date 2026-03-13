import { useCallback, useState } from 'react';
import { generateAI } from '../services/aiService';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const run = useCallback(async (type, vars, opts = {}) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = await generateAI(type, vars, opts);
      if (output.json) {
        setResult(output.json);
        return output.json;
      }
      setResult({ raw: output.raw });
      return null;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, result, run };
}
