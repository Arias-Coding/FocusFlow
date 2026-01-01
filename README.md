# FocusFlow: Productivity Suite

Una suite de productividad minimalista y de alto rendimiento diseñada para optimizar el flujo de trabajo personal. Este proyecto integra herramientas esenciales —Pomodoro, Gestión de Tareas y Seguimiento de Calendario— en una experiencia de usuario fluida y cohesiva, priorizando la velocidad de ejecución y una estética moderna de "dark mode".

## 🚀 Key Features

- **Sistema Pomodoro Inteligente**: Temporizador de enfoque y descanso con transiciones automáticas, feedback visual mediante barras de progreso dinámicas y alertas sonoras para maximizar la concentración.
- **Gestión de Tareas con Feedback Háptico-Visual**: Lista de tareas reactiva que utiliza sonidos personalizados (`use-sound`) y micro-animaciones para validar la compleción de objetivos.
- **Visualizador Anual de Progreso**: Un componente de calendario avanzado y personalizado que permite visualizar el año completo, utilizando lógica de fechas para diferenciar el pasado del presente de forma intuitiva.
- **Navegación Flotante Contextual**: Interfaz de navegación con efectos de desenfoque de fondo (glassmorphism) que optimiza el espacio de trabajo y mejora la inmersión del usuario.
- **Diseño Adaptativo y Accesible**: UI totalmente responsiva construida sobre un sistema de diseño consistente (Shadcn UI), garantizando accesibilidad y estética en cualquier dispositivo.

## 🛠 Tech Stack

- **Frontend**: React 18+, Vite (Arquitectura de alto rendimiento)
- **Styling**: TailwindCSS (Utility-first CSS)
- **Componentes**: Shadcn UI (Basado en Radix UI para máxima accesibilidad)
- **Gestión de Fechas**: Date-fns (Lógica de manipulación temporal robusta)
- **Tipado**: TypeScript (Desarrollo seguro y mantenible)
- **Multimedia**: Use-sound para una experiencia de usuario enriquecida (Audio Feedback)
- **Iconografía**: Lucide React (Icons consistentes y ligeros)

## 📦 Quick Start

1. **Clonar el repositorio**:

```bash
git clone https://github.com/Arias-Coding/focus-flow.git
cd focus-flow

```

2. **Instalar dependencias**:

```bash
npm install
# o
pnpm install

```

3. **Ejecutar en entorno de desarrollo**:

```bash
npm run dev

```

## 🏗 Project Structure

```
src/
├── components/
│   ├── context/        # Contexto de la aplicacion
│   ├── ui/             # Componentes base de Shadcn (Button, Card, Input, etc.)
│   ├── Calendar.tsx    # Lógica de visualización anual y date-fns
│   ├── Pomodoro.tsx    # Máquina de estados del temporizador
│   ├── TaskList.tsx    # Gestión de tareas y feedback sonoro
│   └── FloatingNav.tsx # Sistema de navegación persistente
├── assets/sounds        # Recursos de audio
├── lib/                # Utilidades de configuración (Tailwind merge, etc.)
└── App.tsx             # Orquestador principal de la aplicación

```

## 🎯 Core Logic Highlights

- **Precisión del Timer**: Implementación de limpieza de intervalos en el ciclo de vida de React para prevenir fugas de memoria y asegurar la precisión del tiempo.
- **Conditional Styling**: Uso extensivo de la utilidad `cn` para el manejo dinámico de clases de Tailwind según el estado de la aplicación.
- **State Composition**: Gestión eficiente del estado local para asegurar que cada herramienta funcione de forma independiente sin renders innecesarios.

## 🔮 Future Roadmap

Para elevar la aplicación a un nivel de producto comercial, se planean las siguientes implementaciones:

- **Persistencia con LocalStorage**: Implementar un sistema de guardado automático para que las tareas y configuraciones persistan tras recargar la página.
- **Títulos de Pestaña Dinámicos**: Actualizar el `document.title` en tiempo real para mostrar el progreso del Pomodoro fuera de la aplicación.
- **Personalización de Temas**: Añadir variaciones estéticas como "Bosque" o "Océano" utilizando variables de CSS y el ThemeProvider.
- **Análisis de Datos**: Gráficas de productividad para visualizar las sesiones de enfoque completadas durante la semana.

---

Desarrollado con enfoque en la **Calidad de Código** y **User Experience**. Este proyecto demuestra competencia en el manejo del ecosistema moderno de React y el diseño de interfaces profesionales.
