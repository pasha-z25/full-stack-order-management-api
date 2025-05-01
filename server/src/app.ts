import cors from 'cors';
import express from 'express';
import 'express-async-errors';

const corsOptions = {
  origin: ['http://localhost:3000', 'http://frontend_web:3000'],
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const app = express();

app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/', function (_req, res) {
  res.send('Hello World');
});
