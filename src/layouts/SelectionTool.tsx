import clsx from 'clsx'
import React, {
	FC,
	PropsWithChildren,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { GrFormClose } from 'react-icons/gr'
import { SelectionContext } from '../context/SelectionContext'

const SelectionTool: FC<PropsWithChildren> = ({ children }) => {
	const [startPosition, setStartPosition] = useState<number | null>(null)
	const [endPosition, setEndPosition] = useState<number | null>(null)
	const [isRanged, setIsRanged] = useState<boolean>(false)
	const [leftBorder, setLeftBorder] = useState<number>(0)
	const [rightBorder, setRightBorder] = useState<number>(0)

	const { setRange, setSelectedNotes, range } = useContext(SelectionContext)

	const ref = useRef<HTMLDivElement>(null)

	// Set canvas left and right borders
	useEffect(() => {
		const left = ref.current!.getBoundingClientRect()!.x
		const right = ref.current!.offsetWidth
		setLeftBorder(Math.ceil(left) - 2)
		setRightBorder(right + left - 4)
	}, [])

	// Reset the range selection parameters
	const resetRange = () => {
		setStartPosition(null)
		setEndPosition(null)
		setIsRanged(false)
		setRange({ start: null, end: null })
		setSelectedNotes(0)
	}

	// Reset selection on Piano Roll change
	useEffect(() => {
		range.end == null && range.start === null && resetRange()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [range.end, range.start])

	// On mouse down handler to set the range selection start position
	const handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
		if (startPosition && !endPosition) {
			setEndPosition(event.clientX)
		} else if (!isRanged) {
			setStartPosition(event.clientX)
		}
	}

	// On mouse move handler to set the range selection end position on each mouse move
	const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
		if (!isRanged && startPosition) {
			if (startPosition <= event.clientX) {
				setEndPosition(event.clientX)
			} else {
				setEndPosition(event.clientX)
			}
		}
	}

	// On mouse up handler to set range selection the final end position
	const handleMouseUp = (event: React.MouseEvent<HTMLElement>) => {
		if (startPosition && event.clientX === startPosition) {
			setStartPosition(null)
			return
		}
		if (!isRanged && startPosition) {
			if (startPosition! > endPosition!) {
				setStartPosition(event.clientX)
				setEndPosition(startPosition)
				setRange({ start: event.clientX, end: startPosition })
			} else {
				setEndPosition(event.clientX)
				setRange({ start: startPosition, end: event.clientX })
			}
			setIsRanged(true)
		}
	}

	// On mouse leave handler to set range selection start/end position to the border value
	const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
		if (startPosition && !isRanged) {
			if (event.clientX >= rightBorder) {
				setEndPosition(rightBorder)
				setIsRanged(true)
				setRange({ start: startPosition, end: rightBorder })
			} else if (event.clientX <= leftBorder) {
				setStartPosition(leftBorder)
				setEndPosition(startPosition)
				setIsRanged(true)
				setRange({ start: leftBorder, end: startPosition })
			} else {
				setStartPosition(null)
				setEndPosition(null)
				setIsRanged(false)
			}
		}
	}

	// Generate a rectangular selection area
	const renderSelectionRectangle = () => {
		if (startPosition && endPosition) {
			const width = Math.abs(endPosition - startPosition)
			const x = Math.min(startPosition, endPosition)
			return (
				<div
					className={clsx(
						!isRanged
							? ' border-yellow-500 bg-opacity-20 bg-yellow-500'
							: 'bg-opacity-40',
						'border-x-2 border-violet-500 relative h-full bg-violet-500 z-[50]'
					)}
					style={{ width, left: `${x - 130}px` }}
				>
					{isRanged && (
						<GrFormClose
							className='absolute p-0.5 text-xl transition-all rounded-full cursor-pointer top-1 right-1 bg-violet-500 hover:brightness-110'
							onClick={resetRange}
						/>
					)}
				</div>
			)
		}

		return null
	}

	return (
		<div className='relative'>
			{/* Temporary 	 values */}
			{/* <h1 className='absolute text-xl text-white -top-6'>
				{isRanged.toString()}' '{startPosition?.toString()}' '
				{endPosition?.toString()}'
			</h1> */}
			<div
				className='absolute w-[calc(100%-2rem)] left-4 h-full py-4 z-[50] overflow-hidden'
				ref={ref}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
			>
				{renderSelectionRectangle()}
			</div>
			{children}
		</div>
	)
}

export default SelectionTool
