export interface SalaryData {
  role: string;
  location: string;
  min: number;
  max: number;
  avg: number;
  count: number;
}

export async function fetchSalaryData(
  role: string,
  location: string = 'india'
): Promise<SalaryData> {
  const appId  = import.meta.env.VITE_ADZUNA_APP_ID;
  const appKey = import.meta.env.VITE_ADZUNA_APP_KEY;

  const url = `https://api.adzuna.com/v1/api/jobs/in/histogram?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(role)}&where=${encodeURIComponent(location)}&content-type=application/json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Adzuna API error');

  const data = await res.json();

  // Adzuna returns salary histogram — extract min/max/avg
  const histogram = data.histogram || {};
  const salaries  = Object.keys(histogram).map(Number).filter(n => n > 0);

  if (salaries.length === 0) {
    return { role, location, min: 0, max: 0, avg: 0, count: 0 };
  }

  const min = Math.min(...salaries);
  const max = Math.max(...salaries);
  const avg = Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length);
  const count = Object.values(histogram).reduce((a: number, b: any) => a + b, 0) as number;

  // Convert GBP/USD to INR approximation (Adzuna India returns INR)
  return {
    role,
    location,
    min: Math.round(min / 100000),  // convert to Lakhs
    max: Math.round(max / 100000),
    avg: Math.round(avg / 100000),
    count,
  };
}

export async function fetchJobCount(role: string): Promise<number> {
  const appId  = import.meta.env.VITE_ADZUNA_APP_ID;
  const appKey = import.meta.env.VITE_ADZUNA_APP_KEY;

  const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(role)}&content-type=application/json`;

  const res = await fetch(url);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count || 0;
}