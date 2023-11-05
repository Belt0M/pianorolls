import React, { useState } from 'react'

interface SelectionToolProps {
	children: React.ReactNode
}

const SelectionTool = ({ children }: SelectionToolProps) => {
	const [startPosition, setStartPosition] = useState<number | null>()
	const [endPosition, setEndPosition] = useState<number | null>()
	const [isRanged, setIsRanged] = useState<boolean>(false)

	const handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
		setStartPosition(event.clientX)
		if (isRanged) {
			setEndPosition(event.clientX)
			setIsRanged(false)
		}
		// console.log('Down: ', event.clientX)
	}

	const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
		if (startPosition) {
			if (startPosition <= event.clientX) {
				!isRanged && setEndPosition(event.clientX)
			} else {
				!isRanged && setEndPosition(event.clientX)
				!isRanged && setStartPosition(event.clientX)
			}
			// console.log('Move: ', event.clientX)
		}
	}

	const handleMouseUp = (event: React.MouseEvent<HTMLElement>) => {
		!isRanged && setEndPosition(event.clientX)
		setIsRanged(true)
		// console.log('Up: ', event.clientX)
	}

	const renderSelectionRectangle = () => {
		if (startPosition && endPosition) {
			const width = endPosition - startPosition

			// console.log('Start: ', startPosition, ' Width: ', width)

			return (
				<div
					className='relative h-full bg-violet-500 bg-opacity-40 z-[50]'
					style={{ width, left: `${startPosition - 130}px` }}
				></div>
			)
		}

		return null
	}

	return (
		<div
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			className='relative'
		>
			<h1 className='absolute text-xl text-white -top-6'>
				{isRanged.toString()}
			</h1>
			<div className='absolute w-[calc(100%-2rem)] left-4 h-full py-4 z-[50] overflow-hidden'>
				{renderSelectionRectangle()}
			</div>
			{children}
		</div>
	)
}

export default SelectionTool
