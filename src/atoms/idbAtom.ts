'use client'

import { atom } from 'jotai'
import { DBSchema, openDB } from 'idb'
import { rpcEndpointAtom } from './rpcEndpointAtom'

export interface DeezQuestSchema extends DBSchema {
  bin: {
    key: string
    value: ArrayBuffer
  }
}

export const idbAtom = atom(async (get) => {
  const endpoint = get(rpcEndpointAtom)

  return openDB<DeezQuestSchema>(`dq_${endpoint}`, 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      switch (oldVersion) {
        case 0:
        case 1: {
          db.createObjectStore('bin')
        }
      }
    },
  })
})
