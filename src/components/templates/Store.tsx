import is from '@sindresorhus/is/dist'
import dayjs from 'dayjs'
import React, { createContext, FC, useEffect, useReducer } from 'react'
import { IRetweetLogSerialized, MRetweetLog } from '../../models/RetweetLog'
import {
    filterByTimestamp,
    filterSchedulesAfterNow,
    IScheduleSerialized,
    MSchedule,
} from '../../models/Schedule'
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
    retweetLogsListening: false,
    retweetLogs: {
        array: undefined as IRetweetLogSerialized[] | undefined,
        map: undefined as Map<string, IRetweetLogSerialized> | undefined,
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

            const query = filterSchedulesAfterNow()(
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
        if (
            globalState.topicsPageAccessed &&
            !globalState.retweetLogsListening
        ) {
            setGlobalState({ retweetLogsListening: true })

            const query = filterByTimestamp(
                '_createdAt',
                dayjs().subtract(2, 'week'),
            )(db.retweetLogs.collectionRef)

            return query.onSnapshot(snapshot => {
                const retweetLogs = db.retweetLogs._decodeQuerySnapshot(
                    query,
                    snapshot,
                    MRetweetLog.serialize,
                )

                setGlobalState({ retweetLogs })
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
