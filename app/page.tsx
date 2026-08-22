import { Landing } from "@/components/Landing";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return <Landing />;
  }

  return <ActivityFeed userId={user.id} />;
}
