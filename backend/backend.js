import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatRoutes from './routes/chatRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api', chatRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    // Serve frontend static files
    const staticPath = join(__dirname, '..', 'dist');
    app.use(express.static(staticPath));

    // Handle SPA routing
    app.get('*', (req, res) => {
        res.sendFile(join(staticPath, 'index.html'));
    });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
