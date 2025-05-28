import React from 'react'

export function Button({ children, className = '', ...props }) {
    return (
        <button
            className={`inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
