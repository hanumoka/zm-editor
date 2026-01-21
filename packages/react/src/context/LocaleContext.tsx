'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ZmEditorLocale } from '../locales';
import { enLocale } from '../locales';

/**
 * NodeView 컴포넌트를 위한 locale context
 * Editor 내부의 NodeView에서 locale 접근 가능하게 함
 */
const LocaleContext = createContext<ZmEditorLocale>(enLocale);

/**
 * Locale Provider props
 */
interface LocaleProviderProps {
  locale: ZmEditorLocale;
  children: ReactNode;
}

/**
 * NodeView에서 locale을 사용하기 위한 Provider
 */
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * NodeView 컴포넌트에서 locale 접근을 위한 hook
 */
export function useLocale(): ZmEditorLocale {
  return useContext(LocaleContext);
}

export { LocaleContext };
