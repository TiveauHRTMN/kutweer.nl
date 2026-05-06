import { redirect } from "next/navigation";

export default function RootRedirect() {
  redirect("/homepage"); // Let's keep it clean and redirect to homepage where WeatherDashboard reads local storage or uses Amsterdam.
}
