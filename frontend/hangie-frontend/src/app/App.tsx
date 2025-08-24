import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import Sidebar from './pages/Sidebar';

function App() {
	return (
		<div className="h-screen w-full">
			<Sidebar />
			<BrowserRouter>
				<Routes></Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
