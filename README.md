# FocusFlow: Productivity Suite 🚀

Una suite de productividad de alto rendimiento diseñada bajo la filosofía de "Deep Work". Este proyecto integra herramientas esenciales —Pomodoro, Notas Markdown, Gestión de Tareas, Seguimiento de Hábitos, Calendario Anual y Configuraciones Personalizables— en una experiencia de usuario fluida y moderna, priorizando el **minimalismo**, la **velocidad de ejecución** y una estética profesional de **cristalismo (glassmorphism)**.

## ✨ Funcionalidades de la Versión Actual

- **Autenticación Segura**: Inicio de sesión con email y contraseña utilizando Appwrite para almacenamiento seguro de datos.
- **Dashboard Interactivo**: Pantalla principal con frases motivadoras aleatorias, estadísticas de productividad (tareas completadas, hábitos realizados, tiempo de enfoque), y navegación rápida a todas las secciones.
- **Sistema de Niveles y XP**: Gamificación completa con puntos de experiencia por completar tareas (10 XP) y hábitos (15 XP), niveles automáticos y barra de progreso visual.
- **Temporizador Pomodoro Inteligente**: Temporizador con transiciones automáticas entre Enfoque y Descanso, visualizado mediante un anillo de progreso SVG dinámico, estadísticas en tiempo real (sesiones completadas, pausas, tiempo total de enfoque), y controles personalizables (tiempos de trabajo y descanso).
- **Asignación de Tareas al Pomodoro**: Vinculación directa de tareas específicas a sesiones de temporizador con indicadores visuales y actualización automática del progreso.
- **Música Zen**: Sección de sonidos ambientales (lluvia, fuego, viento, ruido blanco) para sesiones de enfoque con controles intuitivos y estados visuales activos.
- **Títulos de Pestaña Dinámicos**: Actualización automática del título de la pestaña según el estado del Pomodoro (Enfoque/Descanso/Pausado).
- **Gestión de Tareas Interactiva**: Lista de tareas reactiva con sonidos de feedback (completar y eliminar), persistencia en la nube con Appwrite, y animaciones micro-interactivas para una experiencia inmersiva.
 - **Tracker de Hábitos Avanzado**: Seguimiento de hábitos diarios con cálculo automático de rachas (streaks), visualización de los últimos 7 días, persistencia de datos completados, y eliminación de hábitos con confirmación.
- **Objetivos Anuales**: Seguimiento de metas a largo plazo con secciones de objetivos pendientes y completados, sonidos épicos de logro y persistencia en la nube.
- **Editor de Notas Markdown "Obsidian-Style"**: Sistema de toma de notas con soporte GFM (GitHub Flavored Markdown), previsualización en tiempo real, tipografía optimizada para lectura prolongada y sidebar para navegación.
- **Visualizador de Calendario Anual**: Componente de alta densidad informativa para la gestión temporal, mostrando todos los meses del año actual con énfasis en el mes corriente.
- **Temas Avanzados**: Sistema de temas completo con opciones claro/oscuro/sistema, además de temas ambientales "Bosque" (verde) y "Océano" (azul) con variables CSS personalizadas.
- **Configuraciones Personalizables**: Panel de ajustes con cambio de tema, controles de sonido, auto-inicio de descansos, y opción de cierre de sesión.
- **Navegación Flotante Inteligente**: Barra de navegación con desenfoque de fondo (backdrop-blur) y estados activos resaltados que optimiza el espacio útil de la pantalla.
- **Arquitectura de Micro-Interacciones**: Implementación de animaciones de entrada (animate-in), transiciones de opacidad, feedback sonoro coordinado y efectos de brillo (glow) reactivos para una experiencia inmersiva.
- **Sistema de Celebraciones**: Animaciones de confeti espectaculares al completar tareas, hábitos y subir de nivel en el sistema XP.
- **Persistencia Local Offline**: Funcionalidad completa sin conexión con localStorage para tareas y notas, sincronización automática al reconectar.
- **Exportación de Datos**: Herramienta completa para descargar copias de seguridad de todos los datos en formato JSON.
- **Plantillas de Hábitos Inteligentes**: Biblioteca de hábitos predefinidos organizados por categorías (Salud, Aprendizaje, Bienestar) con interfaz intuitiva.

## 🚀 Key Features

