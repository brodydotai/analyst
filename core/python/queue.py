"""QStash client for dispatching async processing jobs."""

from qstash import QStash

from core.python.config import QSTASH_TOKEN, VERCEL_URL

_client: QStash | None = None


def get_client() -> QStash:
    """Return a cached QStash client."""
    global _client
    if _client is None:
        _client = QStash(QSTASH_TOKEN)
    return _client


def publish(endpoint: str, body: dict) -> str:
    """Publish a message to a Vercel serverless function via QStash.

    Args:
        endpoint: The API route path, e.g. "/api/python/process_filing"
        body: JSON-serializable payload.

    Returns:
        The QStash message ID.
    """
    client = get_client()
    base = VERCEL_URL.rstrip("/")
    url = f"{base}{endpoint}"
    result = client.message.publish_json(url=url, body=body)
    return result.message_id
