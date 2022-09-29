import express, { Express } from 'express';
import { hello } from '../controllers/hello';

export const router = express.Router();

router.get("/hello", hello);