- **Dashboard Interactivo**: Pantalla de bienvenida con frases motivadoras, estadísticas de productividad y navegación intuitiva.
- **Sistema de Gamificación XP**: Puntos de experiencia, niveles automáticos y barra de progreso para mantener la motivación.
- **Sistema Pomodoro con Estadísticas**: Temporizador circular con progreso visual, estadísticas detalladas y configuración personalizable.
- **Asignación Inteligente de Tareas**: Vinculación directa de tareas a sesiones Pomodoro con indicadores visuales.
- **Música Zen Ambiental**: Biblioteca de sonidos ambientales para mejorar la concentración durante las sesiones.
- **Títulos de Pestaña Dinámicos**: Actualización automática del título del navegador según el estado del temporizador.
- **Objetivos Anuales**: Seguimiento de metas a largo plazo con celebración de logros completados.
- **Temas Ambientales Avanzados**: Temas "Bosque" y "Océano" además de los modos claro/oscuro tradicionales.
- **Gestión de Tareas con Persistencia**: CRUD completo de tareas con sonidos y animaciones, sincronizado en la nube.
 - **Seguimiento de Hábitos con Rachas**: Sistema de hábitos con visualización semanal, cálculo de streaks y gestión completa (crear/eliminar).
- **Notas Markdown con Preview**: Editor dual (edición/previsualización) con soporte completo de Markdown.
- **Calendario Anual Interactivo**: Vista completa del año con calendarios mensuales.
- **Autenticación y Seguridad**: Login seguro con Appwrite, protección de datos de usuario.
- **Sistema de Celebraciones**: Animaciones de confeti al completar objetivos y subir niveles.
- **Persistencia Offline**: Funcionalidad completa sin conexión con sincronización automática.
- **Exportación de Datos**: Copias de seguridad completas de todos los datos del usuario.
- **Plantillas de Hábitos**: Biblioteca inteligente de hábitos predefinidos por categorías.

## 🛠 Tech Stack

