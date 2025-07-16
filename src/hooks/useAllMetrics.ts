import { useEffect, useState, useRef } from 'react';

// Можно вынести адрес и freq/timeframe в параметры
const WALLET = '0xb3ce8b2e01a0fe858c498a24302bd5dbad48aef2';
const API = 'https://back.axylon.com';

export function useAllMetrics(freq: string) {
  const [metrics, setMetrics] = useState({
    tvl: null as number | null,
    volume: null as number | null,
    sharpe: null as number | null,
    volatility: null as number | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Храним предыдущие значения, чтобы не сбрасывать их на время загрузки
  const prevMetrics = useRef(metrics);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API}/last_tvl?user_address=${WALLET}`).then(r => r.json()).then(d => Number(d.tvl)),
      fetch(`${API}/volume?user_address=${WALLET}&freq=${freq}`).then(r => r.json()).then(d => Number(d.volume)),
      fetch(`${API}/sharpe?user_address=${WALLET}&freq=${freq}`).then(r => r.json()).then(d => d.sharpe !== undefined ? Number(d.sharpe) : (d.sharpe_ratio !== undefined ? Number(d.sharpe_ratio) : null)),
      fetch(`${API}/volatility?user_address=${WALLET}&freq=${freq}`).then(r => r.json()).then(d => d.volatility !== undefined ? Number(d.volatility) : null),
    ])
      .then(([tvl, volume, sharpe, volatility]) => {
        if (!cancelled) {
          setMetrics({ tvl, volume, sharpe, volatility });
          prevMetrics.current = { tvl, volume, sharpe, volatility };
          setLoading(false);
        }
      })
      .catch(e => {
        if (!cancelled) {
          setError('Ошибка загрузки метрик');
          setLoading(false);
        }
      });
    // Не сбрасываем значения на null при загрузке
    // setMetrics(prev => prev);
    return () => { cancelled = true; };
  }, [freq]);

  // Возвращаем всегда актуальные значения (старые или новые)
  return { ...metrics, loading, error };
} 