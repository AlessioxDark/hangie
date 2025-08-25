import React, { useEffect } from 'react';
import SearchBar from '../../components/SearchBar';
import EventCard from '../../features/EventsHomePage/EventCard';
const Home = () => {
	const EVENTSDATA = [
		{
			id: 1,
			titolo: 'ciao',
		},
	];
	useEffect(() => {}, []);
	return (
		<div className="box-border p-5 w-full h-full flex flex-col gap-100 ">
			<div className="w-full flex justify-center">
				<SearchBar />
			</div>
			<div>
				{EVENTSDATA.map((eventData) => {
					return <EventCard key={eventData.id} {...eventData} />;
				})}
			</div>
		</div>
	);
};

export default Home;
