import { FC, useEffect, useState } from 'react'
import PianoRoll from './components/PianoRoll'
import { notesData } from './data/notes.data'
import { IRoll } from './types/IRoll'

const App: FC = () => {
	const [rollsData, setRollsData] = useState<IRoll[][] | null>(null)

	useEffect(() => {
		function chunkArray(array: IRoll[], chunkSize: number, arraySize: number) {
			const result = []
			for (let i = 0; i < array.length; i += chunkSize) {
				result.push(array.slice(i, i + chunkSize))
			}
			return result.slice(0, arraySize)
		}

		const fetchData = async () => {
			try {
				const response = await fetch('https://pianoroll.ai/random_notes')
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`)
				}
				let data = await response.json()
				data = chunkArray(notesData, 60, 20)
				setRollsData(data)
				console.log(data)
			} catch (error) {
				console.error('Error loading data:', error)
			}
		}
		fetchData()
	}, [])

	return (
		<main className='flex justify-center'>
			<section className='md:w-3/6 w-full md:px-0 py-8 px-4 flex flex-col gap-4'>
				{rollsData?.map((roll, index) => (
					<PianoRoll key={index} sequence={roll} index={index + 1} />
				))}
			</section>
		</main>
	)
}

export default App
