import express, { application } from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('hello world');
});

export { app };
