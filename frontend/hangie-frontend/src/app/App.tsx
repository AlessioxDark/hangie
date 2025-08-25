import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LayoutSidebar from '../components/Layouts/LayoutSidebar';
import Home from './pages/Home';
import Sidebar from './pages/Sidebar';
import SignUp from './pages/SignUp';
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/singup" element={<SignUp />}></Route>
				<Route path="/login" element={<Home />}></Route>
				<Route
					path="/"
					element={
						<LayoutSidebar>
							<Home />
						</LayoutSidebar>
					}
				></Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
