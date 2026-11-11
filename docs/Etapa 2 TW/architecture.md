Arhitectura Sistemului – LocalGuide

Prezentul document definește arhitectura tehnică a aplicației LocalGuide, specificând organizarea modulară, componentele sistemului, fluxul de cereri și mecanismele de securitate și integritate a datelor.

1. Arhitectura pe Straturi (Layered Architecture)

Aplicația este proiectată pe un model client-server decuplat, organizat în trei straturi logice distincte:

**Presentation Layer (Frontend)**:
  **Tehnologii**: HTML5, CSS3, JavaScript (Vanilla ES6+).
  **Responsabilități**: Renderizarea dinamică a interfeței, manipularea DOM-ului, colectarea datelor din formulare și gestionarea comunicării asincrone cu serverul prin intermediul `fetch` API.
  **Componente grafice și rute**: Interfață de tip Single Page / Multi-Page adaptivă (Responsive Design), integrare cu Leaflet.js și OpenStreetMap pentru reprezentarea hărților locale.

**Application Layer / Business Logic (Backend)**:
  **Tehnologii**: Node.js, Express.js.
  **Responsabilități**: Expunerea interfeței RESTful API, rutarea cererilor HTTP, implementarea logicii de business (validarea stocurilor, restricționarea accesului pe bază de roluri) și gestiunea sesiunilor.
  **Servicii externe / integrate**: Modulul Nodemailer pentru expedierea asincronă a e-mailurilor tranzacționale.

**Persistence Layer (Baza de Date)**:
  **Tehnologii**: PostgreSQL.
  **Responsabilități**: Gestiunea datelor relaționale, asigurarea integrității referențiale (prin constrângeri de tip Foreign Key și Check) și garantarea atomicității tranzacțiilor financiare/de rezervare prin mecanismul de tip ACID.

2. Fluxul de Comunicație și Rutele API

**Protocol de transport**: HTTP/HTTPS pentru toate interacțiunile dintre client și server.
**Formatul payload-ului**: Schimbul de date se face exclusiv în format **JSON** (JavaScript Object Notation).
**Ciclul unei cereri (Request Lifecycle)**:
  1. Clientul trimite o cerere HTTP (ex: `POST /api/reservations`) incluzând token-ul de autentificare în header.
  2. Middleware-ul de securitate de pe server validează token-ul și verifică rolul utilizatorului (ex: rolul de `tourist`).
  3. Controlerele din Express procesează datele și inițiază o interogare tranzacțională către PostgreSQL.
  4. Serverul returnează un cod de status HTTP corespunzător (ex: `201 Created`, `400 Bad Request`, `403 Forbidden`) împreună cu răspunsul JSON.

3. Mecanisme de Securitate și Validare

**Securizarea Credențialelor**: Niciodată nu sunt stocate parole în clar. Se utilizează algoritmul de hashing **bcrypt** la înregistrare și la verificarea autentificării.
**Controlul Accesului Bazat pe Roluri (RBAC)**: Rutele backend sunt protejate prin funcții middleware care interceptează cererile și permit accesul doar entităților autorizate (`tourist`, `guide`, `admin`).
**Integritatea Tranzacțională (Concurrency Control)**: Pentru operațiuni critice, cum este rezervarea de locuri, backend-ul utilizează tranzacții SQL izolate pentru a citi și actualiza simultan tabelele `tour_dates` și `reservations`, prevenind anomaliile de tip *race condition* sau suprarezervarea.
