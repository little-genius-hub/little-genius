import { NextResponse } from "next/server";

export default function errHandler(err: any) {
  let status = 500;
  let message = "Internal Server Error";

  if (err.status) {
    status = err.status;
    message = err.message;
  } else if (err.message) {
    message = err.message;
  }

  return NextResponse.json({ message }, { status });
}
