/*
::neup.documentation::logica-assist-chat-messages-api
::title Logica Assist Chat Messages API

Client helpers for reading and sending conversation messages.

::public

Use `logica.assist.chats(chatId).messages.get()` to read a page of messages and
`.send(content)` to send a message.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';

// External packages required by this logic module.
const requiredPackages = [] as const;


const MessagesPath = 'bridge/api.v1/chats';

export type AssistCredentials = { authAccountToken?: string | null };
export type AssistPagination = { limit?: number; offset?: number };
export type AssistMessage = {
  id: string;
  role: 'user' | 'assistant' | 'notification';
  content: string;
  sent_on: string;
};
export type AssistPaginationInfo = { limit: number; offset: number; total: number; hasMore: boolean };
export type AssistMessagesResponseBody = { messages: AssistMessage[]; pagination: AssistPaginationInfo; error?: string };
export type AssistSendMessageResponseBody = { id: string; result: string; messages: AssistMessage[]; error?: string; setupRequired?: boolean };

/** Builds the auth cookie map when the caller supplied an account token. */
function getAuthCookies(credentials: AssistCredentials = {}) {
  return credentials.authAccountToken?.trim()
    ? { auth_account: credentials.authAccountToken.trim() }
    : undefined;
}

/** Builds the bridge path for one chat's messages. */
function getChatMessagesPath(chatId: string) {
  return `${MessagesPath}/${encodeURIComponent(chatId)}/messages`;
}

/** Loads one page of messages from a conversation. */
export function getChatMessages(chatId: string, input: AssistCredentials & AssistPagination = {}): Promise<ApiResponse<AssistMessagesResponseBody>> {
  return runApi<AssistMessagesResponseBody>({
    baseUrl: getBaseUrl('neupid'),
    path: getChatMessagesPath(chatId),
    method: 'GET',
    query: { limit: input.limit ?? 20, offset: input.offset ?? 0 },
    cookies: getAuthCookies(input),
  });
}

/** Sends a user message to a conversation. */
export function sendChatMessage(chatId: string, content: string, credentials: AssistCredentials = {}): Promise<ApiResponse<AssistSendMessageResponseBody>> {
  return runApi<AssistSendMessageResponseBody>({
    baseUrl: getBaseUrl('neupid'),
    path: getChatMessagesPath(chatId),
    method: 'POST',
    body: { content },
    cookies: getAuthCookies(credentials),
  });
}

/** Creates the message methods scoped to a chat identifier. */
export function createAssistChatMessages(chatId: string, credentialsOverride: AssistCredentials = {}) {
  return {
    get(input: AssistPagination = {}) {
      return getChatMessages(chatId, { ...input, ...credentialsOverride });
    },
    send(content: string) {
      return sendChatMessage(chatId, content, credentialsOverride);
    },
  } as const;
}

export type AssistChatMessages = ReturnType<typeof createAssistChatMessages>;
