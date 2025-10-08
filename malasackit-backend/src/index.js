import express from 'express';
import cors from 'cors';
import { use } from 'react';


const app = express();
const port = 3000;

app,use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});
