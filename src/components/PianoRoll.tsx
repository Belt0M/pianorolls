import { FC, useEffect, useRef, useState } from 'react'
import { IRoll } from '../types/IRoll'

interface Color {
	r: number
	g: number
	b: number
}

function generateGradientTable(
	startColor: Color,
	endColor: Color,
	steps: number
): string[] {
	const gradientTable: string[] = []
	for (let i = 0; i < steps; i++) {
		const r = startColor.r + ((endColor.r - startColor.r) * i) / (steps - 1)
		const g = startColor.g + ((endColor.g - startColor.g) * i) / (steps - 1)
		const b = startColor.b + ((endColor.b - startColor.b) * i) / (steps - 1)
		gradientTable.push(
			`rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
		)
	}
	console.log(steps, gradientTable)
	return gradientTable
}

interface Props {
	sequence: IRoll[]
	index: number
}

const PianoRoll: FC<Props> = ({ sequence, index }) => {
	const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null)
	const [end, setEnd] = useState<number | null>(null)
	const [backgroundColormap, setBackgroundColormap] = useState<string[]>([])
	const [noteColormap, setNoteColormap] = useState<string[]>([])
	const [noteHeight, setNoteHeight] = useState<number | null>(null)

	const svgRef = useRef<SVGSVGElement | null>(null)

	useEffect(() => {
		// PianoRoll brand #5DB5D5
		const backgroundStartColor: Color = { r: 93, g: 181, b: 213 }
		// #154151
		const backgroundEndColor: Color = { r: 21, g: 65, b: 81 }
		setBackgroundColormap(
			generateGradientTable(backgroundStartColor, backgroundEndColor, 128)
		)

		const noteStartColor: Color = { r: 66, g: 66, b: 61 }
		const noteEndColor: Color = { r: 28, g: 28, b: 26 }
		setNoteColormap(generateGradientTable(noteStartColor, noteEndColor, 128))
	}, [])

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

	const timeToX = (time: number): number => time / (end || 1)

	const drawPianoRoll = () => {
		if (!svgElement || !end || !sequence || sequence.length === 0) {
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

		drawEmptyPianoRoll(pitchMin, pitchMax)

		sequence.forEach(note => {
			const noteRectangle = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'rect'
			)

			const x = timeToX(note.start - sequence[0].start)
			const w = timeToX(note.end - note.start)

			noteRectangle.setAttribute('x', `${x}`)
			noteRectangle.setAttribute('width', `${w}`)

			const y = 1 - (note.pitch - pitchMin) / pitchSpan

			noteRectangle.setAttribute('y', `${y}`)
			noteRectangle.setAttribute('height', `${noteHeight}`)

			const color = noteColormap[note.velocity]
			noteRectangle.setAttribute('fill', color)

			noteRectangle.classList.add('note-rectangle')

			svgElement.appendChild(noteRectangle)
		})
	}

	const drawEmptyPianoRoll = (pitchMin: number, pitchMax: number) => {
		if (!svgElement) {
			return
		}

		const pitchSpan = pitchMax - pitchMin
		for (let it = pitchMin; it <= pitchMax + 1; it++) {
			// Black keys
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
				rect.setAttribute('y', `${y}`)
				rect.setAttribute('width', `${w}`)
				rect.setAttribute('height', `${h}`)
				svgElement.appendChild(rect)
			}

			const line = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'line'
			)
			const y = 1 - (it - pitchMin) / pitchSpan + 1 / pitchSpan
			line.setAttribute('x1', '0')
			line.setAttribute('y1', `${y}`)
			line.setAttribute('x2', '2')
			line.setAttribute('y2', `${y}`)

			const lineWidth = it % 12 === 0 ? 0.003 : 0.001
			line.setAttribute('stroke-width', `${lineWidth}`)
			line.setAttribute('stroke', 'black')
			svgElement.appendChild(line)
		}
	}

	useEffect(() => {
		if (svgElement) {
			svgElement.innerHTML = ''
			drawPianoRoll()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [svgElement, end, sequence, noteHeight])

	return (
		<div className='w-full h-64 border-2 border-opacity-25 bg-gray-400 bg-opacity-10 text-center py-4 px-12'>
			<h2 className='font-semibold'>Piano Roll #{index}</h2>
			<div className='h-44 bg-blue-400 bg-opacity-25 mt-3.5 overflow-y-auto border-2 border-black'>
				<svg
					ref={element => {
						setSvgElement(element)
						svgRef.current = element
					}}
					viewBox='0 0 1 1'
					preserveAspectRatio='none'
				/>
			</div>
		</div>
	)
}

export default PianoRoll
