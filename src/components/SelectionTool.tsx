import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'
import { GrFormClose } from 'react-icons/gr'
interface SelectionToolProps {
	children: React.ReactNode
}

const SelectionTool = ({ children }: SelectionToolProps) => {
	const [startPosition, setStartPosition] = useState<number | null>()
	const [endPosition, setEndPosition] = useState<number | null>()
	const [isRanged, setIsRanged] = useState<boolean>(false)
	const [leftBorder, setLeftBorder] = useState<number>(0)
	const [rightBorder, setRightBorder] = useState<number>(0)

	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const left = ref.current!.getBoundingClientRect()!.x
		const right = ref.current!.offsetWidth
		setLeftBorder(Math.ceil(left) - 2)
		setRightBorder(right + left - 4)
	}, [])

	const handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
		if (startPosition && !endPosition) {
			setEndPosition(event.clientX)
		} else if (!isRanged) {
			setStartPosition(event.clientX)
		}
	}

	const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
		if (!isRanged && startPosition) {
			if (startPosition <= event.clientX) {
				setEndPosition(event.clientX)
			} else {
				setEndPosition(event.clientX)
				// setStartPosition(event.clientX)
				console.log(startPosition, event.clientX)
			}
		}
	}

	const handleMouseUp = (event: React.MouseEvent<HTMLElement>) => {
		if (startPosition && event.clientX === startPosition) {
			setStartPosition(null)
			return
		}
		if (!isRanged && startPosition) {
			if (startPosition! > endPosition!) {
				setStartPosition(event.clientX)
				setEndPosition(startPosition)
			} else {
				!isRanged && startPosition && setEndPosition(event.clientX)
			}
			setIsRanged(true)
		}
		// console.log('Up: ', event.clientX)
	}

	const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
		if (startPosition) {
			if (event.clientX >= rightBorder) {
				setEndPosition(rightBorder)
				setIsRanged(true)
			} else if (event.clientX <= leftBorder) {
				setStartPosition(leftBorder)
				setEndPosition(startPosition)
				setIsRanged(true)
			} else {
				setStartPosition(null)
				setEndPosition(null)
				setIsRanged(false)
			}
		}
	}

	const resetRange = () => {
		setStartPosition(null)
		setEndPosition(null)
		setIsRanged(false)
	}

	const renderSelectionRectangle = () => {
		if (startPosition && endPosition) {
			const width = Math.abs(endPosition - startPosition)
			const x = startPosition > endPosition ? endPosition : startPosition
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
			<h1 className='absolute text-xl text-white -top-6'>
				{isRanged.toString()}' '{startPosition?.toString()}' '
				{endPosition?.toString()}'
			</h1>
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
