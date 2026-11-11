Plan de Implementare Tehnică – LocalGuide

Arhitectura tehnică și planul de implementare pentru aplicația LocalGuide integrează modelul de date relațional și structura API RESTful pentru a asigura o execuție robustă, securizată și modulară.

1. Stack Tehnologic și Arhitectură
**Frontend**: Dezvoltat cu HTML5, CSS3 și JavaScript (ES6+) pentru a asigura o interfață responsive, interactivă și validarea client-side a formularelor. Se utilizează biblioteca Leaflet.js împreună cu OpenStreetMap pentru randarea hărților interactive și a punctelor de întâlnire.
**Backend**: Construit pe Node.js utilizând framework-ul Express.js pentru expunerea rutelor RESTful API, gestionarea logicii de business, controlul accesului bazat pe roluri (RBAC) și validarea strictă pe server.
**Persistența Datelor**: Gestionată printr-o bază de date relațională PostgreSQL. Schema este structurată pe tabele normalizate (`users`, `guides`, `tours`, `tour_dates`, `reservations`, `reviews`) pentru a asigura integritatea referențială și a preveni suprarezervările prin utilizarea tranzacțiilor ACID.
**Securitate și Notificări**: Securizarea parolelor se realizează prin hashing cu `bcrypt`. Autentificarea folosește sesiuni sau token-uri JWT. Notificările tranzacționale (confirmări sau anulări de rezervări) sunt asigurate opțional prin intermediul librăriei Nodemailer.
**Colaborare și Versionare**: Fluxul de lucru folosește Git și GitHub, bazat pe ramuri dedicate pentru fiecare funcționalitate, pull request-uri pentru revizuirea codului și sistemul de issues pentru urmărirea sarcinilor.

2. Etapele de Implementare Tehnică

### Etapa 1: Inițierea Proiectului și Configurarea Bazei de Date
* Inițierea repository-ului pe GitHub și stabilirea structurii de directoare pentru server și client.
* Proiectarea și crearea schemei relaționale în PostgreSQL, incluzând scripturile DDL pentru entitățile principale:
  * `users`: stocarea utilizatorilor și a rolurilor (`tourist`, `guide`, `admin`) cu constrângeri de unicitate pe email.
  * `guides`: profilul extins al ghizilor relaționat prin cheie străină (`user_id`).
  * `tours` și `tour_dates`: definirea tururilor tematice și a sesiunilor calendaristice asociate, incluzând limitarea numărului maxim de locuri (`max_spots` și `available_spots`).
  * `reservations` și `reviews`: gestionarea stărilor de rezervare (`pending`, `confirmed`, `rejected`, `cancelled`) și a sistemului opțional de recenzii.

### Etapa 2: Dezvoltarea Backend-ului și a Modulului de Autentificare
* Implementarea serverului Express.js și configurarea conexiunii cu baza de date PostgreSQL.
* Dezvoltarea modulului de autentificare (`/api/auth`):
  * `POST /api/auth/register`: înregistrarea conturilor noi cu criptarea parolei prin `bcrypt` și rol implicit de turist.
  * `POST /api/auth/login`: generarea sesiunii sau a token-ului de acces.
  * `POST /api/auth/logout`: invalidarea sesiunii curente.
* Implementarea middleware-urilor de securitate pentru verificarea rolurilor (turist, ghid, administrator) și protejarea rutelor private.

### Etapa 3: Implementarea Serviciilor RESTful pentru Tururi și Rezervări
* Dezvoltarea rutei `/api/tours`:
  * `GET /api/tours`: filtrare dinamică după temă, preț, dată și durată folosind query parameters.
  * `GET /api/tours/{id}`: preluarea detaliilor complete ale unui tur și a datelor sale calendaristice.
  * `POST /api/tours`, `PUT /api/tours/{id}`, `DELETE /api/tours/{id}`: operațiuni CRUD restricționate pentru ghizii creatori și administratori.
* Dezvoltarea rutei critice pentru rezervări (`/api/reservations`):
  * `POST /api/reservations`: implementarea unei tranzacții SQL atomice care verifică disponibilitatea locurilor (`available_spots`), scade numărul de locuri libere și înregistrează cererea cu statusul `pending` pentru a preveni erorile de concurență și suprarezervarea.
  * `GET /api/reservations/my`: listarea istoricului rezervărilor pentru turistul autentificat.
  * `PUT /api/reservations/{id}/cancel`: anularea rezervării cu cel puțin 24 de ore înainte și eliberarea automată a locurilor în stocul turului.

### Etapa 4: Dezvoltarea Panoului pentru Ghizi și a Componentei Frontend
* Conectarea interfeței HTML5/CSS3/JavaScript cu endpoint-urile backend.
* Implementarea paginilor de listare, căutare și filtrare a tururilor, alături de paginile de detaliu și formularele de rezervare.
* Dezvoltarea panoului dedicat ghizilor (`/api/guide`):
  * `GET /api/guide/reservations`: vizualizarea listei de participanți și a cererilor în așteptare pentru tururile proprii.
  * `PUT /api/guide/reservations/{id}/status`: acceptarea sau refuzul rezervărilor, cu actualizarea automată a stocului de locuri în cazul refuzului.
* Integrarea opțională a Leaflet.js pentru afișarea hărților și a Nodemailer pentru trimiterea notificărilor automate prin e-mail.

### Etapa 5: Testare, Documentare și Livrare
* Rularea testelor manuale și automate pe rutele API și pe fluxurile bazate pe roluri.
* Popularea bazei de date cu seturi de date de test (mock data) pentru a asigura o demonstrație fluidă.
* Finalizarea documentației tehnice a proiectului (`README.md`, cerințe, arhitectură, model de date și use-cases) și pregătirea release-ului final pe GitHub.

3. Distribuția Responsabilităților în Echipă

**Toth Ioana-Alexia** (`ioana.toth06@e-uvt.ro`): Responsabilă de arhitectura backend și a bazei de date, incluzând crearea tabelelor și relațiilor în PostgreSQL, implementarea API-ului RESTful, logica tranzacțională a rezervărilor, sistemul de autentificare cu `bcrypt` și validările stricte pe server.
**Timiș Dana-Alexandra**: Coordonarea frontend-ului și UX-ului, implementarea structurii paginilor, a designului responsive, a formularelor interactive cu validare, a sistemului de listare și filtrare a tururilor, precum și a fluxului de rezervare client-side.
**Șut Ariana**: Gestionarea panoului ghidului, a modulului de recenzii, a integrării opționale cu Nodemailer pentru e-mailuri, a testării componentelor, scrierii fișierului `README.md`, a publicării aplicației și a organizării generale a repository-ului pe GitHub.
