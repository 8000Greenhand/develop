from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import urllib.error
import urllib.request

DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', '').strip()
DEEPSEEK_API_URL = os.environ.get('DEEPSEEK_API_URL', 'https://api.deepseek.com/chat/completions')


def json_bytes(data):
    return json.dumps(data, ensure_ascii=False).encode('utf-8')


class ProxyHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self, content_type='application/json'):
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def _send_json(self, status, data):
        self.send_response(status)
        self._send_cors_headers('application/json')
        self.end_headers()
        self.wfile.write(json_bytes(data))

    def _read_json_body(self):
        try:
            content_length = int(self.headers.get('Content-Length', '0'))
        except ValueError:
            raise ValueError('Content-Length 无效')
        if content_length <= 0:
            raise ValueError('请求体为空')
        try:
            return json.loads(self.rfile.read(content_length).decode('utf-8'))
        except json.JSONDecodeError as exc:
            raise ValueError(f'JSON 格式无效: {exc}')

    def _make_deepseek_request(self, body):
        if not DEEPSEEK_API_KEY:
            raise RuntimeError('未配置 DEEPSEEK_API_KEY 环境变量')
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
        }
        req_data = json_bytes(body)
        return urllib.request.Request(DEEPSEEK_API_URL, data=req_data, headers=headers, method='POST')

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers('text/plain')
        self.end_headers()

    def do_POST(self):
        if self.path not in ('/api/chat', '/api/chat/stream'):
            self._send_json(404, {'error': 'Not found'})
            return

        try:
            body = self._read_json_body()
        except ValueError as exc:
            self._send_json(400, {'error': str(exc)})
            return

        if self.path == '/api/chat/stream':
            self._handle_stream(body)
        else:
            self._handle_chat(body)

    def _handle_chat(self, body):
        try:
            req = self._make_deepseek_request(body)
            with urllib.request.urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read().decode('utf-8'))
            self._send_json(200, result)
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode('utf-8', errors='replace')
            self._send_json(exc.code, {'error': 'DeepSeek API 请求失败', 'detail': detail})
        except Exception as exc:
            self._send_json(500, {'error': str(exc)})

    def _handle_stream(self, body):
        body['stream'] = True
        try:
            req = self._make_deepseek_request(body)
        except Exception as exc:
            self._send_json(500, {'error': str(exc)})
            return

        self.send_response(200)
        self._send_cors_headers('text/event-stream; charset=utf-8')
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()

        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                while True:
                    chunk = resp.read(1024)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception as exc:
            message = json.dumps({'error': str(exc)}, ensure_ascii=False)
            try:
                self.wfile.write(f'data: {message}\n\n'.encode('utf-8'))
                self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                pass

    def do_GET(self):
        if self.path == '/api/health':
            self._send_json(200, {
                'status': 'ok',
                'model': 'deepseek-chat',
                'apiKeyConfigured': bool(DEEPSEEK_API_KEY),
            })
        else:
            self._send_json(404, {'error': 'Not found'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8765'))
    server = HTTPServer(('0.0.0.0', port), ProxyHandler)
    print(f'DND AI DM Proxy running on port {port}')
    if not DEEPSEEK_API_KEY:
        print('WARNING: DEEPSEEK_API_KEY 未设置，/api/chat 将返回配置错误')
    server.serve_forever()
