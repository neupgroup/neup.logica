/*
::neup.documentation::logica-assist-chat-api
::title Logica Assist Chat API

Client helpers for listing and creating conversations.

::public

Use `logica.assist.chats.get()` to list chats and `.create()` to start a new
conversation. Use `.messages(chatId)` for message operations.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import { createAssistChatMessages, type AssistCredentials, type AssistPagination, type AssistChatMessages } from './messages';
export type { AssistCredentials, AssistPagination } from './messages';

const ChatsPath = 'bridge/api.v1/chats';

export type AssistChat = { id: string; title: string; lastUpdated?: string };
export type AssistPaginationInfo = { limit: number; offset: number; total: number; hasMore: boolean };
export type AssistChatsResponseBody = { chats: AssistChat[]; pagination: AssistPaginationInfo; error?: string };
export type AssistChatResponseBody = { id: string; title: string; error?: string };

/** Builds the auth cookie map when the caller supplied an account token. */
function getAuthCookies(credentials: AssistCredentials = {}) {
  return credentials.authAccountToken?.trim()
    ? { auth_account: credentials.authAccountToken.trim() }
    : undefined;
}

/** Lists a page of conversations. */
export function getChats(input: AssistCredentials & AssistPagination = {}): Promise<ApiResponse<AssistChatsResponseBody>> {
  return runApi<AssistChatsResponseBody>({
    baseUrl: getBaseUrl('neupid'),
    path: ChatsPath,
    method: 'GET',
    query: { limit: input.limit ?? 10, offset: input.offset ?? 0 },
    cookies: getAuthCookies(input),
  });
}

/** Creates a conversation with an optional title. */
export function createChat(input: AssistCredentials & { title?: string } = {}): Promise<ApiResponse<AssistChatResponseBody>> {
  return runApi<AssistChatResponseBody>({
    baseUrl: getBaseUrl('neupid'),
    path: ChatsPath,
    method: 'POST',
    body: input.title === undefined ? {} : { title: input.title },
    cookies: getAuthCookies(input),
  });
}

/** Creates the chat API scope with an optional account-token override. */
export function createAssistChat(credentialsOverride: AssistCredentials = {}) {
  return {
    get(input: AssistPagination = {}) {
      return getChats({ ...input, ...credentialsOverride });
    },
    create(input: { title?: string } = {}) {
      return createChat({ ...input, ...credentialsOverride });
    },
    messages(chatId: string): AssistChatMessages {
      return createAssistChatMessages(chatId, credentialsOverride);
    },
  } as const;
}

export type AssistChatScope = ReturnType<typeof createAssistChat>;
