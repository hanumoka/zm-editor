'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

// Y.js types (optional peer dependency)
// Users need to install: yjs, @tiptap/extension-collaboration, @tiptap/extension-collaboration-cursor
interface YDoc {
  destroy: () => void;
}

interface WebsocketProvider {
  destroy: () => void;
  awareness: Awareness;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface Awareness {
  setLocalStateField: (field: string, value: unknown) => void;
  getLocalState: () => Record<string, unknown> | null;
  getStates: () => Map<number, Record<string, unknown>>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}

export interface CollaborationUser {
  name: string;
  color: string;
  avatar?: string;
}

export interface CollaborationConfig {
  /** 문서 이름 (고유 식별자) */
  documentName: string;
  /** WebSocket 서버 URL */
  websocketUrl: string;
  /** 현재 사용자 정보 */
  user: CollaborationUser;
  /** 연결 시 콜백 */
  onConnect?: () => void;
  /** 연결 해제 시 콜백 */
  onDisconnect?: () => void;
  /** 다른 사용자 상태 변경 시 콜백 */
  onAwarenessChange?: (users: CollaborationUser[]) => void;
}

interface CollaborationContextValue {
  /** Y.js 문서 */
  ydoc: YDoc | null;
  /** WebSocket 제공자 */
  provider: WebsocketProvider | null;
  /** 연결 상태 */
  isConnected: boolean;
  /** 접속 중인 사용자 목록 */
  connectedUsers: CollaborationUser[];
  /** 현재 사용자 */
  currentUser: CollaborationUser | null;
}

const CollaborationContext = createContext<CollaborationContextValue>({
  ydoc: null,
  provider: null,
  isConnected: false,
  connectedUsers: [],
  currentUser: null,
});

export function useCollaboration() {
  return useContext(CollaborationContext);
}

export interface CollaborationProviderProps {
  config: CollaborationConfig;
  children: ReactNode;
}

/**
 * CollaborationProvider - Y.js 기반 실시간 협업 제공자
 *
 * 이 컴포넌트를 사용하려면 다음 패키지를 설치해야 합니다:
 * - yjs
 * - y-websocket
 * - @tiptap/extension-collaboration
 * - @tiptap/extension-collaboration-cursor
 *
 * @example
 * ```tsx
 * import { CollaborationProvider, ZmEditor } from '@zm-editor/react';
 * import { Collaboration } from '@tiptap/extension-collaboration';
 * import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
 * import * as Y from 'yjs';
 *
 * function App() {
 *   return (
 *     <CollaborationProvider
 *       config={{
 *         documentName: 'my-document',
 *         websocketUrl: 'wss://your-server.com',
 *         user: { name: 'John', color: '#3b82f6' },
 *       }}
 *     >
 *       <ZmEditor
 *         extensions={[
 *           Collaboration.configure({ document: ydoc }),
 *           CollaborationCursor.configure({ provider, user }),
 *         ]}
 *       />
 *     </CollaborationProvider>
 *   );
 * }
 * ```
 */
export function CollaborationProvider({
  config,
  children,
}: CollaborationProviderProps) {
  const [ydoc, setYdoc] = useState<YDoc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);

  // 콜백과 사용자 정보를 ref로 저장하여 useEffect 재실행 방지
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    let doc: YDoc | null = null;
    let wsProvider: WebsocketProvider | null = null;
    let mounted = true;

    const initCollaboration = async () => {
      try {
        // Dynamic import to make yjs and y-websocket optional
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Y = await (Function('return import("yjs")')() as Promise<any>);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const yWebsocket = await (Function('return import("y-websocket")')() as Promise<any>);
        const WsProvider = yWebsocket.WebsocketProvider;

        if (!mounted) return;

        doc = new Y.Doc();
        wsProvider = new WsProvider(
          configRef.current.websocketUrl,
          configRef.current.documentName,
          doc
        ) as unknown as WebsocketProvider;

        // 사용자 정보 설정
        wsProvider.awareness.setLocalStateField('user', configRef.current.user);

        // 연결 상태 이벤트
        wsProvider.on('status', (event: unknown) => {
          if (!mounted) return;
          const statusEvent = event as { status: string };
          const connected = statusEvent.status === 'connected';
          setIsConnected(connected);
          if (connected) {
            configRef.current.onConnect?.();
          } else {
            configRef.current.onDisconnect?.();
          }
        });

        // 다른 사용자 상태 변경 이벤트
        wsProvider.awareness.on('change', () => {
          if (!mounted) return;
          const states = wsProvider!.awareness.getStates();
          const users: CollaborationUser[] = [];

          states.forEach((state) => {
            if (state.user) {
              users.push(state.user as CollaborationUser);
            }
          });

          setConnectedUsers(users);
          configRef.current.onAwarenessChange?.(users);
        });

        if (mounted) {
          setYdoc(doc);
          setProvider(wsProvider);
        }
      } catch (error) {
        console.warn(
          '[CollaborationProvider] Failed to initialize collaboration.',
          'Make sure yjs and y-websocket are installed.',
          error
        );
      }
    };

    initCollaboration();

    return () => {
      mounted = false;
      wsProvider?.destroy();
      doc?.destroy();
    };
  }, [config.documentName, config.websocketUrl]);

  const value = useMemo<CollaborationContextValue>(
    () => ({
      ydoc,
      provider,
      isConnected,
      connectedUsers,
      currentUser: config.user,
    }),
    [ydoc, provider, isConnected, connectedUsers, config.user]
  );

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

/**
 * 협업 커서 색상 팔레트
 */
export const COLLABORATION_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
];

/**
 * 랜덤 협업 색상 생성
 */
export function getRandomCollaborationColor(): string {
  return COLLABORATION_COLORS[
    Math.floor(Math.random() * COLLABORATION_COLORS.length)
  ];
}

export default CollaborationProvider;
