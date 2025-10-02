import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Generar un ID único para este checklist
    const checklistId = `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Guardar en Vercel KV con el ID como clave
    await kv.set(checklistId, {
      ...data,
      id: checklistId,
      createdAt: new Date().toISOString()
    });
    
    // También guardar en una lista para poder recuperar todos los checklists
    await kv.lpush('checklists', checklistId);
    
    return NextResponse.json({ 
      success: true, 
      id: checklistId,
      message: 'Checklist guardado exitosamente' 
    });
  } catch (error) {
    console.error('Error al guardar checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Nueva función para crear enlaces únicos
export async function PUT(request: NextRequest) {
  try {
    const { type = 'rve', metadata = {}, checklistType = 'rve' } = await request.json();
    
    // Generar un token único para el enlace
    const linkToken = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Guardar la información del enlace en KV
    await kv.set(`link_${linkToken}`, {
      type,
      checklistType,
      metadata,
      createdAt: new Date().toISOString(),
      used: false,
      checklistId: null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
    });
    
    // Agregar a la lista de enlaces activos
    await kv.lpush('active_links', linkToken);
    
    return NextResponse.json({ 
      success: true, 
      linkToken,
      url: `${request.nextUrl.origin}/checklist/${linkToken}`,
      message: 'Enlace generado exitosamente' 
    });
  } catch (error) {
    console.error('Error al generar enlace:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Obtener todos los IDs de checklists
    const checklistIds = await kv.lrange('checklists', 0, -1);
    
    // Obtener los datos de cada checklist
    const checklists = await Promise.all(
      checklistIds.map(async (id: string) => {
        const data = await kv.get(id);
        return data;
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      checklists: checklists.filter(Boolean) // Filtrar valores nulos
    });
  } catch (error) {
    console.error('Error al obtener checklists:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
