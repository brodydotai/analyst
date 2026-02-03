"""Cron handler: fetch recent SEC filings from EDGAR and dispatch for processing."""

from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # TODO: Session 2 — EDGAR ingestion pipeline
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"status": "not_implemented"}')
