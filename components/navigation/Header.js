'use client';
import { User, Bell } from 'lucide-react';

export default function Header({ user }) {
    return (
        <header className="bg-white shadow-sm z-10">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Espace Agent</h1>
                <div className="flex items-center space-x-4">
                    <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
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
