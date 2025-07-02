export function getApiUrl() {
  if (typeof window !== 'undefined') {
    // Если сайт открыт не на localhost, используем адрес сайта
    if (!window.location.hostname.startsWith('localhost') && !window.location.hostname.startsWith('127.')) {
      // Например, если фронт открыт по IP 172.16.3.152:3000
      return `http://${window.location.hostname}:5000`;
    }
  }
  // По умолчанию — localhost
  return 'http://localhost:5000';
} 