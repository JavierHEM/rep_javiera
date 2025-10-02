import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { redis } from '@/lib/redis';

// PUT - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const { name, role, isActive, newPassword } = await request.json();

    const userKey = `user:${email}`;
    const userData = await redis.get(userKey) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar datos del usuario
    const updatedUserData = {
      ...userData,
      name: name || userData.name,
      role: role || userData.role,
      isActive: isActive !== undefined ? isActive : userData.isActive,
      updatedAt: new Date().toISOString()
    };

    // Si se proporciona nueva contraseña, hashearla
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
          { status: 400 }
        );
      }
      updatedUserData.password = await bcrypt.hash(newPassword, 12);
    }

    // Guardar usuario actualizado
    await redis.set(userKey, updatedUserData);

    // Remover contraseña de la respuesta
    const { password, ...userWithoutPassword } = updatedUserData;

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;

    const userKey = `user:${email}`;
    const userData = await redis.get(userKey) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar usuario
    await redis.del(userKey);

    // Remover de la lista de usuarios
    await redis.lrem('users', 0, email);

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
