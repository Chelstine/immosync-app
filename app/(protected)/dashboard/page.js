import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Créer un bien</h3>
                        <p className="text-sm text-gray-500 mt-1">Générez une annonce IA en quelques secondes</p>
                    </div>
                    <Link href="/nouveau-bien">
                        <Button>Commencer</Button>
                    </Link>
                </Card>

                <Card className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Mes Annonces</h3>
                        <p className="text-sm text-gray-500 mt-1">Gérez vos biens et diffusions</p>
                    </div>
                    <Link href="/mes-annonces">
                        <Button variant="outline">Voir tout</Button>
                    </Link>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col justify-center">
                    <h3 className="text-lg font-bold">Bienvenue, {session?.user?.name || 'Agent'} !</h3>
                    <p className="opacity-90 mt-2 text-sm">Prêt à optimiser vos ventes aujourd'hui ?</p>
                    <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                        <p className="text-sm font-medium">Stats (Bientôt)</p>
                        <div className="flex justify-between mt-2 text-xs opacity-75">
                            <span>Annonces</span>
                            <span>-</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
