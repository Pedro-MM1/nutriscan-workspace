import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

export type WeightEntry = {
  id: string;
  kg: number;
  dateKey: string; // "YYYY-MM-DD"
  loggedAt: any;   // Firestore Timestamp
};

export function useWeightLog(uid: string | null) {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const ref = collection(db, "users", uid, "weightLog");
    const q = query(ref, orderBy("loggedAt", "desc"), limit(90));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setEntries(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<WeightEntry, "id">),
          }))
        );
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [uid]);

  const addEntry = async (kg: number) => {
    if (!uid) return;
    const ref = collection(db, "users", uid, "weightLog");
    await addDoc(ref, {
      kg,
      dateKey: new Date().toISOString().slice(0, 10),
      loggedAt: Timestamp.now(),
      loggedAtServer: serverTimestamp(),
    });
  };

  return { entries, loading, addEntry };
}
