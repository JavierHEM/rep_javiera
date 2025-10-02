import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario en Redis
    const userKey = `user:${email}`;
    const userData = await redis.get(userKey) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, userData.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Usuario autenticado exitosamente
    const { password: _password, ...userWithoutPassword } = userData;
    
    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
