import { InterpolationWithTheme } from '@emotion/core'
import is from '@sindresorhus/is'
import { Blue } from 'bluespark'
import React, { FC, MutableRefObject, ReactNode, useRef, useState } from 'react'
import useForm from 'react-hook-form'
import { ElementLike } from 'react-hook-form/dist/types'
import {
  Button,
  ButtonProps,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from 'rmwc'
import { firestore } from '../../services/firebase'
import { useBool, UseBool } from '../../utils/hooks'
import { bool } from '../../utils/html'
import { micon } from '../../utils/icon'

type TypeMap = {
  toggle: boolean
  required: string
  optional: string | null
}

type ToggleType = {
  type: 'toggle'
  initial: TypeMap['toggle']
  label: string
  pattern?: never
} & GetConverters<never, never, never>

type GetConverters<D, E, T> = D | E extends T
  ? { decode?: never; encode?: never }
  : { decode: (value: D) => T; encode: (value: T) => E }

type RequiredType<D, E> = {
  type: 'required'
  initial: TypeMap['required']
  label: string
  pattern?: string
} & GetConverters<D, E, TypeMap['required']>

type OptionalType<D, E> = {
  type: 'optional'
  initial: TypeMap['optional']
  label: string
  pattern?: string
} & GetConverters<D, E, TypeMap['optional']>

type FieldType<D, E> = ToggleType | RequiredType<D, E> | OptionalType<D, E>

//

type SchemaBody<D extends object, E extends object> = {
  [K in keyof (D | E)]: FieldType<D[K], E[K]>
}

type SchemaOptions<
  S extends SchemaBody<D, E>,
  D extends object,
  E extends object,
  OP extends any
> = {
  schema: S
  _D: D
  _E: E
  _F: GetFormValuesType<S, D, E>
  _OP: OP
  // _K: keyof S
}

type SK<S extends SchemaBody<any, any>> = keyof S & string

export const Schema = <
  D extends object,
  E extends object,
  OP extends any = any
>() => <S extends SchemaBody<D, E>>(schema: S) =>
  ({ schema } as SchemaOptions<S, D, E, OP>)

export type GetFormValuesType<
  S extends SchemaBody<D, E>,
  D extends object,
  E extends object
> = {
  [K in SK<S>]: TypeMap[S[K]['type']]
}

//

export type FieldFn<S extends SchemaBody<object, object>> = (
  key: SK<S>,
  noRegister?: boolean,
) => {
  name: string
  label: string
  inputRef: ((ref: ElementLike | null) => void) | undefined
  required: boolean
  pattern: string | undefined
}

type RegisterFn = ReturnType<typeof useForm>['register']

type HandleSubmitFn<E> = (
  callback: (s: E) => void | Promise<void>,
) => (e: React.BaseSyntheticEvent<object, any, any>) => void

export type Renderer<SO extends SchemaOptions<any, any, any, any>> = FC<{
  field: FieldFn<SO['schema']>
  formRef: MutableRefObject<HTMLFormElement | null>
  setValue: <K extends keyof SO['_F'] & string>(
    key: K,
    value: SO['_F'][K],
  ) => void
  register: RegisterFn
  handleSubmit: HandleSubmitFn<SO['_E']>
  _ref?: Blue.DocRef
  optionalData?: SO['_OP']
  setOptionalData: (data: SO['_OP']) => void
}>

//

type FDialogProps = {
  dialogState: UseBool
  title: string
  styles?: InterpolationWithTheme<any>
  savingState: UseBool
  onAccept: () => void
}

const FDialog: FC<FDialogProps> = ({
  dialogState,
  title,
  styles,
  savingState,
  onAccept,
  children,
}) => (
  <Dialog open={dialogState.state} css={styles}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{children}</DialogContent>
    <DialogActions>
      <DialogButton label="キャンセル" onClick={dialogState.off}></DialogButton>

      <DialogButton
        unelevated
        label="保存"
        disabled={savingState.state}
        icon={
          savingState.state ? (
            <CircularProgress></CircularProgress>
          ) : (
            micon('check')
          )
        }
        onClick={onAccept}
      ></DialogButton>
    </DialogActions>
  </Dialog>
)

export const createUseTypedForm = <
  SO extends SchemaOptions<SchemaBody<_D, _E>, _D, _E, _OP>,
  _D extends object = any,
  _E extends object = any,
  _OP extends any = any
>({
  name,
  schemaOptions,
  dialogTitle,
  dialogStyles,
  renderer: Renderer,
}: {
  name: string
  schemaOptions: SO
  dialogTitle: { create: string; update: string }
  dialogStyles?: InterpolationWithTheme<any>
  renderer: Renderer<SO>
}) => {
  type S = SO['schema']
  type D = SO['_D']
  type E = SO['_E']
  type OP = SO['_OP']
  type FormValues = SO['_F']
  const schema = schemaOptions.schema as S

  type Action = 'create' | 'update'
  type DocCallbackFn = (_ref: Blue.DocRef, data: E) => any | Promise<any>
  type CallbackFn = (data: E, optionalData: OP) => any | Promise<any>

  const log = (type: string, data: any) =>
    console.log(`[${name} form] ${type}`, data)

  const initialValues = Object.entries(schema).reduce(
    (pre, [key, value]) => ({
      ...pre,
      [key]: (value as S[SK<S>]).initial,
    }),
    {} as FormValues,
  )

  const trim = (data: FormValues) =>
    Object.entries(data).reduce(
      (pre, [key, value]) => ({
        ...pre,
        [key]: is.string(value) ? value.trim() : value,
      }),
      {} as FormValues,
    )

  const decodeForCell = (key: SK<S>, value: any) => {
    const decoded = decodeValue(key, value)
    return is.boolean(decoded) ? bool(decoded) : decoded
  }

  const decodeValue = (key: SK<S>, value: any) =>
    schema[key].decode?.(value) ?? value

  const decode = (data: D) =>
    Object.entries(data).reduce(
      (pre, [key, value]: [string, any]) =>
        key in schema
          ? { ...pre, [key]: decodeValue(key as SK<S>, value) }
          : pre,
      {} as FormValues,
    )

  const encodeValue = (key: SK<S>, value: any) =>
    schema[key].encode?.(value) ?? value

  const encode = (data: FormValues) =>
    Object.entries(data).reduce((pre, [key, value]: [string, any]) => {
      const nullableValue = is.emptyString(value) ? null : value
      return {
        ...pre,
        [key]: encodeValue(key as SK<S>, nullableValue),
      }
    }, {} as E)

  const tablePairs = (data: D, fieldNames: SK<S>[]) => {
    return fieldNames.map((key) => [
      schema[key].label,
      decodeForCell(key, data[key as keyof D]),
    ])
  }

  const tableHeader = (fieldNames: SK<S>[], leadCells: string[] = []) => {
    return [...leadCells, ...fieldNames.map((key) => schema[key].label)]
  }

  const tableRow = (
    data: D,
    fieldNames: SK<S>[],
    leadCells: ReactNode[] = [],
  ) => {
    return [
      ...leadCells,
      ...fieldNames.map((key) => decodeForCell(key, data[key as keyof D])),
    ]
  }

  //

  const _field = (registerFn: RegisterFn, key: SK<S>, noRegister = false) => {
    const { type, pattern } = schema[key]
    const required = type === 'required'

    const inputRef = noRegister ? undefined : registerFn

    return {
      name: key,
      label: schema[key].label,
      inputRef,
      required,
      pattern,
      css: { width: '100%' },
    }
  }

  //

  const fn = () => {
    const {
      register,
      // handleSubmit: _handleSubmit,
      // formState,
      // clearError,
      setValue,
      getValues,
      reset,
      errors,
    } = useForm<FormValues>()

    const field: FieldFn<S> = (key, noRegister) =>
      _field(register, key, noRegister)

    const formRef = useRef<HTMLFormElement>(null)
    const docCallbackRef = useRef<DocCallbackFn>()
    const callbackRef = useRef<CallbackFn>()

    const dialogOpen = useBool(false)
    const formRendered = useBool(false)
    const dialog = {
      on: () => {
        formRendered.on()
        dialogOpen.on()
      },
      off: () => {
        dialogOpen.off()
        formRendered.off()
      },
    }
    const isSaving = useBool(false)

    const [action, setAction] = useState<Action>('create')
    const [_ref, _setRef] = useState<Blue.DocRef>()
    const [optionalData, setOptionalData] = useState<OP>()

    const editDoc = <D2 extends D & Blue.Meta>(
      dataOrRef: D2 | Blue.DocRef,
      callback: DocCallbackFn,
    ) => {
      docCallbackRef.current = callback
      const _dataOrRef = dataOrRef as D2 | firestore.DocumentReference

      if (_dataOrRef instanceof firestore.DocumentReference) {
        setAction('create')
        _setRef(_dataOrRef)
        init()
      } else {
        setAction('update')
        _setRef(_dataOrRef._ref)
        init(_dataOrRef)
      }
      dialog.on()
    }

    const edit = (data: D | null, optionalData: OP, callback: CallbackFn) => {
      callbackRef.current = callback
      setOptionalData(optionalData)

      if (is.null_(data)) {
        setAction('create')
        init()
      } else {
        setAction('update')
        init(data)
      }
      dialog.on()
    }

    const trimData = () => {
      const trimmed = trim(getValues())
      reset(trimmed)
      return trimmed
    }

    const init = (data?: D) => {
      log('init', data)
      // formRef.current?.reset()

      if (!data) {
        reset(initialValues)
      } else {
        const decoded = decode(data)
        reset(decoded)
      }
      log('initialized', getValues())
    }

    const handleSubmit = (callback: (s: E) => void | Promise<void>) => {
      return () => {
        log('errors', errors)

        if (formRef.current?.reportValidity()) {
          const trimmed = trimData()

          const encoded = encode(trimmed)
          log('encoded', encoded)
          callback(encoded)
        }
      }
    }

    const onAccept = handleSubmit(async (data) => {
      isSaving.on()

      if (_ref && docCallbackRef.current) {
        await docCallbackRef.current(_ref, data)
      } else if (callbackRef.current) {
        await callbackRef.current(data, optionalData!)
      }

      dialog.off()
      isSaving.off()
    })

    const renderDialog = () => (
      <FDialog
        dialogState={dialogOpen}
        title={dialogTitle[action]}
        styles={dialogStyles}
        savingState={isSaving}
        onAccept={onAccept}
      >
        {formRendered && (
          <Renderer
            {...{
              field,
              formRef,
              setValue,
              register,
              handleSubmit,
              _ref,
              optionalData,
              setOptionalData,
            }}
          ></Renderer>
        )}
      </FDialog>
    )

    const renderAddButton = (onClick: () => void, props?: ButtonProps) => (
      <Button
        type="button"
        outlined
        icon={micon('plus')}
        label={dialogTitle.create}
        onClick={onClick}
        {...props}
      ></Button>
    )

    return {
      formRef,
      editDoc,
      edit,
      renderDialog,
      renderAddButton,
      action,
      decode,
      encode,
      tablePairs,
      tableHeader,
      tableRow,
      // props,
      // register,
      // setValue,
      // handleSubmit,
    }
  }

  return fn as typeof fn & SO & { _K: keyof S }
}
