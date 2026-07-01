import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { setActorPortalSession } from "@/utils/actorPortalSession";

export default function ActorPortalSessionSync() {
  const user = useSelector((state: RootState) => state.user.userData);

  useEffect(() => {
    if (user?.email) {
      setActorPortalSession(user);
    }
  }, [user]);

  return null;
}
