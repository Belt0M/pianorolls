import clsx from 'clsx'
import { FC, useEffect, useState } from 'react'
import { TbArrowBackUp } from 'react-icons/tb'
import PianoRoll from './components/PianoRoll'
import SelectionTool from './components/SelectionTool'
import { IRoll } from './types/IRoll'

const App: FC = () => {
	const [rollsData, setRollsData] = useState<IRoll[][] | null>(null)
	const [selected, setSelected] = useState<number | null>(null)

	// Fetch rolls data
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
				data = chunkArray(data, 60, 20)
				setRollsData(data)
			} catch (error) {
				console.error('Error loading data:', error)
			}
		}
		fetchData()
	}, [])

	// Handle on PianoRoll click to set Main element of view
	const handleSelect = (index: number | null) => {
		setSelected(index && index - 1)
	}

	return (
		<main className='relative flex justify-center'>
			{selected !== null ? (
				// Main view
				<>
					<TbArrowBackUp
						className='absolute p-3 text-5xl text-white transition-all rounded-full cursor-pointer top-6 left-6 bg-secondary hover:brightness-110'
						onClick={() => handleSelect(null)}
					/>
					<section className='flex justify-between w-full gap-8 px-4 py-8 md:w-5/6 md:px-0'>
						<div className='flex-[3]'>
							<SelectionTool>
								<PianoRoll
									sequence={rollsData![selected]}
									index={selected + 1}
									onClick={handleSelect}
									isSelected={true}
									isMainView={selected !== null}
								/>
							</SelectionTool>
							<h2 className='px-4 py-3 mt-4 font-semibold text-white rounded-md shadow-md bg-secondary'>
								Piano Roll #{selected + 1}
							</h2>
						</div>
						<div className='flex-[1] flex flex-col max-h-[calc(100vh-4rem)] gap-3 overflow-y-auto px-1'>
							{rollsData?.map(
								(roll, index) =>
									index !== selected && (
										<PianoRoll
											key={index}
											sequence={roll}
											index={index + 1}
											onClick={handleSelect}
											isSelected={false}
											isMainView={selected !== null}
										/>
									)
							)}
						</div>
					</section>
				</>
			) : (
				// Grid view
				<section
					className={clsx(
						selected ? 'flex' : 'grid grid-cols-3',
						'w-full gap-4 px-4 py-8 md:w-5/6 md:px-0'
					)}
				>
					{rollsData?.map((roll, index) => (
						<PianoRoll
							key={index}
							sequence={roll}
							index={index + 1}
							onClick={handleSelect}
							isSelected={selected === index}
							isMainView={selected !== null}
						/>
					))}
				</section>
			)}
		</main>
	)
}

export default App
