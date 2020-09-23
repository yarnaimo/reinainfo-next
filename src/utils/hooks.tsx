import is from '@sindresorhus/is'
import { useRouter } from 'next/router'
import React, {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useList } from 'react-use'
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from 'rmwc'
import { useMedia } from 'use-media'
import { responsive } from './css'
import { micon } from './icon'

export const useResponsive = () => {
  const isMobile = useMedia(responsive.isMobile)
  const isNarrow = useMedia(responsive.isNarrow)

  const appbarHeight = isMobile ? 68 : 72

  return { isMobile, isNarrow, appbarHeight }
}

export const useArray = <T extends any>(initialList?: T[]) => {
  const [value, actions] = useList(initialList)
  return { value, ...actions }
}

export const useQueryParam = (key: string) => {
  const router = useRouter()
  const value = router.query[key] || ''

  const set = (newValue: string | string[]) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, [key]: newValue },
      },
      undefined,
      { shallow: true },
    )
  }

  return { value, set }
}

export const useQueryParams = <
  T extends { [key: string]: string | string[] | undefined }
>(
  defaultParams: T,
) => {
  const router = useRouter()
  const params = { ...defaultParams, ...(router.query as Partial<T>) }

  const setParams = (newValues: Partial<T>) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, ...newValues },
      },
      undefined,
      { shallow: true },
    )
  }

  return { router, params, setParams }
}

export type UseBool = ReturnType<typeof useBool>
export const useBool = (initialState: boolean) => {
  const [state, setState] = useState(initialState)
  return useMemo(
    () => ({
      state,
      on: () => setState(true),
      off: () => setState(false),
      toggle: () => setState(!state),
    }),
    [state, setState],
  )
}

export const useFormValue = <S extends string>(
  initialState: S,
  trim = true,
) => {
  const [value, _setValue] = useState<S>(initialState)
  const setValue = (value: S) => _setValue(trim ? (value.trim() as S) : value)
  return {
    value,
    setValue,
    set: ({ currentTarget: { value } }: FormEvent<any>) => setValue(value),
  }
}

export const OmitProperty = Symbol('omit')

export const mapObject = <S extends { [s: string]: any }>(sourceObj: S) => {
  return <T extends { [_ in keyof S]?: any }>(
    fn: (key: keyof S, value: S[string]) => T[string] | typeof OmitProperty,
  ) => {
    return Object.entries(sourceObj).reduce((newObj, [key, value]) => {
      const newValue = fn(key, value)

      return newValue === OmitProperty ? newObj : { ...newObj, [key]: newValue }
    }, {} as T)
  }
}

// type CFormData = {
//     [key: string]: string | string[] | number | boolean | null
// }

type CFormValue = string | string[] | number | boolean

type CFormValueSchema<T extends CFormValue, R extends boolean> = {
  // __T__: T
  emptyValue: T
  required: R
}

type CFormSchema = { [key: string]: CFormValueSchema<any, any> }

type CFormData<S extends CFormSchema> = {
  [K in keyof S]: S[K]['required'] extends true
    ? S[K]['emptyValue']
    : S[K]['emptyValue'] | null
}

export const Field = <T extends CFormValue>(
  emptyValue: T,
): CFormValueSchema<T, true> => ({
  // __T__: {} as T,
  emptyValue,
  required: true,
})

export const OptField = <T extends CFormValue>(
  emptyValue: T,
): CFormValueSchema<T, false> => ({
  // __T__: {} as T,
  emptyValue,
  required: false,
})

const isTrimmed = Symbol('isTrimmed')

const attrNameMap = { text: 'value', bool: 'checked' } as const
type AttrNameMap = typeof attrNameMap
type AttrType<T> = { text: { value: T }; bool: { checked: T } }

// type AttrObject = { [attrName: string]: unknown }

export type UseForm<
  S extends CFormSchema,
  D extends CFormData<S> = CFormData<S>,
  E = D
> = {
  data: D
  setLoadedData: (data: D) => void
  field: <K extends keyof S, A extends keyof AttrNameMap>(
    key: K,
    type: A,
  ) => AttrType<S[K]['emptyValue']>[A] & {
    onChange: (event: FormEvent<any>) => void
    required: boolean
  }
  readonly: <K extends keyof S, A extends keyof AttrNameMap>(
    key: K,
    type: A,
  ) => AttrType<S[K]['emptyValue']>[A] & { disabled: true }
  trimData: () => Promise<D>
  encode: (data: D) => E
  // init: () => void
  // get: <K extends keyof T>(key: K) => T[K]
  // set: <K extends keyof T>(key: K) => (event: FormEvent<any>) => void
  // setValue: <K extends keyof T>(key: K, value: T[K]) => void
}

export const useForm = <
  S extends CFormSchema,
  // T extends CFormData,
  D extends CFormData<S> = CFormData<S>,
  E = D
