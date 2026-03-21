# Services

Aquí se encuentran los servicios de API y lógica de negocio.

## Archivos

### `api.js`
Contiene funciones para hacer llamadas a la API backend.

**Uso:**

```javascript
import { userService, adminUserService, newsService } from '@/services/api'

// Ejemplo: Obtener todos los usuarios (admin)
const usuarios = await adminUserService.getAll()

// Ejemplo: Crear un usuario
const nuevoUsuario = await adminUserService.create({
  nombre: 'Juan',
  email: 'juan@ucb.edu.bo',
  tipo: 'Estudiante'
})
```

## Estructura

- **userService** - Autenticación y perfil del usuario
- **adminUserService** - Gestión de usuarios (admin)
- **newsService** - Gestión de noticias
- **reservationService** - Gestión de reservas
