export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export interface HealthStatus {
  status: string;
  app: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check returned status ${response.status}`);
  }
  return response.json();
}
