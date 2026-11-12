Model de Date și Arhitectură API – LocalGuide

Acest document descrie modelul preliminar de date relațional pentru baza de date PostgreSQL și principalele endpoint-uri ale API-ului RESTful, construite pe baza cerințelor din Etapa 1 a proiectului **LocalGuide**.

1. Entități și Modelul Preliminar de Date (PostgreSQL)

Baza de date relațională este concepută pentru a asigura integritatea datelor, evitarea suprarezervărilor prin tranzacții și gestionarea clară a rolurilor.

### Entități Principale:

1. **`users` (Utilizatori)**
   * Stochează toți utilizatorii aplicației, indiferent de rol.
   * Câmpuri: `id` (PK), `name`, `email` (unique), `password_hash`, `role` (enum: `tourist`, `guide`, `admin`), `created_at`.

2. **`guides` (Profiluri Ghizi)**
   * Extinde informațiile pentru utilizatorii care au rolul de ghid.
   * Câmpuri: `id` (PK), `user_id` (FK -> `users.id`), `bio`, `avatar_url`, `activity_area`.

3. **`tours` (Tururi Tematice)**
   * Tururile publicate de ghizi.
   * Câmpuri: `id` (PK), `guide_id` (FK -> `guides.id`), `title`, `description`, `theme`, `price`, `duration`, `meeting_point`, `created_at`.

4. **`tour_dates` (Date Disponibile pentru Tururi)**
   * Deoarece un tur poate avea loc în mai multe zile, fiecare sesiune are propriul număr de locuri.
   * Câmpuri: `id` (PK), `tour_id` (FK -> `tours.id`), `date_time`, `max_spots`, `available_spots`.

5. **`reservations` (Rezervări)**
   * Legătura dintre turiști și datele disponibile ale tururilor.
   * Câmpuri: `id` (PK), `tour_date_id` (FK -> `tour_dates.id`), `tourist_id` (FK -> `users.id`), `spots_reserved`, `status` (enum: `pending`, `confirmed`, `rejected`, `cancelled`), `created_at`.

6. **`reviews` (Recenzii - Opțional / Extensie)**
   * Permite turiștilor să lase evaluări după participare.
   * Câmpuri: `id` (PK), `tour_id` (FK -> `tours.id`), `tourist_id` (FK -> `users.id`), `rating` (1-5), `comment`, `created_at`.

2. Relații între Entități (Schema Relațională)

**`users` (1) <---> (0..1) `guides`**: Un utilizator poate avea cel mult un profil de ghid (dacă rolul său este `guide`).
**`guides` (1) <---> (n) `tours`**: Un ghid poate crea mai multe tururi tematice.
**`tours` (1) <---> (n) `tour_dates`**: Un tur se poate desfășura la multiple date calendaristice.
**`tour_dates` (1) <---> (n) `reservations`**: O anumită dată a unui tur poate conține mai multe rezervări de la turiști diferiți.
**`users` (1) <---> (n) `reservations`**: Un turist poate face mai multe rezervări la diferite tururi.

3. Principalele Endpoint-uri API (Servicii Propunse)

Backend-ul va expune o serie de rute RESTful organizate pe module:

### A. Autentificare (`/api/auth`)
* `POST /api/auth/register` – Înregistrarea unui cont nou (rol implicit: `tourist`).
* `POST /api/auth/login` – Autentificarea utilizatorului și returnarea token-ului de sesiune/JWT.
* `POST /api/auth/logout` – Deconectarea utilizatorului.

### B. Tururi și Căutare (`/api/tours`)
* `GET /api/tours` – Returnează lista tuturor tururilor cu suport pentru filtre query parameters (temă, preț, dată, durată).
* `GET /api/tours/{id}` – Detaliile complete ale unui tur specific, inclusiv datele calendaristice disponibile și locurile rămase.
* `POST /api/tours` – (Doar pentru Ghizi) Crearea unui tur nou și a datelor aferente.
* `PUT /api/tours/{id}` – (Doar pentru Ghidul creator) Actualizarea detaliilor unui tur.
* `DELETE /api/tours/{id}` – (Ghid/Admin) Ștergerea unui tur.

### C. Rezervări (`/api/reservations`)
* `POST /api/reservations` – (Doar pentru Turiști) Efectuarea unei rezervări pentru un număr de locuri la o dată anume (include tranzacție în BD pentru actualizarea sigură a locurilor disponibile).
* `GET /api/reservations/my` – (Doar pentru Turiști) Vizualizarea listei „Rezervările mele”.
* `PUT /api/reservations/{id}/cancel` – (Doar pentru Turistul titular) Anularea unei rezervări existente cu cel puțin 24 de ore înainte.

### D. Panou Ghid (`/api/guide`)
* `GET /api/guide/reservations` – Vizualizarea rezervărilor primite pentru tururile proprii.
* `PUT /api/guide/reservations/{id}/status` – Confirmarea sau refuzul unei rezervări de către ghid (actualizează automat stocul de locuri dacă este refuzată).
