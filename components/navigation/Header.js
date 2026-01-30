'use client';

export default function Header({ user }) {
    return (
        <header className="bg-white shadow-sm z-10 w-full">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <h1 className="text-lg font-semibold text-gray-900">
                    Espace Agent
                </h1>
                <div className="flex items-center">
                    {/* Mobile menu toggle could go here */}
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold border border-blue-200">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
}
