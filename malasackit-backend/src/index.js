import express from 'express';
import cors from 'cors';


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});


// Register location routes
import locationRoutes from './routes/locationRoutes.js';
app.use('/api', locationRoutes);



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
