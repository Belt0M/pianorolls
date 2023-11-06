import { FC, PropsWithChildren, createContext, useState } from 'react'
import { IRange } from '../types/IRange'

interface IRangeContext {
	range: IRange
	setRange: React.Dispatch<React.SetStateAction<IRange>>
	selectedNotes: number
	setSelectedNotes: React.Dispatch<React.SetStateAction<number>>
}

const initState: IRangeContext = {
	range: {
		start: null,
		end: null,
	},
	setRange: () => {},
	selectedNotes: 0,
	setSelectedNotes: () => {},
}

export const SelectionContext = createContext<IRangeContext>(initState)

export const SelectionProvider: FC<PropsWithChildren> = ({ children }) => {
	const [range, setRange] = useState<IRange>({ start: null, end: null })
	const [selectedNotes, setSelectedNotes] = useState<number>(0)

	return (
		<SelectionContext.Provider
			value={{ range, setRange, selectedNotes, setSelectedNotes }}
		>
			{children}
		</SelectionContext.Provider>
	)
}