- **Frontend**: React 19+, Vite, TypeScript
- **Styling**: TailwindCSS (Utility-first CSS) & Tailwind-animate
- **Componentes**: Shadcn UI (Radix UI primitives)
- **Procesamiento Markdown**: React-markdown & Remark-GFM
- **Multimedia**: Use-sound para feedback auditivo (Audio UX)
- **Backend/Auth**: Appwrite (Base de datos y autenticación)
- **Fechas**: Date-fns para manipulación de fechas
- **Iconografía**: Lucide React
- **Tipado**: TypeScript (Desarrollo robusto y escalable)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recomendado) o npm
- Cuenta de Appwrite (para backend y autenticación)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd planner
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure Appwrite**

   - Crea un proyecto en [Appwrite](https://appwrite.io)
   - Configura las colecciones para: tasks, habits, notes, goals
   - Actualiza las credenciales en `src/lib/appwrite.ts`

4. **Add audio files (optional)**

   - Coloca archivos de audio ambientales en `src/assets/sounds/`
   - Nombres sugeridos: `rain.mp3`, `fire.mp3`, `wind.mp3`, `white-noise.mp3`

5. **Run the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Build for production**
   ```bash
   pnpm build
   # or
   npm run build
   ```

## 🏗 Project Structure

```text
src/
├── components/
│   ├── ui/             # Componentes base (Button, Card, Textarea, etc.)
│   ├── Dashboard.tsx   # Pantalla principal con estadísticas y navegación
│   ├── Pomodoro.tsx    # Lógica de estados y temporizador circular con estadísticas
│   ├── Zen.tsx         # Controles de sonidos ambientales
│   ├── Goals.tsx       # Seguimiento de objetivos anuales
│   ├── Notes.tsx       # Editor Markdown con Preview dual y Sidebar
│   ├── TaskList.tsx    # Gestión de To-Dos con sonidos y persistencia
│   ├── HabitsList.tsx  # Sistema de seguimiento de rachas y hábitos
│   ├── Calendar.tsx    # Visualización anual de calendarios mensuales
│   ├── Settings.tsx    # Panel de configuraciones (tema, sonidos, logout)
│   ├── Login.tsx       # Autenticación de usuario
│   ├── FloatingNav.tsx # Navegación contextual persistente
│   └── context/
│       ├── AuthContext.tsx  # Gestión de estado de autenticación
│       └── theme-provider.tsx # Proveedor de temas (incluyendo Bosque/Océano)
├── assets/
│   └── sounds/         # Archivos de audio para feedback UX y sonidos ambientales
├── lib/
│   ├── appwrite.ts     # Servicios de Appwrite (tasks, habits, notes, goals)
│   └── utils.ts        # Utilidades de Tailwind y sistema XP
└── App.tsx             # Orquestador dinámico de secciones con autenticación
```

## 🎯 Lógica Destacada

- **Sistema de Gamificación XP**: Implementación de puntos de experiencia con localStorage para persistencia, cálculo automático de niveles y barra de progreso visual.
- **Dashboard Interactivo**: Pantalla principal con estadísticas dinámicas, frases motivadoras aleatorias y navegación contextual a todas las secciones.
- **Objetivos Anuales con Persistencia**: Sistema completo de metas a largo plazo con Appwrite para sincronización, sonidos de celebración y separación visual entre objetivos pendientes y completados.
- **Música Zen Ambiental**: Controles intuitivos de sonidos ambientales con estados visuales activos, preparado para integración de archivos de audio.
- **Asignación Inteligente de Tareas**: Vinculación directa entre tareas y sesiones Pomodoro con actualización automática del progreso y indicadores visuales.
- **Títulos Dinámicos de Pestaña**: Actualización automática del document.title según el estado del temporizador para mantener el contexto del usuario.
- **Temas Ambientales Avanzados**: Sistema de temas extendido con variables CSS personalizadas para temas "Bosque" y "Océano" además de los tradicionales claro/oscuro.
- **Persistencia en la Nube**: Integración completa con Appwrite para sincronización de tareas, hábitos, notas y objetivos entre dispositivos.
- **Refinamiento de Renderizado**: Uso de estados locales optimizados para el cambio de modos (Editor vs Preview) sin recargas de página.
 - **Estética "Glass"**: Aplicación de capas de transparencia y bordes definidos (`border-white/5`) para lograr una interfaz moderna y limpia.
 - **Responsive Design Completo**: Diseño completamente adaptativo con breakpoints optimizados para móviles, tablets y desktop. Navegación flotante inteligente, layouts adaptativos, y componentes que se redimensionan automáticamente manteniendo la funcionalidad completa en todos los dispositivos.
- **Feedback Multi-sensorial**: Combinación de animaciones visuales, sonidos y micro-interacciones para una experiencia de usuario rica.
- **Sistema de Celebraciones Confeti**: Implementación de animaciones canvas-confetti con diferentes intensidades según el tipo de logro (tareas, hábitos, niveles).
- **Persistencia Híbrida Local/Nube**: Arquitectura dual que combina localStorage para funcionamiento offline con sincronización automática a Appwrite.
- **Exportación de Datos Completa**: Sistema de backup que incluye todas las entidades (tareas, hábitos, notas, objetivos) con metadatos y timestamps.
 - **Plantillas de Hábitos Dinámicas**: Sistema de plantillas con categorías organizadas, interfaz modal moderna y capacidad de personalización.
 - **Gestión Completa de Hábitos**: CRUD completo para hábitos incluyendo eliminación con confirmación de usuario, actualización automática de rachas y sincronización en tiempo real con Appwrite.

 ## 📝 Changelog

### v1.0.1 (Latest)
 - ✅ **Eliminar Hábitos**: Añadida funcionalidad completa para eliminar hábitos con confirmación de usuario
 - ✅ **Responsive Design Optimizado**: Mejora completa del diseño responsivo en todos los componentes
 - ✅ **Mejora de UX Móvil**: Optimización de navegación y layouts para dispositivos móviles
 - ✅ **Gestión Completa de Hábitos**: Sistema CRUD completo con eliminación y confirmación

### v1.0.0 (Initial Release)
 - ✅ Suite de productividad completa con todas las funcionalidades principales
 - ✅ Integración completa con Appwrite
 - ✅ Sistema de gamificación XP
 - ✅ Todos los componentes principales implementados

 ## 🔮 Future Roadmap

 - [ ] **Notificaciones Push**: Recordatorios inteligentes para tareas pendientes y sesiones de Pomodoro.
 - [ ] **Estadísticas Avanzadas**: Gráficos detallados de productividad con tendencias históricas y análisis de patrones.
 - [ ] **Modo Oscuro Mejorado**: Variaciones adicionales del tema oscuro con diferentes intensidades.
 - [ ] **Sincronización Multi-dispositivo**: Mejora de la sincronización en tiempo real entre dispositivos conectados.
 - [ ] **Integración con Calendario**: Sincronización con calendarios externos (Google Calendar, Outlook).
 - [ ] **Modo Enfoque Extremo**: Bloqueo temporal de distracciones con pantalla completa y sonidos ambientales.

---

**FocusFlow** es una suite de productividad completa y lista para producción, desarrollada con enfoque en la **Calidad de Código**, **User Experience** y **Gamificación**. Esta aplicación demuestra la capacidad de crear herramientas complejas con una UI intuitiva, rendimiento excepcional y una experiencia de usuario inmersiva.

 **Estado del Proyecto**: ✅ **Completo y Funcional** - Todas las funcionalidades principales y avanzadas implementadas, probadas y optimizadas para diseño responsivo en todos los dispositivos.

---
