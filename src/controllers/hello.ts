import { wrap } from '../utils/Wrapper';
import { Request, Response } from 'express';

export async function hello(req: Request, res: Response) {
    res.send("Hello!")
}
