import { auth, isAdminRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { saveUpload } from "@/lib/upload";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  try {
    const result = await saveUpload(file, 5 * 1024 * 1024);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "上传失败，请重试" }, { status: 400 });
  }
}
