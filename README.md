# Events Frontend

## Descripción
Este proyecto es el frontend de la aplicación de gestión de eventos. Está construido con **React**, usando **React Router** para la navegación, **Axios** para la comunicación con el backend y **Tailwind CSS** para estilos.

Permite interactuar con la API del backend para gestionar usuarios, eventos y sesiones.

## Tecnologías
- React
- React
- Axios
- JWT-decode (Autenticacion/Test)
- Tailwind (Diseño)
- Jest (testing)
- Docker / Docker Compose 

## Instalación

1. Clonar el repositorio:

    ```bash
    git clone https://github.com/jimmydmd/events_frontend.git
    cd events_frontend
    ```


2. Instalar dependencias:

    ```bash
    # o yarn install
    npm install
    ```

3. Configurar variables de entorno:

    ```bash
    cp .env.example .env
    ```

## Ejecucion

Levantar el backend en modo desarrollo:

```bash
# o yarn install
npm start
```

O usando Docker Compose:

```bash
docker-compose up --build
```

## Test

Ejecutar tests y generar reporte de cobertura:

```bash
# o yarn test
npm test
```

Los reportes HTML se generan en la carpet coverage/:
```bash
open coverage/lcov-report/index.html
```