import is from '@sindresorhus/is/dist'
import React, { createContext, FC, useEffect, useReducer } from 'react'
import { IScheduleSerialized, MSchedule } from '../../models/Schedule'
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

            db.gSchedulesActive.cRef.onSnapshot(snapshot => {
                const schedules = db.schedules._decodeQuerySnapshot(
                    snapshot,
                    MSchedule.serialize,
                )

                setGlobalState({ gSchedules: schedules })
            })
        }
    }, [globalState.schedulesPageAccessed])

    return (
        <Store.Provider value={{ globalState, setGlobalState }}>
            {children}
        </Store.Provider>
    )
}
