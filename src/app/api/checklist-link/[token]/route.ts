import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // Obtener información del enlace
    const linkData = await kv.get(`link_${token}`);
    
    if (!linkData) {
      return NextResponse.json(
        { success: false, error: 'Enlace no válido o expirado' },
        { status: 404 }
      );
    }

    if ((linkData as any).used) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return NextResponse.json(
        { success: false, error: 'Este enlace ya ha sido utilizado' },
        { status: 410 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      linkData 
    });
  } catch (error) {
    console.error('Error al validar enlace:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const data = await request.json();
    
    // Verificar que el enlace existe y no ha sido usado
    const linkData = await kv.get(`link_${token}`);
    
    if (!linkData || (linkData as any).used) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return NextResponse.json(
        { success: false, error: 'Enlace no válido o ya utilizado' },
        { status: 400 }
      );
    }

    // Generar un ID único para este checklist
    const checklistId = `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Guardar el checklist
    await kv.set(checklistId, {
      ...data,
      id: checklistId,
      linkToken: token,
      createdAt: new Date().toISOString(),
      source: 'link'
    });
    
    // Agregar a la lista de checklists
    await kv.lpush('checklists', checklistId);
    
    // Marcar el enlace como usado
    await kv.set(`link_${token}`, {
      ...(linkData as any), // eslint-disable-line @typescript-eslint/no-explicit-any
      used: true,
      checklistId,
      completedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      id: checklistId,
      message: 'Checklist completado exitosamente' 
    });
  } catch (error) {
    console.error('Error al completar checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
