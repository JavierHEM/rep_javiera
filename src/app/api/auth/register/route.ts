import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, name } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, contraseña y rol son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    if (!['admin', 'usuario'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const userKey = `user:${email}`;
    const existingUser = await redis.get(userKey) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'El usuario ya existe' },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const userData = {
      email,
      password: hashedPassword,
      role,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Guardar usuario en Redis
    await redis.set(userKey, userData);

    // Agregar a la lista de usuarios
    await redis.lpush('users', email);

    // Remover contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = userData;

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
