import { v4 as uuidv4 } from 'uuid';

const API_HOST = process.env.API_HOST;
const WS_ENDPOINT = `ws://${API_HOST}/api/ws`;
const CONNECTION_TIMEOUT = 5000;

let cachedSessionId: string | null = null;
let websocket: WebSocket | null = null;
let connectionPromise: Promise<string> | null = null;

const closeWebSocket = () => {
	if (websocket) {
		websocket.close();
		websocket = null;
	}
	connectionPromise = null;
};

const createWebSocketConnection = (sessionId: string): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		websocket = new WebSocket(`${WS_ENDPOINT}?client_id=${sessionId}`);

		const timeout = setTimeout(() => {
			console.error('WebSocket connection timeout');
			closeWebSocket();
			reject(new Error('WebSocket connection timeout'));
		}, CONNECTION_TIMEOUT);

		websocket.onopen = () => {
			clearTimeout(timeout);
			resolve(sessionId);
		};

		websocket.onerror = (error) => {
			clearTimeout(timeout);
			console.error('WebSocket error:', error);
			closeWebSocket();
			reject(new Error('Failed to establish WebSocket connection'));
		};

		websocket.onclose = (event) => {
			if (!event.wasClean) {
				console.warn('WebSocket closed unexpectedly:', event);
			}
			websocket = null;
			connectionPromise = null;
		};
	});
};

export async function getClientId(): Promise<string> {
	if (websocket?.readyState === WebSocket.OPEN && cachedSessionId) {
		console.info('Cached Session ID :', cachedSessionId);
		return cachedSessionId;
	}

	cachedSessionId = cachedSessionId || uuidv4();
	connectionPromise = createWebSocketConnection(cachedSessionId);

	try {
		await connectionPromise;
		return cachedSessionId;
	} catch (error) {
		cachedSessionId = null;
		connectionPromise = null;
		throw error;
	}
}
