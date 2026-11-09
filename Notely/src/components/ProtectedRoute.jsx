import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../api";

function ProtectedRoute({ children}) {
    const [ status, setStatus] = useState('loading')

    useEffect(() => {
        getMe()
        .then(() => setStatus('ok'))
        .catch(() => setStatus('no'))
    }, [])

    if (status === 'loading') return <p className="p-6">Loading...</p>
    if (status === 'no') return <Navigate to="/login" replace />
    return children
}

export default ProtectedRoute;