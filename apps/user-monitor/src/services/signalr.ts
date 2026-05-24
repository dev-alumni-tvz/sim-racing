import * as signalR from '@microsoft/signalr'
import { API_BASE_URL } from './api'

const NO_CREDENTIALS = { withCredentials: false }

export function buildLeaderboardConnection(): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/leaderboard`, NO_CREDENTIALS)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build()
}

export function buildQueueConnection(): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/queue`, NO_CREDENTIALS)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build()
}
