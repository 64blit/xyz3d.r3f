
import React from 'react';

function FallbackMessage()
{
    return (
        <div>
            Oops! The 3D canvas failed to render or is very slow. Please try refreshing the page or check back later.
        </div>
    );
}

export class ErrorBoundary extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error)
    {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo)
    {
        console.error('Error caught in ErrorBoundary:', error, errorInfo);
    }

    render()
    {
        if (this.state.hasError)
        {
            return <FallbackMessage />;
        }

        return this.props.children;
    }
}
