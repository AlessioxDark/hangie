import React from 'react';
import { Link } from 'react-router';
import appleLogo from '../../assets/Apple_logo.svg';
import facebookLogo from '../../assets/Facebook_logo.svg';
import googleLogo from '../../assets/Google_logo.svg';
const SignUp = () => {
	return (
		<div className="h-screen w-full p-5 flex justify-center items-center flex-col relative bg-primary">
			<div className="absolute top-5 flex w-full h-1/4 justify-center items-center">
				<h1 className="font-bold text-center text-3xl text-gray-800">
					Benvenuto ad Hangie
				</h1>
			</div>
			<div className="w-3/10 flex flex-col items-center gap-10 bg-white rounded-lg shadow-lg p-8">
				<h1 className="font-bold text-center text-4xl text-gray-800">
					Registrati
				</h1>
				<div className="flex flex-col gap-4 w-full">
					<div className="flex flex-col gap-5 w-full">
						<div className="flex flex-row justify-between gap-4">
							<input
								type="text"
								className="border-2 border-gray-300 rounded-lg p-3 font-body w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Nome"
							/>
							<input
								type="text"
								className="border-2 border-gray-300 rounded-lg p-3 font-body w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Cognome"
							/>
						</div>
						<input
							type="text"
							className="border-2 border-gray-300 rounded-lg p-3 font-body w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Username"
						/>
						<input
							type="email"
							className="border-2 border-gray-300 rounded-lg p-3 font-body w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Email"
						/>
						<input
							type="password"
							className="border-2 border-gray-300 rounded-lg p-3 font-body w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Password"
						/>
					</div>
					<div className="w-full flex items-center px-4 gap-3">
						<input type="checkbox" className="scale-150 accent-blue-500" />
						<span className="font-body text-md">Iscriviti alla newsletter</span>
					</div>
					<div className="w-full text-center ">
						<span className="text-gray-600 font-body">
							Hai già un account? fai il{' '}
							<Link
								to="/login"
								className="text-blue-600 font-body font-semibold"
							>
								Login
							</Link>
						</span>
					</div>
					<div className="w-full flex justify-center">
						<button className="p-3.5 font-title font-bold bg-accent w-40 rounded-3xl cursor-pointer">
							<span className="text-xl">Invia</span>
						</button>
					</div>
					<div className="flex items-center justify-center">
						<div className="flex-1 h-0.5 bg-accent "></div>
						<span className="font-body text-sm text-center mx-1 text-gray-700 ">
							oppure registrati con
						</span>
						<div className="flex-1 h-0.5 bg-accent "></div>
					</div>
					<div className="flex flex-row gap-5 items-center w-full justify-center">
						<img
							src={googleLogo}
							alt="Google Logo"
							className="w-10 h-10 rounded-ful"
						/>
						<img
							src={appleLogo}
							alt="Apple Logo"
							className="w-10 h-10 rounded-ful"
						/>
						<img
							src={facebookLogo}
							alt="Facebook Logo"
							className="w-10 h-10 rounded-ful"
						/>
						{/* <div className="w-10 h-10 rounded-full bg-black">img</div> */}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUp;
