import { Search, X } from 'lucide-react';
import React, { useState } from 'react';
const SearchBar = () => {
	const [inputValue, setInputValue] = useState('');
	const handleClearInput = () => {
		setInputValue('');
	};
	return (
		<div className="border-2 border-neutral-300 p-3 w-2/5 h-14 rounded-full flex flex-row justify-between items-center shadow-md bg-white">
			<div className="flex gap-2 flex-row w-full items-center">
				<Search size={28} className="text-gray-600" />
				<input
					type="text"
					className="w-full h-full text-lg outline-none font-body flex items-center placeholder-gray-400"
					placeholder="Cerca..."
					onInput={(e) => {
						setInputValue(e.target.value);
					}}
					value={inputValue}
				/>
			</div>
			{inputValue !== '' && (
				<X
					size={28}
					className="text-gray-600 cursor-pointer "
					onClick={handleClearInput}
				/>
			)}
		</div>
	);
};

export default SearchBar;
