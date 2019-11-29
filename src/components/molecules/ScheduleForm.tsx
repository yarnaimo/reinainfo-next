import styled from '@emotion/styled'
import React, { FC } from 'react'
import { RHFInput } from 'react-hook-form-input'
import { Checkbox, Select, TextField } from 'rmwc'
import { categories, ISchedule, MSchedule } from '../../models/Schedule'
import { margin, padding } from '../../utils/css'
import { formDatePattern, formifyDate, parseFormDate } from '../../utils/date'
import { Solid } from '../blocks/Flex'
import { Section } from '../blocks/Section'
import { createUseTypedForm, optional, required, toggle } from './Form'

const schema = {
    active: toggle(true, 'アクティブ?'),
    isSerial: toggle(false, '定期更新?'),

    category: required('event', 'カテゴリ'),
    customIcon: optional(null, 'アイコン'),
    ribbonColors: optional(null, '色'),

    title: required('', 'タイトル'),
    url: required('', 'URL'),
    date: required('', '日時', formDatePattern),
    hasTime: toggle(true, '時刻あり?'),
    parts: optional(null, 'パート'),
    venue: optional(null, '場所'),
    hasTickets: toggle(false, 'チケットあり?'),

    thumbUrl: optional(null, 'サムネイルURL'),
}

export const useScheduleForm = createUseTypedForm<
    typeof schema,
    ISchedule['_D'],
    ISchedule['_E']
>({
    schema,
    decoder: s => ({
        ...s,
        date: formifyDate(s.date.toDate()),
        ribbonColors: s.ribbonColors?.join('/') ?? null,
        parts: s.parts && MSchedule.serializeParts(s.parts),
    }),
    encoder: data =>
        ({
            ...data,
            date: parseFormDate(data.date) ?? new Date(0),
            ribbonColors: data.ribbonColors
                ? data.ribbonColors.split('/')
                : null,
            parts: MSchedule.deserializeParts(data.parts ?? ''),
        } as ISchedule['_E']),
})

const Block = styled(Solid)({
    ...padding({ y: 6 }),
    '& > * + *': {
        ...margin({ left: 8 }),
    },
})

type Props = ReturnType<typeof useScheduleForm>

export const ScheduleForm: FC<Props> = ({
    props: _props,
    register,
    setValue,
}) => {
    const props: typeof _props = (key, noRegister) => ({
        ..._props(key, noRegister),
        css: { width: '100%' },
    })

    const textarea = {
        textarea: true,
        outlined: true,
        rows: 2,
    }

    const CategorySelect_ = (
        <RHFInput
            as={
                <Select
                    {...props('category', true)}
                    options={Object.entries(categories).map(([k, v]) => ({
                        value: k,
                        label: v.name,
                    }))}
                />
            }
            register={register}
            setValue={setValue}
            name="category"
        />
    )

    return (
        <form>
            <Section>
                <Block>
                    <Checkbox {...props('active')}></Checkbox>
                    <Checkbox {...props('isSerial')}></Checkbox>
                </Block>
                <Block>
                    {CategorySelect_}
                    <TextField {...props('customIcon')}></TextField>
                </Block>
                <Block>
                    <TextField {...props('ribbonColors')}></TextField>
                </Block>
            </Section>

            <Section>
                <Block>
                    <TextField {...props('date')}></TextField>
                    <Checkbox {...props('hasTime')}></Checkbox>
                </Block>
                <Block>
                    <TextField {...props('parts')}></TextField>
                </Block>
                <Block>
                    <TextField {...textarea} {...props('title')}></TextField>
                </Block>
                <Block>
                    <TextField {...textarea} {...props('url')}></TextField>
                </Block>
                <Block>
                    <TextField {...props('venue')}></TextField>
                </Block>
            </Section>

            <Section>
                <Block>
                    <Checkbox disabled {...props('hasTickets')}></Checkbox>
                </Block>
            </Section>

            <Section>
                <Block>
                    <TextField {...props('thumbUrl')}></TextField>
                </Block>
            </Section>
        </form>
    )
}
