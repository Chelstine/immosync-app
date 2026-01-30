export default function Card({ children, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300 ${className}`}>
            {children}
        </div>
    );
}
