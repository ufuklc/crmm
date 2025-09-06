import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Portföy sahibi ID'si gerekli" },
        { status: 400 }
      );
    }

    // Check if portfolio owner exists
    const { data: existingOwner, error: fetchError } = await supabaseAdmin
      .from("portfolio_owners")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingOwner) {
      return NextResponse.json(
        { error: "Portföy sahibi bulunamadı" },
        { status: 404 }
      );
    }

    // Delete portfolio owner
    const { error: deleteError } = await supabaseAdmin
      .from("portfolio_owners")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Portföy sahibi silme hatası:", deleteError);
      return NextResponse.json(
        { error: "Portföy sahibi silinirken hata oluştu" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Portföy sahibi silme hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}