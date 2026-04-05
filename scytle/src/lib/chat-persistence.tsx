'use client'

/**
 * Chat Persistence — localStorage cache + Appwrite server sync
 *
 * localStorage is the fast read/write cache.
 * Appwrite is the server of truth — synced on load and after writes.
 *
 * Per project:
 *   - Thread list:  scytle:${projectId}:threads     → StoredThread[]
 *   - Messages:     scytle:${projectId}:msg:${tid}  → StoredMessageRepo
 */

import {
    type FC,
    type PropsWithChildren,
    useMemo,
} from 'react'
import { type AssistantStream, createAssistantStream } from 'assistant-stream'
import { useAui } from '@assistant-ui/store'
import {
    RuntimeAdapterProvider,
} from '@assistant-ui/core/react'
import type { RemoteThreadListAdapter } from '@assistant-ui/react'
import type {
    ThreadHistoryAdapter,
    ExportedMessageRepository,
    ExportedMessageRepositoryItem,
    MessageFormatAdapter,
    MessageFormatItem,
    MessageFormatRepository,
    GenericThreadHistoryAdapter,
    MessageStorageEntry,
} from '@assistant-ui/core'
import { createJWT } from '@/lib/appwrite'

// ── Types ───────────────────────────────────────────────────

type RemoteThreadInitializeResponse = {
    remoteId: string
    externalId: string | undefined
}

type RemoteThreadListResponse = {
    threads: RemoteThreadMetadata[]
}

type RemoteThreadMetadata = {
    readonly status: 'regular' | 'archived'
    readonly remoteId: string
    readonly externalId?: string | undefined
    readonly title?: string | undefined
}

type StoredThread = {
    remoteId: string
    status: 'regular' | 'archived'
    title?: string
}

type StoredMessageEntry = {
    id: string
    parent_id: string | null
    format: string
    content: Record<string, unknown>
}

type StoredMessageRepo = {
    headId?: string | null
    messages: StoredMessageEntry[]
}

// ── localStorage helpers ────────────────────────────────────

function threadsKey(projectId: string) {
    return `scytle:${projectId}:threads`
}

function messagesKey(projectId: string, threadId: string) {
    return `scytle:${projectId}:msg:${threadId}`
}

function loadThreads(projectId: string): StoredThread[] {
    try {
        const raw = localStorage.getItem(threadsKey(projectId))
        return raw ? (JSON.parse(raw) as StoredThread[]) : []
    } catch {
        return []
    }
}

function saveThreads(projectId: string, threads: StoredThread[]) {
    localStorage.setItem(threadsKey(projectId), JSON.stringify(threads))
}

function loadMessages(projectId: string, threadId: string): StoredMessageRepo {
    try {
        const raw = localStorage.getItem(messagesKey(projectId, threadId))
        return raw ? (JSON.parse(raw) as StoredMessageRepo) : { messages: [] }
    } catch {
        return { messages: [] }
    }
}

function saveMessages(projectId: string, threadId: string, repo: StoredMessageRepo) {
    localStorage.setItem(messagesKey(projectId, threadId), JSON.stringify(repo))
}

// ── Server sync (Appwrite) ──────────────────────────────────

/** Debounce timer per project */
const _syncTimers = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Collect all localStorage data for a project and save to server.
 * Debounced to avoid excessive API calls during rapid writes.
 */
function scheduleSyncToServer(projectId: string) {
    const existing = _syncTimers.get(projectId)
    if (existing) clearTimeout(existing)

    _syncTimers.set(projectId, setTimeout(() => {
        _syncTimers.delete(projectId)
        syncToServer(projectId)
    }, 2000))
}

async function syncToServer(projectId: string) {
    try {
        const jwt = await createJWT()
        if (!jwt) return

        const threads = loadThreads(projectId)
        const messages: Record<string, StoredMessageRepo> = {}

        for (const thread of threads) {
            const repo = loadMessages(projectId, thread.remoteId)
            if (repo.messages.length > 0) {
                messages[thread.remoteId] = repo
            }
        }

        await fetch(`/api/projects/${projectId}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt.jwt}`,
            },
            body: JSON.stringify({ threads, messages }),
        })
    } catch (e) {
        console.warn('Failed to sync chat to server:', e)
    }
}

/**
 * Load data from server and populate localStorage (if server has newer data).
 * Called once on adapter creation.
 */
