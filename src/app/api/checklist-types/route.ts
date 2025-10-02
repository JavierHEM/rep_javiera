import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { CHECKLIST_TYPES, ChecklistType } from '@/types/checklist';

const redis = new Redis({
  url: process.env.KV_URL!,
  token: process.env.KV_TOKEN!,
});

export async function GET() {
  try {
    // Obtener tipos de checklist desde Redis
    const types = await redis.get('checklist_types');
    
    if (!types) {
      // Si no existen, crear los tipos por defecto
      const defaultTypes = Object.values(CHECKLIST_TYPES).map(type => ({
        ...type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      await redis.set('checklist_types', defaultTypes);
      return NextResponse.json({ 
        success: true, 
        types: defaultTypes 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      types 
    });
  } catch (error) {
    console.error('Error al obtener tipos de checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newType: ChecklistType = await request.json();
    
    // Validar que el tipo tenga los campos requeridos
    if (!newType.id || !newType.name || !newType.description) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos faltantes' },
        { status: 400 }
      );
    }
    
    // Obtener tipos existentes
    const existingTypes = (await redis.get('checklist_types') || []) as ChecklistType[];
    
    // Verificar que no exista un tipo con el mismo ID
    if (existingTypes.find((type: ChecklistType) => type.id === newType.id)) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un tipo de checklist con este ID' },
        { status: 409 }
      );
    }
    
    // Agregar timestamps
    const typeWithTimestamps = {
      ...newType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Guardar el nuevo tipo
    const updatedTypes = [...existingTypes, typeWithTimestamps];
    await redis.set('checklist_types', updatedTypes);
    
    return NextResponse.json({ 
      success: true, 
      type: typeWithTimestamps,
      message: 'Tipo de checklist creado exitosamente' 
    });
  } catch (error) {
    console.error('Error al crear tipo de checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      );
    }
    
    // Obtener tipos existentes
    const existingTypes = (await redis.get('checklist_types') || []) as ChecklistType[];
    
    // Encontrar y actualizar el tipo
    const typeIndex = existingTypes.findIndex((type: ChecklistType) => type.id === id);
    
    if (typeIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Tipo de checklist no encontrado' },
        { status: 404 }
      );
    }
    
    // Actualizar el tipo
    const updatedType = {
      ...existingTypes[typeIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    existingTypes[typeIndex] = updatedType;
    await redis.set('checklist_types', existingTypes);
    
    return NextResponse.json({ 
      success: true, 
      type: updatedType,
      message: 'Tipo de checklist actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error al actualizar tipo de checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
