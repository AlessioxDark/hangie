import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Sidebar from './pages/Sidebar';
function App() {
	return (
		<BrowserRouter>
			<div className="h-screen w-full flex flex-row">
				<Sidebar />
				<Routes>
					<Route path="/" element={<Home />}></Route>
				</Routes>
			</div>
		</BrowserRouter>
	);
}

export default App;
