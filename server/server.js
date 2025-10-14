import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import creditRouter from './routes/creditRoutes.js';
import { stripeWebHooks } from './controllers/webhooks.js';

const app = express();
const PORT = process.env.PORT || 5000;
await connectDB();

// stripe webhooks
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebHooks);

//middleware
app.use(cors());
app.use(express.json());

//routes
app.get('/', (request, response) => response.send('Server is live'));
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);
app.use('/api/credit', creditRouter);

app.listen(PORT, () => {
  console.log('Server is running at port: ', PORT);
});
