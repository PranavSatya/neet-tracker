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
          const userData = userDoc.data();
          const userRole = userData.role || "user";
          console.log("User UID:", user.uid);
          console.log("User data from Firestore:", userData);
          console.log("User role:", userRole);
          setRole(userRole);
        } else {
          console.log("No user document found for UID:", user.uid, "defaulting to user");
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
