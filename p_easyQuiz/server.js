const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // 安全解析 URL，防止路径遍历
  let reqPath = new URL(req.url, 'http://localhost').pathname;
  let filePath = path.normalize('.' + reqPath);

  // 确保路径不超出项目目录
  if (!filePath.startsWith('.' + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (reqPath === '/') filePath = './index.html';

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`EasyQuiz running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});