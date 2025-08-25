import { House, MessageCircle, Ticket } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.svg';

const Sidebar = () => {
	const location = useLocation();

	const SideBarLinks = [
		{
			id: 1,
			title: 'Home',
			icon: <House />,
			link: '/',
		},
		{
			id: 2,
			title: 'Chats',
			icon: <MessageCircle />,
			link: '/chats',
		},
		{
			id: 3,
			title: 'Eventi',
			icon: <Ticket />,
			link: '/events',
		},
		{
			id: 4,
			title: 'Profilo',
			icon: (
				<div className="w-7 h-7 rounded-full border-2 border-white bg-white/20"></div>
			),
			link: '/profile',
		},
	];

	return (
		<div className="h-full w-1/6 p-6 flex flex-col gap-8 shadow-xl bg-primary">
			{/* Header con Logo */}
			<div className="flex w-full flex-row gap-4 items-center py-4">
				<div className="p-2 rounded-2xl bg-neutral-white/10 backdrop-blur-sm">
					<img src={logo} alt="App Logo" className="w-15 h-15" />
				</div>
				<h1 className="font-title font-bold text-3xl text-neutral-white">
					Hangie
				</h1>
			</div>

			{/* Navigation */}
			<nav className="flex flex-col gap-3">
				{SideBarLinks.map((sideBarLink) => {
					const isActive = location.pathname === sideBarLink.link;

					return (
						<Link
							to={sideBarLink.link}
							key={sideBarLink.id}
							className={`
								flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group text-neutral-white
								${
									isActive
										? 'shadow-lg transform scale-105 bg-accent'
										: 'hover:transform hover:scale-105 hover:shadow-md bg-neutral-white/10'
								} 
							`}
						>
							<div
								className={`transition-transform duration-300 ${
									isActive ? 'scale-110' : 'group-hover:scale-110'
								}`}
							>
								{sideBarLink.icon}
							</div>
							<span className="font-title text-lg font-medium">
								{sideBarLink.title}
							</span>
						</Link>
					);
				})}
			</nav>
		</div>
	);
};

export default Sidebar;
