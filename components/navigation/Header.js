'use client';
import { User, Bell } from 'lucide-react';

export default function Header({ user, onMenuClick }) {
    return (
        <header className="bg-white shadow-sm z-10">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <button
                        onClick={onMenuClick}
                        className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none md:hidden"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                        Espace de Gestion - <span className="text-blue-700">{user?.name || 'Agent'}</span>
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 hidden sm:block">
                        <Bell size={20} />
                    </button>
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
