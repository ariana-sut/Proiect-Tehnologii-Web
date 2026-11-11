Cerințele Sistemului – LocalGuide

Cerințe Funcționale

### Cerințe obligatorii (MVP):
**Autentificare și roluri**: Înregistrare, autentificare cu verificare de parolă și deconectare pentru cele trei roluri: turist, ghid și administrator.
**Profil de ghid**: Gestionarea informațiilor personale ale ghidului, incluzând nume, prezentare, fotografie și zonă de activitate.
**Gestionarea tururilor**: Posibilitatea ghizilor de a crea, edita și șterge tururi (titlu, descriere, preț, durată, punct de întâlnire, locuri maxime și date disponibile).
**Listare și căutare**: Afișarea tururilor cu opțiuni de căutare și filtrare după temă, preț, dată și durată.
**Pagină de detaliu**: Vizualizarea informațiilor complete despre un tur, a datelor disponibile și a locurilor rămase.
**Sistem de rezervări**: Rezervarea unui număr de locuri la o dată aleasă, însoțită de verificarea automată a disponibilității pe server.
**Istoricul turistului**: Secțiunea „Rezervările mele”, care permite vizualizarea și anularea rezervărilor existente.
**Panou de control pentru ghid**: Vizualizarea listei de participanți, numărul de pe date și posibilitatea de a confirma sau refuza cererile primite.

### Cerințe opționale:
* Trimiterea de notificări prin e-mail pentru evenimentele legate de rezervări (înregistrare, confirmare sau anulare).
* Încărcarea de fotografii pentru atracțiile turistice.

Cerințe Nefuncționale

### Securitate și Date:
* Utilizarea unei baze de date relaționale PostgreSQL pentru a menține datele mereu corecte și organizate, prevenind erorile sau duplicarea informațiilor.
* Criptarea parolelor utilizatorilor folosind algoritmul bcrypt.
* Aplicarea de validări stricte direct pe server pentru toate cererile și tranzacțiile.

### Interfață și Experiență (Frontend):
* Dezvoltarea interfeței folosind HTML5, CSS3 și JavaScript pentru a asigura un design responsive și o interacțiune fluidă.
* Integrarea opțională a bibliotecii Leaflet.js cu OpenStreetMap pentru afișarea hărților și a punctelor de întâlnire fără a necesita cont extern.

### Colaborare și Versionare:
* Folosirea sistemului Git și a platformei GitHub pentru gestionarea codului sursă, organizat prin ramuri dedicate, pull request-uri și urmărirea sarcinilor prin issues.
