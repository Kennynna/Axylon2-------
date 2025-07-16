import { API_CONFIG, ASSET_MAPPING, TIMEFRAME_MAPPING, NON_TRADING_ASSETS } from '../config/api';

// Types
export interface ApiDataPoint {
  ts: string;
  asset: string;
  avg_price: number;
}

export interface Position {
  coin: string;
  leverage: number;
  size: number;
  entryPx: number;
  positionValue: number;
  uPnl: number;
  liquidationPx: number;
  margin: number;
  funding: number;
}

// Functions
export const getPositions = async (userAddress: string = '0xb3ce8b2e01a0fe858c498a24302bd5dbad48aef2'): Promise<Position[]> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POSITIONS}?user_address=${userAddress}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
};

// Function to fetch data for a single asset
async function fetchAssetData(asset: string, freq: string): Promise<ApiDataPoint[]> {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRICES}?asset=${asset}&freq=${freq}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${asset} data:`, error);
    throw error;
  }
}

// Function to format date and time
function formatDateTime(timestamp: string): { name: string; date?: string; time?: string } {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en', { month: 'short' });
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return {
    name: `${hours.toString().padStart(2, '0')}:${minutes}`,
    date: `${day} ${month}`,
    time: `${hours.toString().padStart(2, '0')}:${minutes}`
  };
}

// Function to handle missing data points for non-trading assets
function fillMissingDataPoints(data: ApiDataPoint[], allTimestamps: string[]): ApiDataPoint[] {
  const filledData: ApiDataPoint[] = [];
  let lastKnownPrice: number | null = null;

  for (const ts of allTimestamps) {
    const existingPoint = data.find(point => point.ts === ts);
    if (existingPoint) {
      filledData.push(existingPoint);
      lastKnownPrice = existingPoint.avg_price;
    } else if (lastKnownPrice !== null) {
      // Use the last known price for missing data points
      filledData.push({
        ts,
        asset: data[0].asset,
        avg_price: lastKnownPrice
      });
    }
  }

  return filledData;
}

// Main function to get chart data
export const getChartData = async (timeframe: string): Promise<any[]> => {
  try {
    const freq = TIMEFRAME_MAPPING[timeframe as keyof typeof TIMEFRAME_MAPPING];
    if (!freq) {
      throw new Error(`Invalid timeframe: ${timeframe}`);
    }

    // Fetch data for all assets in parallel
    const assetPromises = Object.entries(ASSET_MAPPING).map(async ([displayName, apiName]) => {
      try {
        const data = await fetchAssetData(apiName, freq);
        // Sort data by timestamp to ensure correct order
        const sortedData = data.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
        return { displayName, data: sortedData };
      } catch (error) {
        console.error(`Error fetching data for ${displayName}:`, error);
        return { displayName, data: [] };
      }
    });

    const results = await Promise.all(assetPromises);
    const validResults = results.filter(result => result.data && result.data.length > 0);
    
    if (validResults.length === 0) {
      throw new Error('No valid data received from any asset');
    }

    // Get all unique timestamps from all assets and sort them
    const allTimestamps = Array.from(new Set(
      validResults.flatMap(result => result.data.map(point => point.ts))
    )).sort();

    // Create a map of all data points
    const dataMap = new Map<string, any>();
    // Для каждого актива будем хранить последнее известное значение процента
    const lastKnownPercentages: Record<string, number> = {
      "Axylon's vault": 0,
      Bitcoin: 0,
      Ethereum: 0,
      Hyperliquid: 0,
      SP500: 0,
      Gold: 0
    };
    // Initialize all timestamps with 0 values (будем потом заменять на last known)
    allTimestamps.forEach(ts => {
      dataMap.set(ts, {
        ...formatDateTime(ts),
        'Axylon\'s vault': 0,
        'Bitcoin': 0,
        'Ethereum': 0,
        'Hyperliquid': 0,
        'SP500': 0,
        'Gold': 0
      });
    });

    // Process each asset's data
    validResults.forEach(({ displayName, data }) => {
      if (!data || data.length === 0) return;
      // Для non-trading assets заполняем пропуски цен, как раньше
      const processedData = NON_TRADING_ASSETS.includes(ASSET_MAPPING[displayName as keyof typeof ASSET_MAPPING])
        ? fillMissingDataPoints(data, allTimestamps)
        : data;
      // Get the first value for this asset
      const firstValue = processedData[0].avg_price;
      if (firstValue === 0) return;
      // Считаем проценты для каждого таймстемпа, где есть данные
      processedData.forEach((point) => {
        const percentageChange = ((point.avg_price - firstValue) / firstValue) * 100;
        lastKnownPercentages[displayName] = +percentageChange.toFixed(3);
        const currentPoint = dataMap.get(point.ts);
        if (currentPoint) {
          (currentPoint as any)[displayName] = lastKnownPercentages[displayName];
        }
      });
    });
    // После этого проходим по всем точкам и для каждого актива, если значение осталось 0, но это не первая точка, подставляем last known value
    dataMap.forEach((point, ts) => {
      Object.keys(lastKnownPercentages).forEach((key) => {
        // Протягиваем только для NON_TRADING_ASSETS
        if (
          NON_TRADING_ASSETS.includes(ASSET_MAPPING[key as keyof typeof ASSET_MAPPING]) &&
          (point as any)[key] === 0 &&
          ts !== allTimestamps[0]
        ) {
          (point as any)[key] = lastKnownPercentages[key];
        }
      });
    });

    // Convert map to array and sort by timestamp
    const chartData = Array.from(dataMap.values()).sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time || '00:00'}`).getTime();
      const dateB = new Date(`${b.date} ${b.time || '00:00'}`).getTime();
      return dateA - dateB;
    });

    // Для каждого актива, кроме NON_TRADING_ASSETS, протягиваем только в самом конце
    type ChartPointNumberKey = "Axylon's vault" | "Bitcoin" | "Ethereum" | "Hyperliquid";
    const numberKeys: ChartPointNumberKey[] = ["Axylon's vault", "Bitcoin", "Ethereum", "Hyperliquid"];
    numberKeys.forEach(key => {
      let lastKnown: number | null = null;
      for (let i = chartData.length - 1; i >= 0; i--) {
        if (typeof chartData[i][key] === 'number' && chartData[i][key] !== 0) {
          lastKnown = chartData[i][key] as number;
          break;
        }
      }
      if (lastKnown !== null) {
        for (let i = chartData.length - 1; i >= 0; i--) {
          if (typeof chartData[i][key] === 'number' && chartData[i][key] === 0) {
            chartData[i][key] = lastKnown;
          } else {
            break;
          }
        }
      }
    });

    if (chartData.length === 0) {
      throw new Error('No valid data points after processing');
    }

    return chartData;

  } catch (error) {
    console.error('Error in getChartData:', error);
    throw error;
  }
}; 