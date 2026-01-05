# FocusFlow: Productivity Suite 🚀

Una suite de productividad de alto rendimiento diseñada bajo la filosofía de "Deep Work". Este proyecto integra herramientas esenciales —Pomodoro, Notas Markdown, Gestión de Tareas y Seguimiento de Hábitos— en una experiencia de usuario fluida y moderna, priorizando el **minimalismo**, la **velocidad de ejecución** y una estética profesional de **cristalismo (glassmorphism)**.

## ✨ Novedades de la Versión Actual

- **Editor de Notas Markdown "Obsidian-Style"**: Sistema de toma de notas con soporte GFM (GitHub Flavored Markdown), previsualización en tiempo real y tipografía optimizada para lectura prolongada.
- **Tracker de Hábitos Visual**: Registro de constancia con cálculo de rachas (streaks) y visualización de los últimos 7 días para fomentar la disciplina diaria.
- **Arquitectura de Micro-Interacciones**: Implementación de animaciones de entrada (`animate-in`), transiciones de opacidad y feedback sonoro coordinado para una experiencia inmersiva.

## 🚀 Key Features

- **Sistema Pomodoro Inteligente**: Temporizador con transiciones automáticas entre Enfoque y Descanso, visualizado mediante un anillo de progreso SVG dinámico y efectos de brillo (glow) reactivos.
- **Gestión de Tareas con Feedback Multi-sensorial**: Lista de tareas reactiva que utiliza sonidos pop/delete y micro-animaciones para validar objetivos cumplidos.
- **Navegación Flotante Inteligente**: Barra de navegación con desenfoque de fondo (`backdrop-blur`) y estados activos resaltados que optimiza el espacio útil de la pantalla.
- **Visualizador de Calendario**: Componente de alta densidad informativa para la gestión temporal y visualización anual.

## 🛠 Tech Stack

- **Frontend**: React 18+, Vite
- **Styling**: TailwindCSS (Utility-first CSS) & Tailwind-animate
- **Componentes**: Shadcn UI (Radix UI)
- **Procesamiento Markdown**: React-markdown & Remark-GFM
- **Multimedia**: Use-sound para feedback auditivo (Audio UX)
- **Tipado**: TypeScript (Desarrollo robusto y escalable)
- **Iconografía**: Lucide React

## 🏗 Project Structure

```text
src/
├── components/
│   ├── ui/             # Componentes base (Button, Card, Textarea, etc.)
│   ├── Pomodoro.tsx    # Lógica de estados y temporizador circular
│   ├── Notes.tsx       # Editor Markdown con Preview dual y Sidebar
│   ├── TaskList.tsx    # Gestión de To-Dos y feedback sonoro
│   ├── HabitsList.tsx  # Sistema de seguimiento de rachas y hábitos
│   ├── Calendar.tsx    # Visualización de fechas y calendario anual
│   └── FloatingNav.tsx # Navegación contextual persistente
├── assets/             # Recursos de audio (.mp3) y multimedia
├── lib/utils.ts        # Utilidades de Tailwind (clsx + tailwind-merge)
└── App.tsx             # Orquestador dinámico de secciones

```

## 🎯 Lógica Destacada

- **Refinamiento de Renderizado**: Uso de estados locales optimizados para el cambio de modos (Editor vs Preview) sin recargas de página.
- **Estética "Glass"**: Aplicación de capas de transparencia y bordes definidos (`border-white/5`) para lograr una interfaz moderna y limpia.
- **Responsive Design**: Adaptación de componentes complejos (como el sidebar de notas y el tracker de hábitos) para mantener la funcionalidad en diversos tamaños de ventana.

## 🔮 Future Roadmap

- [ ] **Persistencia Local (LocalStorage)**: Guardado automático de notas y tareas para mantener la sesión del usuario.
- [ ] **Ambient Soundscape**: Integración de sonidos de ambiente (lluvia, ruido blanco, fuego) para mejorar la concentración.
- [ ] **Sistema de Confeti**: Micro-animación al completar todas las tareas diarias o rachas de hábitos.

---

Desarrollado con enfoque en la **Calidad de Código** y **User Experience**. FocusFlow demuestra la capacidad de crear herramientas complejas con una UI intuitiva y un rendimiento excepcional.

---
