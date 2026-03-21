# Assets

Recursos estáticos de la aplicación.

## Estructura

```
assets/
├── img/
│   ├── logo.png
│   ├── background.jpg
│   └── icons/
│       ├── user.svg
│       ├── logout.svg
│       └── menu.svg
└── fonts/
    └── (fuentes personalizadas si las hay)
```

## Uso en Componentes

```vue
<!-- Usar rutas relativas en templates -->
<img src="@/assets/img/logo.png" alt="Logo" />

<!-- En scripts -->
import logo from '@/assets/img/logo.png'
```
