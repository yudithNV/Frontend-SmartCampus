# Utils

Funciones utilitarias reutilizables para toda la aplicación.

## Archivos

### `index.js`
Contiene funciones auxiliares de uso común.

## Categorías

### Formateo de Fechas
```javascript
import { formatDate, formatDateTime, formatTime } from '@/utils'

formatDate(new Date())        // "20/3/2026"
formatDateTime(new Date())    // "20/3/2026 14:30:45"
formatTime(new Date())        // "14:30"
```

### Validación
```javascript
import { validateEmail, validatePassword, validatePhone } from '@/utils'

validateEmail('user@ucb.edu.bo')     // true
validatePassword('securePass123')    // true
validatePhone('+591 76543210')       // true
```

### Strings
```javascript
import { capitalize, truncate, getInitials } from '@/utils'

capitalize('juan')            // "Juan"
truncate('Lorem ipsum...', 10) // "Lorem ipsu..."
getInitials('Juan Pérez')     // "JP"
```

### Storage Local
```javascript
import { localStorage_get, localStorage_set, localStorage_remove } from '@/utils'

localStorage_set('user', { name: 'Juan' })
const user = localStorage_get('user')
localStorage_remove('user')
```

### Arrays
```javascript
import { groupBy, sortBy } from '@/utils'

groupBy(usuarios, 'rol')           // Agrupa por rol
sortBy(usuarios, 'nombre', 'asc')  // Ordena por nombre
```

### Números y Moneda
```javascript
import { formatCurrency, formatNumber } from '@/utils'

formatCurrency(1000)   // "$1,000.00"
formatNumber(1000000)  // "1.000.000"
```
