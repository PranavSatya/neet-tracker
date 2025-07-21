import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role || "user");
        } else {
          setRole("user"); // Default to user if no document exists
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole("user"); // Default to user on error
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  return { role, loading };
}
