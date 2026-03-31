import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

function todayKey(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export async function ensureUserDoc(uid: string) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(
            ref,
            {
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                goals: { kcal: 2200, proteinG: 140, carbsG: 250, fatG: 70 },
                stats: { streakCurrent: 0, streakBest: 0, lastCheckin: null },
            },
            { merge: true }
        );
    }
}

export async function dailyCheckin(uid: string) {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    const data: any = snap.data() ?? {};

    const today = todayKey();
    const last = data?.stats?.lastCheckin ?? null;

    if (last === today) return;

    const now = new Date();
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    const yesterday = todayKey(y);

    const isConsecutive = last === yesterday;
    const current = isConsecutive ? (data?.stats?.streakCurrent ?? 0) + 1 : 1;
    const best = Math.max(current, data?.stats?.streakBest ?? 0);

    await updateDoc(userRef, {
        updatedAt: serverTimestamp(),
        "stats.lastCheckin": today,
        "stats.streakCurrent": current,
        "stats.streakBest": best,
    });
}
