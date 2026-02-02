import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = "", endIcon, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <div className="relative">
                <input
                    ref={ref}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 text-black placeholder-gray-500 ${error ? 'border-red-500' : ''} ${endIcon ? 'pr-10' : ''} ${className}`}
                    {...props}
                />
                {endIcon && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
                        {endIcon}
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
