'use client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Download, CheckCircle, Shield, Play } from 'lucide-react';

export default function DownloadPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-extrabold text-blue-900">Installation de l'Assistant ImmoSync</h1>
                <p className="text-gray-500 text-lg">
                    Pour permettre la diffusion automatique sur Facebook et LeBonCoin,
                    un petit logiciel sécurisé doit être installé sur votre ordinateur.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Guide */}
                <Card className="p-8 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Download className="text-blue-600" />
                        Procédure d'installation
                    </h2>

                    <div className="space-y-6 relative">
                        {/* Step 1 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Télécharger le Pack</h3>
                                <p className="text-sm text-gray-500">Récupérez le dossier <code>ImmoSync-Agent.zip</code> (fourni par votre administrateur Novek).</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Lancer l'Installation</h3>
                                <p className="text-sm text-gray-500">Double-cliquez sur <code>INSTALL_AGENT.bat</code>.</p>
                                <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 border border-gray-200">
                                    ✅ Cela créera automatiquement le raccourci de démarrage.
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Connexion Automatique</h3>
                                <p className="text-sm text-gray-500">L'assistant va vérifier votre connexion Facebook. Une fenêtre s'ouvrira une seule fois pour valider l'accès.</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Status & Action */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                        <Shield className="w-12 h-12 mb-4 opacity-80" />
                        <h2 className="text-2xl font-bold mb-2">Technologie Hybride</h2>
                        <p className="opacity-90 leading-relaxed">
                            L'assistant travaille en arrière-plan. Il respecte les règles de sécurité des plateformes en simulant une navigation humaine depuis votre propre adresse IP.
                        </p>
                    </Card>

                    <Card className="p-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <Play size={32} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Prêt à diffuser ?</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Une fois installé, revenez sur vos annonces et cliquez simplement sur "Publier".
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => window.location.href = '/mes-annonces'}
                        >
                            Retour à mes annonces
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
