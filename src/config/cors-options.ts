import { CorsOptions } from 'cors';

const corsDomains: string[] = ['http://localhost:3000'];

const corsOptions: CorsOptions = {
  origin: corsDomains,
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  optionsSuccessStatus: 200,
  credentials: true,
};

export { corsDomains, corsOptions };
