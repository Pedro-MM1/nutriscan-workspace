import { onAuthStateChanged, signOut as firebaseSignOut, User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";


// DEVELOPMENT MODE FLAG
// Set to false to bypass Firebase Auth and use mock users
export const USE_FIREBASE_AUTH = false;

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
    signInAsGuest: () => void; // Dev mode helper
    mockSignIn: (email: string) => void; // Dev mode helper
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthenticated: false,
    signOut: async () => { },
    signInAsGuest: () => { },
    mockSignIn: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (USE_FIREBASE_AUTH) {
            const unsub = onAuthStateChanged(auth, (user) => {
                setUser(user);
                setLoading(false);
            });
            return unsub;
        } else {
            // In dev mode, check if we have a mock user stored or just start unauthenticated
            // For simplicity, we start unauthenticated and let the user click "Login"
            setLoading(false);
        }
    }, []);

    const signOut = async () => {
        if (USE_FIREBASE_AUTH) {
            await firebaseSignOut(auth);
        } else {
            setUser(null);
        }
    };

    const signInAsGuest = () => {
        if (!USE_FIREBASE_AUTH) {
            const mockUser = {
                uid: 'dev-guest-123',
                email: 'guest@nutriscan.ai',
                displayName: 'Guest User',
                emailVerified: true,
                isAnonymous: true,
                metadata: {},
                providerData: [],
                refreshToken: '',
                tenantId: null,
                delete: async () => { },
                getIdToken: async () => 'mock-token',
                getIdTokenResult: async () => ({} as any),
                reload: async () => { },
                toJSON: () => ({}),
                phoneNumber: null,
                photoURL: null,
                providerId: 'mock',
            } as unknown as User;
            setUser(mockUser);
        }
    };

    const mockSignIn = (email: string) => {
        if (!USE_FIREBASE_AUTH) {
            const mockUser = {
                uid: 'dev-user-456',
                email: email || 'dev@nutriscan.ai',
                displayName: 'Dev User',
                emailVerified: true,
                isAnonymous: false,
                metadata: {},
                providerData: [],
                refreshToken: '',
                tenantId: null,
                delete: async () => { },
                getIdToken: async () => 'mock-token',
                getIdTokenResult: async () => ({} as any),
                reload: async () => { },
                toJSON: () => ({}),
                phoneNumber: null,
                photoURL: null,
                providerId: 'mock',
            } as unknown as User;
            setUser(mockUser);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, signOut, signInAsGuest, mockSignIn }}>
            {children}
        </AuthContext.Provider>
    );
};
