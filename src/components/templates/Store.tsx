import is from '@sindresorhus/is/dist'
import React, { createContext, FC, useEffect, useReducer } from 'react'
import { IScheduleSerialized, MSchedule } from '../../models/Schedule'
import { ITopicSerialized, MTopic } from '../../models/Topic'
import { db } from '../../services/firebase'

type NewStateAction = Partial<S> | ((prevState: S) => Partial<S>)

type ContextValue = {
    globalState: S
    setGlobalState: (newState: NewStateAction) => void
}

type S = typeof initialState

const initialState = {
    schedulesPageAccessed: false,
    gSchedulesListening: false,
    gSchedules: {
        array: undefined as IScheduleSerialized[] | undefined,
        map: undefined as Map<string, IScheduleSerialized> | undefined,
    },

    topicsPageAccessed: false,
    topicsListening: false,
    topics: {
        array: undefined as ITopicSerialized[] | undefined,
        map: undefined as Map<string, ITopicSerialized> | undefined,
    },
}

export const Store = createContext({} as ContextValue)

export const Provider: FC<{}> = ({ children }) => {
    const [globalState, setGlobalState] = useReducer(
        (prev: S, newState: NewStateAction) => {
            const _newState = is.function_(newState) ? newState(prev) : newState
            return { ...prev, ..._newState }
        },
        initialState,
    )

    useEffect(() => {
        if (
            globalState.schedulesPageAccessed &&
            !globalState.gSchedulesListening
        ) {
            setGlobalState({ gSchedulesListening: true })

            const query = MSchedule.whereSinceNow()(
                db.gSchedulesActive.collectionRef,
            )

            return query.onSnapshot(snapshot => {
                const schedules = db.schedules._decodeQuerySnapshot(
                    query,
                    snapshot,
                    MSchedule.serialize,
                )

                setGlobalState({ gSchedules: schedules })
            })
        }

        return
    }, [globalState.schedulesPageAccessed])

    useEffect(() => {
        if (globalState.topicsPageAccessed && !globalState.topicsListening) {
            setGlobalState({ topicsListening: true })

            const query = MTopic.whereCreatedWithinTwoWeeks()(
                db.topics.collectionRef,
            )

            return query.onSnapshot(snapshot => {
                const topics = db.topics._decodeQuerySnapshot(
                    query,
                    snapshot,
                    MTopic.serialize,
                )

                setGlobalState({ topics })
            })
        }

        return
    }, [globalState.topicsPageAccessed])

    return (
        <Store.Provider value={{ globalState, setGlobalState }}>
            {children}
        </Store.Provider>
    )
}
