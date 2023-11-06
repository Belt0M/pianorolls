import clsx from 'clsx'
import { FC, useContext, useEffect, useRef, useState } from 'react'
import { SelectionContext } from '../context/SelectionContext'
import { IColor } from '../types/IColor'
import { IRoll } from '../types/IRoll'
import { generateGradientTable } from '../utils/generateGradientTable'

interface Props {
	sequence: IRoll[]
	index: number
	onClick: (index: number | null) => void
	isSelected: boolean
	isMainView: boolean
}

const PianoRoll: FC<Props> = ({
	sequence,
	index,
	onClick,
	isSelected,
	isMainView,
}) => {
	const [end, setEnd] = useState<number | null>(null)
	const [backgroundColormap, setBackgroundColormap] = useState<string[]>([])
	const [noteColormap, setNoteColormap] = useState<string[]>([])
	const [noteHeight, setNoteHeight] = useState<number | null>(null)
	const [heightDivider] = useState<number>(0.7)

	const { range, setSelectedNotes } = useContext(SelectionContext)

	const svgRef = useRef<SVGSVGElement | null>(null)

	// Listening when the selection range is set
	// If note is fully in selection then mark as selected
	useEffect(() => {
		if (isSelected && range) {
			const notes = svgRef.current?.querySelectorAll('rect.note-rectangle')
			const filteredNotes = []
			if (notes && range.end && range.start) {
				for (const note of notes) {
					const noteStart = parseFloat(note.getAttribute('x')!)
					const widthAttribute = parseFloat(note.getAttribute('width')!)
					const temp = noteStart! + widthAttribute
					const noteEnd = temp >= 1 ? 0.995 : temp

					// Normalize value from range 132 - 939 to 0 - 1
					const normalizedEnd = (range.end - 131) / (940 - 131)
					const normalizedStart = (range.start - 131) / (940 - 131)
					console.log(noteStart, noteEnd)
					console.log(normalizedStart, normalizedEnd)
					if (
						noteStart !== null &&
						noteEnd <= normalizedEnd &&
						noteStart >= normalizedStart
					) {
						filteredNotes.push(note)
					}
				}
				console.log('Selected notes: ', filteredNotes)
				setSelectedNotes(filteredNotes.length)
			}
		}
	}, [range, isSelected, setSelectedNotes])

	useEffect(() => {
		// PianoRoll brand #5DB5D5
		const backgroundStartColor: IColor = { r: 93, g: 181, b: 213 }
		// #154151
		const backgroundEndColor: IColor = { r: 21, g: 65, b: 81 }
		setBackgroundColormap(
			generateGradientTable(backgroundStartColor, backgroundEndColor, 128)
		)

		const noteStartColor: IColor = { r: 66, g: 66, b: 61 }
		const noteEndColor: IColor = { r: 28, g: 28, b: 26 }
		setNoteColormap(generateGradientTable(noteStartColor, noteEndColor, 128))
	}, [])

	useEffect(() => {
		if (svgRef.current) {
			svgRef.current.innerHTML = ''
			drawPianoRoll()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [svgRef.current, end, sequence, noteHeight])

	useEffect(() => {
		if (sequence && sequence.length > 0) {
			const pitches = sequence.map(note => note.pitch)
			let pitchMin = Math.min(...pitches)
			let pitchMax = Math.max(...pitches)
			let pitchSpan = pitchMax - pitchMin

			if (pitchSpan < 24) {
				const diff = 24 - pitchSpan
				const low = Math.ceil(diff / 2)
				const high = Math.floor(diff / 2)
				pitchMin -= low
				pitchMax += high
			}

			pitchMin -= 3
			pitchMax += 3
			pitchSpan = pitchMax - pitchMin
			setNoteHeight(1 / pitchSpan)

			// Calculate end based on sequence
			const endValue = sequence[sequence.length - 1].end - sequence[0].start
			setEnd(endValue)
		}
	}, [sequence])

	// Helper function to calculate the x coordinate and width of the note rectangle
	const timeToX = (time: number): number => time / (end || 1)

	// Draw notes rectangles
	const drawPianoRoll = () => {
		if (!svgRef.current || !end || !sequence || sequence.length === 0) {
			return
		}

		// Extract just the pitches to prepare the SVG parameters
		const pitches = sequence.map(note => note.pitch)

		// Make it at lest 2 octaves (2 * 12)
		let pitchMin = Math.min(...pitches)
		let pitchMax = Math.max(...pitches)
		let pitchSpan = pitchMax - pitchMin

		// If the span is too low, we have to extend it equally on both sides
		if (pitchSpan < 24) {
			const diff = 24 - pitchSpan
			const low = Math.ceil(diff / 2)
			const high = Math.floor(diff / 2)
			pitchMin -= low
			pitchMax += high
		}
		// And margin up and down
		pitchMin -= 3
		pitchMax += 3
		pitchSpan = pitchMax - pitchMin
		setNoteHeight(1 / pitchSpan)

		// Generate two color "grid" with octaves and pitch borders
		drawEmptyPianoRoll(pitchMin, pitchMax)

		// Iterate over all notes and generate Piano Roll notes rectangles
		sequence.forEach(note => {
			const noteRectangle = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'rect'
			)

			// Note Rectangle x position
			const x = timeToX(note.start - sequence[0].start)
			const w = timeToX(note.end - note.start)

			noteRectangle.setAttribute('x', `${x}`)
			noteRectangle.setAttribute('width', `${w}`)

			const y = 1 - (note.pitch - pitchMin) / pitchSpan

			noteRectangle.setAttribute('y', `${y * heightDivider}`)
			noteRectangle.setAttribute('height', `${noteHeight! * heightDivider}`)

			const color = noteColormap[note.velocity]
			noteRectangle.setAttribute('fill', color)

			noteRectangle.classList.add('note-rectangle')

			svgRef.current?.appendChild(noteRectangle)
		})
	}

	// Generate two color "grid" with octaves and pitch borders
	const drawEmptyPianoRoll = (pitchMin: number, pitchMax: number) => {
		if (!svgRef.current) {
			return
		}

		const pitchSpan = pitchMax - pitchMin
		// Iterate over all pitches
		for (let it = pitchMin; it <= pitchMax + 1; it++) {
			// Black keys
			// Add another color rectangle for each second row
			// Probably should be [1, 3, 5, 7, 9, 11] or [0, 2, 4, 6, 8, 10]
			// But in example was that one [1, 3, 6, 8, 10]
			if ([1, 3, 6, 8, 10].includes(it % 12)) {
				const rect = document.createElementNS(
					'http://www.w3.org/2000/svg',
					'rect'
				)
				const y = 1 - (it - pitchMin) / pitchSpan
				const x = 0
				const h = 1 / pitchSpan
				const w = 1

				rect.setAttribute('fill', backgroundColormap[12])
				rect.setAttribute('fill-opacity', '0.666')
				rect.setAttribute('x', `${x}`)
				rect.setAttribute('y', `${y * heightDivider}`)
				rect.setAttribute('width', `${w}`)
				rect.setAttribute('height', `${h * heightDivider}`)
				svgRef.current.appendChild(rect)
			}

			const line = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'line'
			)
			const y = 1 - (it - pitchMin) / pitchSpan + 1 / pitchSpan
			line.setAttribute('x1', '0')
			line.setAttribute('y1', `${y * heightDivider}`)
			line.setAttribute('x2', '2')
			line.setAttribute('y2', `${y * heightDivider}`)

			// Octave line
			const lineWidth = it % 12 === 0 ? 0.003 : 0.001
			line.setAttribute('stroke-width', `${lineWidth * heightDivider}`)
			line.setAttribute('stroke', 'black')
			svgRef.current.appendChild(line)
		}
	}

	return (
		<div
			className={clsx(
				isSelected
					? 'aspect-video mt-2'
					: isMainView
					? 'h-44'
					: 'group md:h-48 h-60',
				isMainView && 'min-h-[10rem]',
				'relative w-full p-4 overflow-hidden text-center bg-secondary rounded-lg shadow-md'
			)}
			onClick={() => onClick(index)}
		>
			{/* In grid view on hover show overlay */}
			<div
				className={clsx(
					!isSelected && 'cursor-pointer',
					'absolute inset-0 grid transition-all duration-300 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 place-content-center'
				)}
			>
				<h2 className='font-semibold text-white'>Piano Roll #{index}</h2>
			</div>
			{/* Main Piano Roll SVG */}
			<div className='h-full overflow-hidden bg-blue-200 bg-opacity-100 border-2 border-black'>
				<svg ref={svgRef} viewBox='0 0 1 1' preserveAspectRatio='none' />
			</div>
		</div>
	)
}

export default PianoRoll
