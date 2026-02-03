"""QStash handler: process a single SEC filing (parse, embed, entity-link)."""

from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # TODO: Session 3 — Filing processing
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"status": "not_implemented"}')
