import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from '@/components/navigation/Sidebar';
import Header from '@/components/navigation/Header';
import OnboardingGuide from '@/components/ui/OnboardingGuide';

export default async function ProtectedLayout({ children }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar user={session?.user} />
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                <Header user={session?.user} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
                <OnboardingGuide />
            </div>
        </div>
    );
}
