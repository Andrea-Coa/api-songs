# Songs microservice

Proyecto Final Cloud Computing.

Microservicio de canciones para API de streaming de música.

## Missing:

- Fix get by genre: usar scan, genre ya no está indexado.

- serverless functions: declarar lambdas en `serverless.yml`

## Estructura de una canción

```json
{
    "artist_email": "artirst@example.com",
    "name#album_name#genre#year": "song#album#pop#2020",
    "uuid": "1234abcd1234abcd",
    "genre": "pop",
    "artist_name": "artist",
    "data": {
        "name": "song name",
        "lyrics": "la la la",
        "duration": 185,
        "year": 2020,
        "explicit": false
    }
}
```

- `artist_email`: llave de partición primaria
- `name#album_name#genre#year`: llave de ordenación primaria
- `uuid`: GSI
- `genre`: GSI
- `artist_name`: GSI

## Métodos

### GET all

---

### **GET by name**

Hacer SCAN en `name#album_name#genre#year`.

**Request body:**

```json
{
    "name":"please please"
}
```

---


### **GET by ID**

Query en `uuid`.

**Request body:**

```json
{
    "uuid":"1234abcd1234abcd"
}
```

---

### **GET by artist_email**

Query en `artist_email`.

**Request body:**

```json
{
    "artist_email":"sabrina@example.com"
}
```

---

### **GET by genre**

Query en `genre`.

**Request body:**

```json
{
    "genre":"soft rock"
}
```

---

### **POST**

Sólo permitido a artistas, verificar con token.

Enviar como body la [estructura mencionada anteriormente](#estructura-de-una-canción).