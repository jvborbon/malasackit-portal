import express from 'express';
import cors from 'cors';
import locationRoutes from './routes/locationRoutes.js';



const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});


// Register location routes



app.use('/api', locationRoutes);



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
