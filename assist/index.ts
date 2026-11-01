/*
::neup.documentation::logica-assist-object-api
::title Logica Assist API

Client facade for assistant conversations and messages.

::public

Use `logica.assist.chats.get()` to list conversations,
`logica.assist.chats.create()` to create one, and
`logica.assist.chats.messages(chatId).get()` / `.send(content)` for messages.
The current `auth_account` cookie is sent automatically in browsers; server
callers can provide `authAccountToken`.

::public end

::end
*/

import { createAssistChat, type AssistCredentials } from './chat';

/** Creates the assist facade, optionally overriding the account auth token. */
function createAssist(credentialsOverride: AssistCredentials = {}) {
  return {
    chats: createAssistChat(credentialsOverride),
  } as const;
}

export const assist = Object.assign(
  (credentialsOverride: AssistCredentials = {}) => createAssist(credentialsOverride),
  createAssist(),
);

export type AssistObject = ReturnType<typeof createAssist>;
export { createAssistChat, getChats, createChat } from './chat';
export { createAssistChatMessages, getChatMessages, sendChatMessage } from './chat/messages';
export type { AssistCredentials, AssistPagination, AssistChat, AssistChatResponseBody, AssistChatsResponseBody, AssistPaginationInfo, AssistChatScope } from './chat';
export type { AssistMessage, AssistMessagesResponseBody, AssistSendMessageResponseBody, AssistChatMessages } from './chat/messages';
export default assist;
