import { Outlet } from "react-router-dom";

/** Parent layout so `/write-to-read` and `/write-to-read/builder/:bookId` share one route tree. */
export default function WriteToReadRouterLayout() {
  return <Outlet />;
}
