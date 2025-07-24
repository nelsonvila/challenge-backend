# Decisiones Técnicas y Estrategias

## Funcionamiento General

El servicio lee todos los archivos `.dat` presentes en la carpeta `data` al iniciar, procesando cada línea como un registro de cliente y volcando los datos en la base de datos SQL Server. Además, el sistema queda escuchando la carpeta `data` y procesa automáticamente cualquier nuevo archivo `.dat` que se agregue, asegurando que no se pierda ningún registro.

## Estrategias Utilizadas

- **Procesamiento por lotes y concurrencia:**  
  Se procesan los archivos línea por línea usando streams para evitar cargar archivos grandes en memoria. Los registros se agrupan en lotes (batches) y se insertan concurrentemente usando worker threads, lo que mejora la performance y aprovecha los recursos disponibles.
- **Observador de archivos:**  
  Se utiliza `chokidar` para monitorear la carpeta `data` y disparar el procesamiento automáticamente ante la llegada de nuevos archivos.
- **Tolerancia a errores:**  
  Las líneas corruptas se detectan y se ignoran, quedando registradas en los logs para su posterior análisis.

## Medidas para Performance y Robustez

- **Uso eficiente de memoria:**  
  El procesamiento por streams y lotes evita el uso excesivo de memoria, cumpliendo con los límites del entorno Kubernetes.
- **Concurrencia controlada:**  
  Se limita la cantidad de lotes procesados en paralelo para no saturar la base de datos ni exceder los recursos asignados.
- **Logs informativos:**  
  Se utiliza `pino` para registrar el avance, errores y líneas corruptas, facilitando el monitoreo y troubleshooting.
- **Endpoint de health:**  
  Se expone `/health` para monitorear la disponibilidad del servicio incluso durante el procesamiento intensivo.

## Decisiones frente a Cuellos de Botella

- **I/O y CPU:**  
  El procesamiento por lotes y el uso de múltiples workers permiten balancear la carga entre CPU y operaciones de red.
- **Base de datos:**  
  Se controla la concurrencia para evitar sobrecargar SQL Server. Si se detectan errores de clave duplicada, se loguean y el proceso continúa.
- **Escalabilidad:**  
  El diseño permite ajustar el tamaño de los lotes y la cantidad de workers según los recursos disponibles.

## Consideraciones para Producción

- **Métricas y monitoreo:**  
  Integraría el servicio con AWS CloudWatch para recolectar logs, métricas de progreso, uso de memoria y CPU. Crearía dashboards personalizados en CloudWatch y/o New Relic para visualizar el estado y la performance del sistema en tiempo real, facilitando la detección temprana de problemas.

- **Escalabilidad horizontal:**  
  Para archivos aún más grandes, implementaría procesamiento distribuido usando múltiples pods en Kubernetes (Horizontal Pod Autoscaler) y, si fuera necesario, orquestaría el procesamiento con AWS Step Functions o colas como SQS para distribuir la carga entre servicios.

- **Persistencia de logs y errores:**  
  Centralizaría los logs en AWS CloudWatch Logs o New Relic Logs, y almacenaría las líneas corruptas en un bucket de S3 para su posterior reproceso o auditoría, asegurando trazabilidad y fácil acceso a los datos problemáticos.

- **Gestión de errores global y notificaciones:**  
  Implementaría un manejo de errores más robusto y configuraría alertas automáticas en CloudWatch (Alarmas) o New Relic para notificar incidentes críticos. Además, integraría las notificaciones con un canal de Slack mediante AWS SNS o Webhooks, para que el equipo reciba alertas en tiempo real y pueda actuar rápidamente