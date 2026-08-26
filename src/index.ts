import express from 'express';
import cors from 'cors';
import verifyConnection from './db/neo4j';
import router from './router/index.routes';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8000;

app.use('/api', router);

verifyConnection().then(() => {
  app.listen(PORT, () => console.log(`App is running at port ${PORT}`));
});
