'use client';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PlusCircle, TrendingUp, Home, CheckCircle, HelpCircle, X, Download, Monitor, UserCheck, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [stats, setStats] = useState({ totalBiens: 0, totalAnnonces: 0, published: 0 });
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/annonces');
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        totalBiens: data.annonces.length, // Approximation until we have separate biens endpoint logic
                        totalAnnonces: data.annonces.length,
                        published: data.annonces.filter(a => a.Publié_Facebook || a.Publié_SeLoger || a.Publié_LBC || a.Publié_BienIci).length
                    });
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            {/* Help Modal */}
            {showHelp && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <HelpCircle size={24} />
                                Guide d'Installation
                            </h2>
                            <button onClick={() => setShowHelp(false)} className="text-white/80 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Step 1 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Download size={18} /> Télécharger l'Assistant</h3>
                                    <p className="text-gray-600 text-sm mt-1">Cliquez sur le bouton ci-dessous pour télécharger le ZIP.</p>
                                    <a href="/ImmoSync-Agent.zip" download className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                        <Download size={16} /> Télécharger ImmoSync-Agent.zip
                                    </a>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">2</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Monitor size={18} /> Installer l'Agent</h3>
                                    <p className="text-gray-600 text-sm mt-1">Dézippez le dossier, puis double-cliquez sur <code className="bg-gray-100 px-1 rounded">INSTALL_AGENT.bat</code></p>
                                    <p className="text-gray-500 text-xs mt-1">L'installation prend 1-2 minutes. L'agent démarrera automatiquement.</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">3</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2"><UserCheck size={18} /> Connecter vos Comptes</h3>
                                    <p className="text-gray-600 text-sm mt-1">Lancez <code className="bg-gray-100 px-1 rounded">GÉRER_COMPTES.bat</code> pour connecter Facebook et LeBonCoin.</p>
                                    <p className="text-gray-500 text-xs mt-1">Vous n'aurez à le faire qu'une seule fois.</p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">4</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Rocket size={18} /> Publier vos Annonces</h3>
                                    <p className="text-gray-600 text-sm mt-1">Créez vos annonces ici, cliquez "Publier" et l'agent s'occupe du reste !</p>
                                    <p className="text-gray-500 text-xs mt-1">L'agent tourne en arrière-plan et publie automatiquement.</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                                <p className="text-amber-800 text-sm"><strong>💡 Astuce :</strong> L'agent démarre automatiquement avec Windows. Vous n'avez plus rien à faire !</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Tableau de Bord</h1>
                    <p className="text-gray-500 mt-1 font-medium">Bienvenue, configurez et gérez vos biens en toute simplicité.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="p-3 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-full transition-all hover:shadow-md"
                        title="Aide et Installation"
                    >
                        <HelpCircle size={24} />
                    </button>
                    <Link href="/nouveau-bien">
                        <Button className="px-6 py-3 shadow-lg hover:shadow-xl transition-all text-base transform hover:-translate-y-0.5">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Nouveau Bien
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Biens Enregistrés</p>
                            <h3 className="text-4xl font-extrabold text-blue-900 mt-2">{stats.totalBiens}</h3>
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
                            <h3 className="text-4xl font-extrabold text-indigo-900 mt-2">{stats.totalAnnonces}</h3>
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
                            <h3 className="text-4xl font-extrabold text-green-700 mt-2">{stats.published}</h3>
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
