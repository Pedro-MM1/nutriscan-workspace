import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";

type UserDoc = {
    goals?: { kcal: number; proteinG: number; carbsG: number; fatG: number };
    stats?: { streakCurrent: number; streakBest: number; lastCheckin: string | null };
};

export function useUserDoc() {
    const [user, setUser] = useState<User | null>(null);
    const [data, setData] = useState<UserDoc | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) {
            setData(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const ref = doc(db, "users", user.uid);
        const unsub = onSnapshot(
            ref,
            (snap) => {
                setData((snap.data() as UserDoc) ?? null);
                setLoading(false);
            },
            () => setLoading(false)
        );

        return () => unsub();
    }, [user]);

    return { user, data, loading };
}
