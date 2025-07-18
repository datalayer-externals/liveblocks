import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";
import { users } from "@/data/users";

/**
 * Authenticating your Liveblocks application
 * https://liveblocks.io/docs/authentication
 */

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    return new NextResponse("Missing LIVEBLOCKS_SECRET_KEY", { status: 403 });
  }

  // Get the current user's unique id and info from your database
  const user = await getSession(request);

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  // Create a session for the current user (access token auth)
  const session = liveblocks.prepareSession(`${user.email}`, {
    userInfo: {
      name: user.name,
      avatar: user.avatar,
      color: user.color,
    },
  });

  // Use a naming pattern to allow access to rooms with a wildcard
  session.allow(`liveblocks:examples:*`, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { status, body } = await session.authorize();

  return new NextResponse(body, { status });
}

// Imagine this is your auth setup
async function getSession(request: NextRequest) {
  // Used to deploy to https://liveblocks.io/examples
  const { userId } = await request.json();
  const user = users.find((user) => user.email === "charlie.layne@example.com");

  if (!user) {
    return null;
  }

  return { ...user, email: (userId as string) || user.email };
}
