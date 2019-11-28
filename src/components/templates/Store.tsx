import { useSCollection } from 'bluespark'
import React, { createContext, FC, useMemo } from 'react'
import { env } from '../../env'
import { IScheduleSerialized, MSchedule } from '../../models/Schedule'
import { ITopicSerialized, MTopic } from '../../models/Topic'
import { db } from '../../services/firebase'
import { useBool } from '../../utils/hooks'

// type NewStateAction = Partial<S> | ((prevState: S) => Partial<S>)

type ContextValue = {
    // globalState: S
    // setGlobalState: (newState: NewStateAction) => void

    listenSchedules: () => void
    schedules: {
        array: IScheduleSerialized[] | undefined
        map: Map<string, IScheduleSerialized> | undefined
    }

    listenTopics: () => void
    topics: {
        array: ITopicSerialized[] | undefined
        map: Map<string, ITopicSerialized> | undefined
    }
}

// type S = typeof initialState

// const initialState = {
// schedulesPageAccessed: false,
// gSchedulesListening: false,
// gSchedules: {
//     array: undefined as IScheduleSerialized[] | undefined,
//     map: undefined as Map<string, IScheduleSerialized> | undefined,
// },

// topicsPageAccessed: false,
// topicsListening: false,
// topics: {
//     array: undefined as ITopicSerialized[] | undefined,
//     map: undefined as Map<string, ITopicSerialized> | undefined,
// },
// }

export const Store = createContext({} as ContextValue)

export const Provider: FC<{}> = ({ children }) => {
    // const [globalState, setGlobalState] = useReducer(
    //     (prev: S, newState: NewStateAction) => {
    //         const _newState = is.function_(newState) ? newState(prev) : newState
    //         return { ...prev, ..._newState }
    //     },
    //     initialState,
    // )

    const schedulesListening = useBool(false)

    const scheduleQuery = useMemo(() => MSchedule.whereSinceNow(), [])
    const schedules = useSCollection({
        model: db.gSchedulesActive,
        q: scheduleQuery,
        decoder: MSchedule.serialize,
        listen: env.isBrowser && schedulesListening.state,
    })

    //

    const topicsListening = useBool(false)

    const topicQuery = useMemo(() => MTopic.whereCreatedWithinTwoWeeks(), [])
    const topics = useSCollection({
        model: db.topics,
        q: topicQuery,
        decoder: MTopic.serialize,
        listen: env.isBrowser && topicsListening.state,
    })

    return (
        <Store.Provider
            value={{
                listenSchedules: schedulesListening.on,
                schedules,

                listenTopics: topicsListening.on,
                topics,
            }}
        >
            {children}
        </Store.Provider>
    )
}
