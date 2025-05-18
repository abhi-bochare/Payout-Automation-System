import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

export default function ProtectedLayout({ user, children }) {
  const navigate = useNavigate();
  return <Layout user={user} children={children} navigate={navigate} />;
}
