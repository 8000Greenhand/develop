from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import os

DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', 'sk-f8395816b2ac44b0903d01b9497c4ad7')
DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

class ProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        # CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length))
            
            # 转发到 DeepSeek
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
            }
            
            req_data = json.dumps(body).encode('utf-8')
            req = urllib.request.Request(DEEPSEEK_API_URL, data=req_data, headers=headers, method='POST')
            
            try:
                with urllib.request.urlopen(req, timeout=60) as resp:
                    result = json.loads(resp.read().decode('utf-8'))
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        
        elif self.path == '/api/chat/stream':
            # 流式响应
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length))
            body['stream'] = True
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
            }
            
            req_data = json.dumps(body).encode('utf-8')
            req = urllib.request.Request(DEEPSEEK_API_URL, data=req_data, headers=headers, method='POST')
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            
            try:
                with urllib.request.urlopen(req, timeout=120) as resp:
                    while True:
                        try:
                            chunk = resp.read(1024)
                        except (ConnectionResetError, BrokenPipeError):
                            # 客户端断开连接
                            break
                        if not chunk:
                            break
                        try:
                            self.wfile.write(chunk)
                            self.wfile.flush()
                        except (BrokenPipeError, ConnectionResetError):
                            # 客户端已断开
                            break
            except Exception as e:
                error_msg = f"data: {{'error': '{str(e)}'}}\n\n"
                try:
                    self.wfile.write(error_msg.encode('utf-8'))
                    self.wfile.flush()
                except:
                    pass

    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'model': 'deepseek-chat'}).encode('utf-8'))

if __name__ == '__main__':
    port = 8765
    server = HTTPServer(('0.0.0.0', port), ProxyHandler)
    print(f'DND AI DM Proxy running on port {port}')
    server.serve_forever()
