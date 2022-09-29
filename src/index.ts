import express, { Express } from 'express';
import logger from './utils/Logger';
import cors from 'cors';
import { router as hello } from './routes/hello';
import { envInt } from './utils/Commons';

const app: Express = express();
const port = envInt('PORT', 2162);

app.use(cors());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use('/', hello);
app.listen(port, () => {
    logger.info(`⚡️ Server is running at http://localhost:${port}`);
})