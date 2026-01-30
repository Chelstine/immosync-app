'use client';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PlusCircle, TrendingUp, Home, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [stats, setStats] = useState({ totalBiens: 0, totalAnnonces: 0, published: 0 });

    // In a real app, fetch stats from API
    // useEffect(() => { ... }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Tableau de Bord</h1>
                    <p className="text-gray-500 mt-1 font-medium">Bienvenue, configurez et gérez vos biens en toute simplicité.</p>
                </div>
                <Link href="/nouveau-bien">
                    <Button className="px-6 py-3 shadow-lg hover:shadow-xl transition-all text-base transform hover:-translate-y-0.5">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Nouveau Bien
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Biens Enregistrés</p>
                            <h3 className="text-4xl font-extrabold text-blue-900 mt-2">--</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <Home size={28} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Annonces Générées</p>
                            <h3 className="text-4xl font-extrabold text-indigo-900 mt-2">--</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <TrendingUp size={28} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Diffusées en Ligne</p>
                            <h3 className="text-4xl font-extrabold text-green-700 mt-2">--</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl text-green-600">
                            <CheckCircle size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Dernières Activités</h2>
                    <Link href="/mes-annonces" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                        Voir tout
                    </Link>
                </div>
                <div className="p-12 text-center text-gray-500 bg-gray-50/50">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                            <Home size={32} />
                        </div>
                        <p className="text-lg">Aucune activité récente.</p>
                        <p className="text-sm">Commencez par ajouter un bien immobilier.</p>
                        <Link href="/nouveau-bien">
                            <Button variant="outline" className="mt-2">Ajouter un bien</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
