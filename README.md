# Checklist Crell - Sistema de Formularios

Una aplicación web moderna para crear y gestionar checklists de instalación RVE para Crell.

## 🚀 Características

- ✅ Formulario completo de checklist con todos los campos necesarios
- 💾 Almacenamiento en Vercel KV (Redis)
- 🖨️ Funcionalidad de impresión/PDF
- 📱 Diseño responsive
- 🎨 Interfaz moderna con gradientes y animaciones
- 📊 Vista de checklists guardados
- 📤 Exportación a CSV

## 🛠️ Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Lucide React** - Iconos
- **Vercel KV** - Base de datos Redis
- **Vercel** - Hosting y despliegue

## 📋 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd checklist-crell
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Vercel KV

1. Ve a tu dashboard de Vercel
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Storage** > **Create Database** > **KV**
4. Crea tu base de datos KV
5. Copia las variables de entorno que se generan

### 4. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
KV_REST_API_URL=tu_kv_rest_api_url_aqui
KV_REST_API_TOKEN=tu_kv_rest_api_token_aqui
KV_REST_API_READ_ONLY_TOKEN=tu_kv_read_only_token_aqui
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🚀 Despliegue en Vercel

### 1. Conectar con Vercel

```bash
npm install -g vercel
vercel
```

### 2. Configurar variables de entorno en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Settings** > **Environment Variables**
3. Agrega las variables de entorno de KV:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 3. Desplegar

```bash
vercel --prod
```

## 📱 Uso de la Aplicación

### Crear un Checklist

1. Ve a la página principal (`/`)
2. Completa todos los campos del formulario
3. Haz clic en "Guardar en Vercel"
4. El checklist se guardará automáticamente

### Ver Checklists Guardados

1. Haz clic en "Ver Checklists Guardados"
2. Podrás ver todos los checklists guardados
3. Exportar a CSV para análisis externo

### Imprimir/Generar PDF

1. Completa el formulario
2. Haz clic en "Imprimir / PDF"
3. Usa la función de impresión del navegador para guardar como PDF

## 🗂️ Estructura del Proyecto

```
checklist-crell/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── save-checklist/
│   │   │       └── route.ts          # API para guardar/obtener checklists
│   │   ├── checklists/
│   │   │   └── page.tsx              # Página de lista de checklists
│   │   ├── globals.css               # Estilos globales
│   │   ├── layout.tsx                # Layout principal
│   │   └── page.tsx                  # Página principal (formulario)
│   └── components/
│       ├── ChecklistForm.tsx         # Componente del formulario
│       └── ChecklistList.tsx         # Componente de lista de checklists
├── public/                           # Archivos estáticos
├── package.json                      # Dependencias del proyecto
└── README.md                         # Este archivo
```

## 🔧 Configuración Avanzada

### Personalizar Estilos

Los estilos están definidos usando Tailwind CSS. Puedes personalizar:

- Colores en `tailwind.config.js`
- Estilos globales en `src/app/globals.css`
- Componentes específicos en cada archivo `.tsx`

### Agregar Nuevos Campos

1. Actualiza la interfaz `FormData` en `ChecklistForm.tsx`
2. Agrega el campo al estado inicial `initialFormData`
3. Crea el input correspondiente en el JSX
4. Actualiza la API route si es necesario

### Modificar la Base de Datos

La aplicación usa Vercel KV. Para cambiar la estructura de datos:

1. Modifica la API route en `src/app/api/save-checklist/route.ts`
2. Actualiza los componentes que consumen los datos
3. Considera migrar datos existentes si es necesario

## 🐛 Solución de Problemas

### Error de Conexión a KV

- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que tu proyecto Vercel tenga acceso a KV
- Revisa los logs de Vercel para más detalles

### Problemas de Estilos

- Verifica que Tailwind CSS esté configurado correctamente
- Asegúrate de que las clases CSS estén siendo aplicadas
- Revisa la consola del navegador para errores

### Errores de TypeScript

- Ejecuta `npm run build` para verificar errores de tipos
- Asegúrate de que todas las interfaces estén definidas correctamente
- Revisa las importaciones y exportaciones

## 📞 Soporte

Para soporte técnico o preguntas sobre la implementación, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.