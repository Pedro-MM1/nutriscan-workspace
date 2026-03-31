import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";

type Meal = {
    id: string;
    name: string;
    type?: "breakfast" | "lunch" | "dinner" | "snack";
    dateKey: string;
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    createdAt?: any;
};

const ZERO_TOTALS = { calories: 0, protein: 0, carbs: 0, fat: 0 };

function toDateKey(d: Date) {
    return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export function useDailyMeals(uid: string | null, date = new Date()) {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);

    const dateKey = useMemo(() => toDateKey(date), [date]);

    useEffect(() => {
        if (!uid) {
            setMeals([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const ref = collection(db, "users", uid, "meals");

        const q = query(
            ref,
            where("dateKey", "==", dateKey),
            orderBy("createdAt", "asc")
        );

        const unsub = onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({
                    id: d.id,
                    ...(d.data() as Omit<Meal, "id">),
                })) as Meal[];

                setMeals(list);
                setLoading(false);
            },
            (err) => {
                console.log("❌ useDailyMeals snapshot erro:", err);
                setMeals([]);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [uid, dateKey]);

    const totals = useMemo(() => {
        return (meals ?? []).reduce(
            (acc, m) => ({
                calories: acc.calories + (Number(m?.totals?.calories) || 0),
                protein: acc.protein + (Number(m?.totals?.protein) || 0),
                carbs: acc.carbs + (Number(m?.totals?.carbs) || 0),
                fat: acc.fat + (Number(m?.totals?.fat) || 0),
            }),
            { ...ZERO_TOTALS }
        );
    }, [meals]);

    return { meals, totals, loading, dateKey };
}
