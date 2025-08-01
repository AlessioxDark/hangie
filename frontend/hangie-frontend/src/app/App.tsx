import { useEffect } from 'react';

function App() {
	useEffect(() => {
		fetch('localhost:3000/api/events/discover')
			.then((res) => res.json())
			.then((data) => console.log(data));
	});
	return (
		<div>
			<h1>Menomale che funziona</h1>
		</div>
	);
}

export default App;
