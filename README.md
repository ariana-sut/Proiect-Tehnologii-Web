LocalGuide – Platformă de Ghizi Comunitari și Rezervări pentru Tururi Culturale Locale

1. Titlu și Rezumat

**Titlu**: LocalGuide – platformă de ghizi comunitari și rezervări pentru tururi culturale locale
**Problema**: Turismul cultural local depinde în mare parte de ghizi independenți, localnici pasionați, ghizi voluntari sau mici asociații culturale. Aceștia nu au un loc simplu unde să își publice tururile, iar turiștii găsesc greu informații actualizate, disponibilitatea locurilor și o modalitate clară de rezervare. Rezervările se fac azi prin mesaje, apeluri sau pagini de socializare, ceea ce duce la confuzii, locuri suprarezervate și tururi care rămân necunoscute.
**Soluția**: LocalGuide este o aplicație web în care ghizii locali își creează un profil și publică tururi tematice (de exemplu patrimoniu istoric, street art, arhitectură, gastronomie tradițională), cu date și număr limitat de locuri. Turiștii pot căuta tururi, pot rezerva locuri la o dată anume și pot lăsa recenzii după participare. Ghizii își gestionează rezervările dintr-un panou dedicat.
**Context și Utilizatori Vizați**: Aplicația se adresează turiștilor (locali sau din afară), ghizilor comunitari și organizatorilor de inițiative culturale sau educaționale din Timișoara. Contextul este promovarea patrimoniului și a inițiativelor culturale locale prin descoperire și rezervare online, în linie cu tematica „Cultură, patrimoniu și turism local”.

2. Echipa

**Toth Ioana-Alexia** (`ioana.toth06@e-uvt.ro`): Rol principal de Backend și bază de date. Responsabilități inițiale: structura bazei de date, API, autentificare și roluri, logica rezervărilor, validări pe server.
**Timiș Dana-Alexandra**: Rol principal de Frontend și UX. Responsabilități inițiale: structura paginilor, design responsive, formulare, listarea și filtrarea tururilor, pagina de rezervare.
**Șut Ariana**: Rol principal în panou ghid, recenzii, integrare și documentație. Responsabilități inițiale: panoul ghidului, recenzii, notificări e-mail, testare, README, publicare, organizarea repository-ului.

3. Cerințe Generale și Grupuri de Utilizatori

### Obiective Generale

- Oferirea unui spațiu unic în care tururile culturale locale pot fi descoperite și rezervate.
- Reducerea efortului ghizilor în gestionarea rezervărilor și a disponibilității.
- Evitarea suprarezervărilor prin controlul numărului de locuri.

### Grupuri de Utilizatori și Nevoi

**Turist / vizitator**: Nevoi concrete de a găsi rapid tururi după temă, dată, preț sau durată; de a vedea locurile libere; de a rezerva și de a anula simplu; de a-și vedea rezervările; de a citi recenzii.
**Ghid comunitar**: Nevoi concrete de a-și crea un profil; de a publica și de a edita tururi; de a stabili date și număr maxim de locuri; de a confirma sau de a refuza rezervări; de a vedea lista participanților.
**Administrator**: Nevoi concrete de a modera conturile de ghid și conținutul tururilor; de a șterge conținut necorespunzător.

4. Funcționalități Principale

### Obligatorii (MVP)

**Autentificare și roluri**: Înregistrare, autentificare cu verificare de parolă și deconectare pentru cele trei roluri: turist, ghid și administrator.
**Profil de ghid**: Gestionarea informațiilor personale ale ghidului, incluzând nume, prezentare, fotografie și zonă de activitate.
**Gestionarea tururilor**: Posibilitatea ghizilor de a crea, edita și șterge tururi (titlu, descriere, preț, durată, punct de întâlnire, locuri maxime și date disponibile).
**Listare și căutare**: Afișarea tururilor cu opțiuni de căutare și filtrare după temă, preț, dată și durată.
**Pagină de detaliu**: Vizualizarea informațiilor complete despre un tur, a datelor disponibile și a locurilor rămase.
**Sistem de rezervări**: Rezervarea unui număr de locuri la o dată aleasă, însoțită de verificarea automată a disponibilității pe server.
**Istoricul turistului**: Secțiunea „Rezervările mele”, care permite vizualizarea și anularea rezervărilor existente.
**Panou de control pentru ghid**: Vizualizarea listei de participanți, numărul de pe date și posibilitatea de a confirma sau refuza cererile primite.

### Opționale

Trimiterea de notificări prin e-mail pentru evenimentele legate de rezervări (înregistrare, confirmare sau anulare).
Încărcarea de fotografii pentru atracțiile turistice.

5. Tehnologii Propuse

**Frontend**: HTML5, CSS3, JavaScript – Motivație: design responsive, interfață interactivă, formulare cu validare.
**Backend**: Node.js cu Express – Motivație: API REST, logică de rezervare, autentificare.
**Persistență**: Bază de date relațională (PostgreSQL) – Motivație: relații clare între utilizatori, tururi, date și rezervări.
**Autentificare și securitate**: Sesiuni sau JWT, hash de parole cu bcrypt, validare pe server – Motivație: roluri și protecția conținutului.
**Hartă (opțional)**: Leaflet.js cu OpenStreetMap – Motivație: gratuit, fără cont.
**E-mail (opțional)**: Nodemailer – Motivație: notificări de rezervare.
**Versionare și colaborare**: Git și GitHub (ramuri, pull request-uri, issues) – Motivație: lucru în echipă și istoric al contribuțiilor.

6. Riscuri Inițiale și Măsuri

**Suprarezervarea locurilor**: Măsura luată este verificarea și actualizarea locurilor în backend, într-o singură operațiune (tranzacție).
**Dificultăți la autentificare sau securitate**: Măsura luată constă în biblioteci consacrate, hash de parole, validare pe server, teste manuale pe roluri.
**Lipsa datelor la demonstrație**: Măsura luată este un script de populare a bazei cu date de test, pregătit din timp.
**Dependență de servicii externe (e-mail, găzduire)**: Măsura luată este ca acestea să fie funcționalități opționale; aplicația funcționează și fără ele.
