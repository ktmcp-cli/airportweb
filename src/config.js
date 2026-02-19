import Conf from 'conf';

const config = new Conf({ projectName: '@ktmcp-cli/airportweb' });

export function getConfig(key) {
  return config.get(key);
}

export function setConfig(key, value) {
  config.set(key, value);
}

export function isConfigured() {
  // Airport Web API is public — no auth required
  return true;
}

export function getAllConfig() {
  return config.store;
}

export default config;
