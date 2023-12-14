## CONSULTAS BACK

### Generar las claves privadas y publicas
#### Generar una clave privada RSA de 2048 bits
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048

#### Extraer la clave pública a partir de la clave privada
openssl rsa -pubout -in private.pem -out public.pem
