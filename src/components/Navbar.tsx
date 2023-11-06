import { FC } from 'react'

interface Props {
	setSelected: (index: number | null) => void
}

const Navbar: FC<Props> = ({ setSelected }) => {
	return (
		<header className='fixed inset-x-0 top-0 px-6 pt-2.5 pb-3.5 text-lg text-white bg-secondary z-[100] shadow-sm'>
			<span onClick={() => setSelected(null)} className='cursor-pointer'>
				pianoroll.io
			</span>
		</header>
	)
}

export default Navbar
