const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 6969;

// Serve static files from the 'public' directory inside 'server'
app.use(express.static(path.join(__dirname, 'public')));

const CHUNK_INCREMENT_INTERVAL = 10000; // 10 seconds
const INITIAL_CHUNK_SIZE = 1024 * 1024; // 1MB

// Helper function to get movie details from the directory structure
function getMovies() {
    const moviesDir = path.join(__dirname, '..', 'movies');
    const movieFolders = fs.readdirSync(moviesDir);

    return movieFolders
        .filter(folder => {
            const fullPath = path.join(moviesDir, folder);
            return fs.statSync(fullPath).isDirectory();
        })
        .map(folder => {
            const fullPath = path.join(moviesDir, folder);
            const movieFiles = fs.readdirSync(fullPath).filter(file => file.endsWith('.mp4') || file.endsWith('.mkv'));

            if (movieFiles.length > 0) {
                const [movieFile] = movieFiles;
                const match = folder.match(/^(.*) \((\d{4})\) \[(.*?)\]/);

                if (match) {
                    const [_, title, year, quality] = match;
                    const encoding = movieFile.endsWith('.mkv') ? 'hevc' : 'h264';

                    // Replace } with : in the title
                    const processedTitle = title.replace(/@/g, ':');

                    return {
                        title: processedTitle.toLowerCase().replace(/[^a-zA-Z0-9 -:]/g, '').trim(),
                        originalTitle: processedTitle,
                        path: path.join(folder, movieFile),
                        year: parseInt(year, 10),
                        quality,
                        encoding
                    };
                }
            }
        })
        .filter(movie => movie !== undefined);
}

// API endpoint to get the list of movies
app.get('/api/movies', (req, res) => {
    const movies = getMovies();
    res.json(movies);
});

// API endpoint to get details of a specific movie by title
app.get('/api/movie/:title', (req, res) => {
    const movieTitle = decodeURIComponent(req.params.title)
        .replace(/-/g, ' ')
        .replace(/[^a-zA-Z0-9 -]/g, '')
        .toLowerCase()
        .trim();
    const movies = getMovies();
    const movie = movies.find(m => m.title.toLowerCase().replace(/[^a-zA-Z0-9 -]/g, '').trim() === movieTitle);
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).json({ message: 'Movie not found' });
    }
});

// Stream the movie video with progressive content support
app.get('/movies/:filename', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const filename = decodeURIComponent(req.params.filename);
    const moviePath = path.join(__dirname, '..', 'movies', filename);

    console.log(`${clientIp} req to ${moviePath}`);

    fs.stat(moviePath, (err, stats) => {
        if (err || !stats.isFile()) {
            console.log('Error or not a file:', err);
            return res.status(404).send('Movie not found');
        }

        const range = req.headers.range;
        if (!range) {
            return res.status(416).send('Requires Range header');
        }

        const [start, end] = range.replace(/bytes=/, '').split('-');
        const startByte = parseInt(start, 10);
        const endByte = end ? parseInt(end, 10) : Math.min(startByte + INITIAL_CHUNK_SIZE - 1, stats.size - 1);

        const chunkSize = endByte - startByte + 1;
        const fileStream = fs.createReadStream(moviePath, { start: startByte, end: endByte });

        const contentType = path.extname(moviePath) === '.mkv' ? 'video/x-matroska' : `video/${path.extname(moviePath).slice(1)}`;

        res.writeHead(206, {
            'Content-Range': `bytes ${startByte}-${endByte}/${stats.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': contentType
        });

        fileStream.pipe(res);

        fileStream.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).send('Internal Server Error');
        });
    });
});

// Serve the play.html file
app.get('/play/:movieTitle', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'play.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});