async function syncFromServer(projectId: string): Promise<void> {
    try {
        const jwt = await createJWT()
        if (!jwt) return

        const res = await fetch(`/api/projects/${projectId}/chat`, {
            headers: { 'Authorization': `Bearer ${jwt.jwt}` },
        })
        if (!res.ok) return

        const data = await res.json()
        const serverThreads: StoredThread[] = data.threads ?? []
        const serverMessages: Record<string, StoredMessageRepo> = data.messages ?? {}

        if (serverThreads.length === 0) return

        // Merge: server threads that don't exist locally get added
        const localThreads = loadThreads(projectId)
        const localIds = new Set(localThreads.map((t) => t.remoteId))
        let merged = [...localThreads]

        for (const st of serverThreads) {
            if (!localIds.has(st.remoteId)) {
                merged.push(st)
            } else {
                // Update title from server if local doesn't have one
                const local = merged.find((t) => t.remoteId === st.remoteId)
                if (local && !local.title && st.title) {
                    local.title = st.title
                }
            }
        }

        saveThreads(projectId, merged)

        // Merge messages: server messages for threads with empty local get written
        for (const [threadId, serverRepo] of Object.entries(serverMessages)) {
            const localRepo = loadMessages(projectId, threadId)
            if (localRepo.messages.length === 0 && serverRepo.messages.length > 0) {
                saveMessages(projectId, threadId, serverRepo)
            }
        }
    } catch (e) {
        console.warn('Failed to load chat from server:', e)
    }
}

// ── History adapter (per-thread message load/save) ──────────

class LocalStorageHistoryAdapter implements ThreadHistoryAdapter {
    constructor(
        private projectId: string,
        private aui: ReturnType<typeof useAui>,
    ) {}

    private _getRemoteId(): string | undefined {
        return this.aui.threadListItem().getState().remoteId
    }

    private async _getOrInitRemoteId(): Promise<string> {
        const { remoteId } = await this.aui.threadListItem().initialize()
        return remoteId
    }

    async load(): Promise<ExportedMessageRepository & { unstable_resume?: boolean }> {
        return { messages: [] }
    }

    async append(_item: ExportedMessageRepositoryItem): Promise<void> {}

    withFormat<TMessage, TStorageFormat extends Record<string, unknown>>(
        formatAdapter: MessageFormatAdapter<TMessage, TStorageFormat>,
    ): GenericThreadHistoryAdapter<TMessage> {
        const self = this

        return {
            async load(): Promise<MessageFormatRepository<TMessage>> {
                const remoteId = self._getRemoteId()
                if (!remoteId) return { messages: [] }

                try {
                    const stored = loadMessages(self.projectId, remoteId)
                    if (stored.messages.length === 0) return { messages: [] }

                    return {
                        headId: stored.headId,
                        messages: stored.messages
                            .filter((entry) => entry.format === formatAdapter.format)
                            .map((entry) =>
                                formatAdapter.decode(entry as MessageStorageEntry<TStorageFormat>),
                            ),
                    }
                } catch (e) {
                    console.error('Failed to load chat history:', e)
                    return { messages: [] }
                }
            },

            async append(item: MessageFormatItem<TMessage>): Promise<void> {
                const remoteId = await self._getOrInitRemoteId()

                const stored = loadMessages(self.projectId, remoteId)
                const id = formatAdapter.getId(item.message)
                const encoded = formatAdapter.encode(item)
                const entry: StoredMessageEntry = {
                    id,
                    parent_id: item.parentId,
                    format: formatAdapter.format,
                    content: encoded as Record<string, unknown>,
                }

                const idx = stored.messages.findIndex((m) => m.id === id)
                if (idx >= 0) {
                    stored.messages[idx] = entry
                } else {
                    stored.messages.push(entry)
                }
                stored.headId = id

                saveMessages(self.projectId, remoteId, stored)
                scheduleSyncToServer(self.projectId)
            },

            async update(item: MessageFormatItem<TMessage>, localMessageId: string): Promise<void> {
                const remoteId = self._getRemoteId()
                if (!remoteId) return

                const stored = loadMessages(self.projectId, remoteId)
                const id = formatAdapter.getId(item.message)
                const encoded = formatAdapter.encode(item)
                const entry: StoredMessageEntry = {
                    id,
                    parent_id: item.parentId,
                    format: formatAdapter.format,
                    content: encoded as Record<string, unknown>,
                }

                let idx = stored.messages.findIndex((m) => m.id === id)
                if (idx < 0) {
                    idx = stored.messages.findIndex((m) => m.id === localMessageId)
                }
                if (idx >= 0) {
                    stored.messages[idx] = entry
                    saveMessages(self.projectId, remoteId, stored)
                    scheduleSyncToServer(self.projectId)
                }
            },
        }
    }
}