>(
  schema: S,
  encoder: (data: D) => E = (data) => (data as any) as E,
  // loadedData: D | undefined,
): UseForm<S, D, E> => {
  const isRequired = useCallback(
    (key: keyof D) => schema[key as keyof S].required,
    [schema],
  )

  const decodeData = useCallback(
    (newData: D) => {
      return mapObject(schema)<D>((key) => {
        const value = newData[key as keyof D]
        return is.null_(value) ? ('' as D[string]) : value!
      })
    },
    [schema],
  )

  // const initialData = useMemo(
  //     () => (loadedData ? decodeData(loadedData) : emptyData),
  //     [emptyData, loadedData],
  // )

  const [data, __setData] = useState(() =>
    mapObject(schema)<D>((key, value) => value.emptyValue),
  )

  const setData = useCallback(
    (data: D) => {
      delete data[isTrimmed as any]
      __setData(data)
    },
    [__setData],
  )

  const setLoadedData = useCallback((data: D) => setData(decodeData(data)), [
    setData,
    decodeData,
  ])

  const get = useCallback(<K extends keyof D>(key: K) => data[key], [data])

  // const setValue = <K extends keyof D>(key: K, value: D[K]) =>
  //     setData({ ...data, [key]: value })

  const set = useCallback(
    <K extends keyof D>(key: K) => ({
      currentTarget: { value },
    }: FormEvent<any>) => setData({ ...data, [key]: value }),
    [data, setData],
  )

  const field = useCallback(
    <K extends keyof S, A extends keyof AttrNameMap>(key: K, type: A) => {
      const attrName = attrNameMap[type]

      return {
        [attrName]: get(key),

        onChange: ({ currentTarget }: FormEvent<any>) =>
          setData({ ...data, [key]: currentTarget[attrName] }),

        required: type === 'text' && isRequired(key),
      } as any
    },
    [get, set, isRequired],
  )

  const readonly = useCallback(
    <K extends keyof S, A extends keyof AttrNameMap>(key: K, type: A) => {
      const attrName = attrNameMap[type]

      return {
        [attrName]: get(key),

        disabled: true,
      } as any
    },
    [get],
  )

  const onTrimmed = useRef((data: D) => {})

  const trimData = useCallback(() => {
    __setData({
      [isTrimmed]: true,

      ...mapObject(data)<D>((key, value) =>
        is.string(value) ? value.trim() : value,
      ),
    })

    return new Promise<D>((resolve) => {
      onTrimmed.current = resolve
    })
  }, [data, __setData])

  useEffect(() => {
    if (data[isTrimmed as any]) {
      onTrimmed.current(data)
      onTrimmed.current = () => {}
    }
  }, [data])

  const encode = useCallback(
    (data: D) => {
      const nData = mapObject(data)<D>((key, value) =>
        is.emptyString(value) ? null! : value,
      )

      return encoder(nData)
    },
    [data, encoder],
  )

  return {
    data,
    setLoadedData,
    field,
    readonly,
    trimData,
    encode,
  }
}

export const useFormRef = () => {
  const ref = useRef<HTMLFormElement>(null)
  const validate = () => ref.current?.checkValidity()

  return { ref, validate }
}

export const useFormDialog = <
  S extends CFormSchema,
  // T extends CFormData,
  D extends CFormData<S> = CFormData<S>,
  E = D
>(
  titleBase: string,
  schema: S,
  encoder: ((data: D) => E) | undefined,
  bodyRenderer: (
    form: UseForm<S, D, E>,
    encodeData: () => Promise<E | null>,
  ) => ReactNode,
) => {
  const [title, setTitle] = useState('')
  const dialog = useBool(false)
  const form = useForm(schema, encoder)
  const formRef = useFormRef()
  const onClose = useRef((data: E | null) => {})
  const isSaving = useBool(false)

  const encodeData = async () => {
    const data = await form.trimData()
    console.log(data)

    if (formRef.validate()) {
      const encoded = form.encode(data)
      console.log(encoded)
      return encoded
    }
    return null
  }

  const rendered = (
    <Dialog open={dialog.state}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <form ref={formRef.ref}>{bodyRenderer(form, encodeData)}</form>
      </DialogContent>

      <DialogActions>
        <DialogButton
          action="cancel"
          onClick={() => {
            dialog.off()
            onClose.current(null)
          }}
        >
          キャンセル
        </DialogButton>

        <DialogButton
          action="accept"
          unelevated
          disabled={isSaving.state}
          icon={
            isSaving.state ? (
              <CircularProgress></CircularProgress>
            ) : (
              micon('check')
            )
          }
          onClick={() => {
            encodeData().then((encoded) => {
              if (encoded) {
                dialog.off()
                onClose.current(encoded)
              }
            })
            // form.trimData().then(data => {
            //     console.log(data)

            //     if (formRef.validate()) {
            //         dialog.off()

            //         const encoded = form.encode(data)
            //         console.log(encoded)
            //         onClose.current(encoded)
            //     }
            // })
          }}
        >
          保存
        </DialogButton>
      </DialogActions>
    </Dialog>
  )

  const prompt = ({ titleSuffix, data }: { titleSuffix: string; data?: D }) => {
    setTitle(titleBase + titleSuffix)
    form.setLoadedData(
      data || mapObject(schema)<D>((key, value) => value.emptyValue),
    )
    dialog.on()

    return new Promise<E | null>((resolve) => {
      onClose.current = resolve
    })
  }

  const buttonLabel = (suffix: string) => titleBase + suffix

  return { rendered, prompt, buttonLabel, encodeData }
}
