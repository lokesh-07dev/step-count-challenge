import { cors } from "hono/cors";

export const corsMiddleware = () => {
  return cors({
    origin: (origin) => {
      // Allow localhost for dev (Vite 5173, Expo web 8081, mobile emulator 10.0.2.2)
      if (!origin || origin.startsWith("http://localhost") || origin.startsWith("exp://")) {
        return origin || "*";
      }
      return origin;
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  });
};