// ── Provider component for history adapter ──────────────────

function createHistoryProvider(projectId: string): FC<PropsWithChildren> {
    const Provider: FC<PropsWithChildren> = ({ children }) => {
        const aui = useAui()
        const history = useMemo(
            () => new LocalStorageHistoryAdapter(projectId, aui),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [projectId],
        )
        const adapters = useMemo(() => ({ history }), [history])

        return (
            <RuntimeAdapterProvider adapters={adapters}>
                {children}
            </RuntimeAdapterProvider>
        )
    }
    Provider.displayName = 'ChatHistoryProvider'
    return Provider
}

// ── Title generation helper ─────────────────────────────────

function extractTitleFromMessages(
    messages: readonly { content: readonly { type: string; text?: string }[] }[],
): string {
    for (const msg of messages) {
        for (const part of msg.content) {
            if (part.type === 'text' && part.text) {
                const text = part.text.trim()
                if (text.length <= 60) return text
                return text.substring(0, 57) + '...'
            }
        }
    }
    return 'New Chat'
}

// ── Main adapter factory ────────────────────────────────────

export function createProjectThreadAdapter(
    projectId: string,
): RemoteThreadListAdapter {
    // Fire-and-forget: pull server data into localStorage on creation
    syncFromServer(projectId)

    return {
        unstable_Provider: createHistoryProvider(projectId),

        async list(): Promise<RemoteThreadListResponse> {
            const threads = loadThreads(projectId)
            return {
                threads: threads.map((t) => ({
                    remoteId: t.remoteId,
                    status: t.status,
                    title: t.title,
                })),
            }
        },

        async initialize(threadId: string): Promise<RemoteThreadInitializeResponse> {
            const threads = loadThreads(projectId)
            if (!threads.some((t) => t.remoteId === threadId)) {
                threads.unshift({ remoteId: threadId, status: 'regular' })
                saveThreads(projectId, threads)
                scheduleSyncToServer(projectId)
            }
            return { remoteId: threadId, externalId: undefined }
        },

        async rename(remoteId: string, newTitle: string): Promise<void> {
            const threads = loadThreads(projectId)
            const thread = threads.find((t) => t.remoteId === remoteId)
            if (thread) {
                thread.title = newTitle
                saveThreads(projectId, threads)
                scheduleSyncToServer(projectId)
            }
        },

        async archive(remoteId: string): Promise<void> {
            const threads = loadThreads(projectId)
            const thread = threads.find((t) => t.remoteId === remoteId)
            if (thread) {
                thread.status = 'archived'
                saveThreads(projectId, threads)
                scheduleSyncToServer(projectId)
            }
        },

        async unarchive(remoteId: string): Promise<void> {
            const threads = loadThreads(projectId)
            const thread = threads.find((t) => t.remoteId === remoteId)
            if (thread) {
                thread.status = 'regular'
                saveThreads(projectId, threads)
                scheduleSyncToServer(projectId)
            }
        },

        async delete(remoteId: string): Promise<void> {
            const threads = loadThreads(projectId)
            const filtered = threads.filter((t) => t.remoteId !== remoteId)
            saveThreads(projectId, filtered)
            localStorage.removeItem(messagesKey(projectId, remoteId))
            scheduleSyncToServer(projectId)
        },

        async fetch(threadId: string): Promise<RemoteThreadMetadata> {
            const threads = loadThreads(projectId)
            const thread = threads.find((t) => t.remoteId === threadId)
            if (!thread) throw new Error('Thread not found')
            return {
                remoteId: thread.remoteId,
                status: thread.status,
                title: thread.title,
            }
        },

        async generateTitle(
            remoteId: string,
            messages: readonly { content: readonly { type: string; text?: string }[] }[],
        ): Promise<AssistantStream> {
            const title = extractTitleFromMessages(messages)

            const threads = loadThreads(projectId)
            const thread = threads.find((t) => t.remoteId === remoteId)
            if (thread) {
                thread.title = title
                saveThreads(projectId, threads)
                scheduleSyncToServer(projectId)
            }

            return createAssistantStream((controller) => {
                controller.appendText(title)
            })
        },
    }
}
