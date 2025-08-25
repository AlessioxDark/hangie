import React from 'react';
import Sidebar from '../../app/pages/Sidebar';

const LayoutSidebar = ({ children }) => {
	return (
		<div className="h-screen w-full flex flex-row">
			<Sidebar />
			{children}
		</div>
	);
};

export default LayoutSidebar;
