import React, { FC } from 'react'
import useForm from 'react-hook-form'
import { RHFInput } from 'react-hook-form-input'
import { Select, SelectProps } from 'rmwc'
import { SetRequired } from 'type-fest'
import { FieldFn } from '../templates/Form'

type Props = SetRequired<
    SelectProps &
        ReturnType<FieldFn<any>> & {
            register: ReturnType<typeof useForm>['register']
            setValue: (key: string, value: any) => void
        },
    'options'
>

export const FormSelect: FC<Props> = ({
    name,
    register,
    setValue,
    ...props
}) => {
    return (
        <RHFInput
            as={<Select {...props} />}
            register={register}
            setValue={setValue}
            name={name}
        />
    )
}
