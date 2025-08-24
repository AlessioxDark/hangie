import React from 'react';

const Sidebar = () => {
	return (
		<>
			<div
				className="h-full w-full p-5 "
				// style={{ backgroundColor: 'hsl(215, 60%, 17%)' }}
			>
				<h1 className="text-white font-title text-5xl">Questo è un titolo</h1>

				<p className="text-white text-base font-body">
					questo è un paragrafo del titolo
				</p>
			</div>
		</>
	);
};

export default Sidebar;
