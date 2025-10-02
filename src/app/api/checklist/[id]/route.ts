import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Eliminar el checklist específico
    await redis.del(id);
    
    // Remover de la lista de checklists
    await redis.lrem('checklists', 0, id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Checklist eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Actualizar el checklist
    await redis.set(id, {
      ...data,
      id,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Checklist actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error al actualizar checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
