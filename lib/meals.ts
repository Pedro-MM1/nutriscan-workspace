import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealInput = {
    name: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    type: MealType;
    dateKey: string; // "YYYY-MM-DD"
};

export async function addMeal(uid: string, meal: MealInput) {
    const ref = collection(db, "users", uid, "meals");

    await addDoc(ref, {
        // formato antigo (pra telas antigas / compat)
        name: meal.name,
        kcal: meal.kcal,
        proteinG: meal.proteinG,
        carbsG: meal.carbsG,
        fatG: meal.fatG,

        // formato novo (pra somas/queries novas)
        type: meal.type,
        dateKey: meal.dateKey,
        totals: {
            calories: meal.kcal,
            protein: meal.proteinG,
            carbs: meal.carbsG,
            fat: meal.fatG,
        },

        createdAt: Timestamp.now(),
        createdAtServer: serverTimestamp(),
    });
}