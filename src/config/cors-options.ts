import { CorsOptions } from 'cors';

const corsDomains: string[] = process.env?.ALLOWED_DOMAINS?.split(',') || [];

const corsOptions: CorsOptions = {
  origin: corsDomains,
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  optionsSuccessStatus: 200,
  credentials: true,
};

export { corsDomains, corsOptions };
