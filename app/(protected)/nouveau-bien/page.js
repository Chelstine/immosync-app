'use client';
import BienForm from '@/components/forms/BienForm';

export default function NouveauBienPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Créer un nouveau bien</h1>
            </div>
            <p className="text-gray-500">Remplissez les informations ci-dessous pour générer automatiquement votre annonce.</p>
            <BienForm />
        </div>
    );
}
