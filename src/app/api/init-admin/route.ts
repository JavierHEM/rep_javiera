import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un admin
    const userKey = `user:${email}`;
    const existingUser = await redis.get(userKey) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'El usuario admin ya existe' },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario admin
    const adminData = {
      email,
      password: hashedPassword,
      role: 'admin',
      name: name || 'Administrador',
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Guardar admin en Redis
    await redis.set(userKey, adminData);

    // Agregar a la lista de usuarios
    await redis.lpush('users', email);

    return NextResponse.json({
      success: true,
      message: 'Administrador creado exitosamente',
      user: {
        email,
        name: adminData.name,
        role: 'admin',
        createdAt: adminData.createdAt,
        isActive: true
      }
    });

  } catch (error) {
    console.error('Error al crear admin:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
