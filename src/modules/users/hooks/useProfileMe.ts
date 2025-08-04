import { useState, useEffect } from "react";
import { getProfileMe } from "../services/profile.service";

/**
 * React hook to fetch the current user's profile from /profiles/me.
 * Returns: { data, isLoading, error }
 */
export function useProfileMe(token?: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getProfileMe(token)
      .then((profile) => {
        if (isMounted) {
          setData(profile);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setData(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [token]);

  return { data, isLoading, error };
}
