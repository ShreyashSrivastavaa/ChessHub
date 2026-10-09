import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Password reset for administrative accounts must be performed using the CLI or direct administrative tools." },
    { status: 200 }
  );
}
