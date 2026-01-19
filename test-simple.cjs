const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
  } else if (req.url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Server running' }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(5173, '127.0.0.1', () => {
  console.log('✅ Test server running on http://127.0.0.1:5173');
});
