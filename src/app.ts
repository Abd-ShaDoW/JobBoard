import express from 'express';
import userRouter from './routers/user';
import companyRouter from './routers/company';
import jobRouter from './routers/job';
import cvRouter from './routers/cv';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

app.use('/user', userRouter);
app.use('/company', companyRouter);
app.use('/post', jobRouter);
app.use('/cv', cvRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
