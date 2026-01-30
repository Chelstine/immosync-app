'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, PlusCircle, List, LogOut, Settings } from 'lucide-react';

export default function Sidebar({ user }) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Nouveau Bien', href: '/nouveau-bien', icon: PlusCircle },
        { name: 'Mes Annonces', href: '/mes-annonces', icon: List },
        { name: 'Paramètres', href: '/settings', icon: Settings },
    ];

    const handleSignOut = () => {
        signOut({ callbackUrl: '/login' });
    };

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64 bg-white border-r h-full">
                {/* Top Left Logo Area */}
                <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b">
                    <img src="/logo.png" alt="Novek AI" className="h-8 w-8 mr-2" />
                    <span className="text-xl font-bold text-blue-900">Novek AI</span>
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t p-4">
                    <div className="flex items-center w-full">
                        <div className="w-full">
                            <p className="text-sm font-medium text-gray-700 mb-2 truncate" title={user?.email}>{user?.name || user?.email}</p>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center text-sm font-medium text-red-600 hover:text-red-800"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
