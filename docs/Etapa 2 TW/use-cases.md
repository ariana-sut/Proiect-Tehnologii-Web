Cazuri de Utilizare (Use Cases) – LocalGuide

Acest document descrie scenariile principale de utilizare ale aplicației LocalGuide, evidențiind fluxul acțiunilor pentru utilizatori și comportamentul sistemului.

Scenariul 1 – Rezervarea unui tur

**Actor principal**: Turist (Maria)
**Descriere**: Maria caută tururi pentru weekend. Filtrează după tema „arhitectură” și data de sâmbătă, deschide un tur de 2 ore și vede că mai sunt 3 locuri libere. Alege 2 locuri, se autentifică și confirmă rezervarea.
**Comportament sistem**: Sistemul scade locurile disponibile la 1, iar rezervarea apare în secțiunea „Rezervările mele” cu statusul „în așteptare”. Dacă un alt utilizator încearcă să rezerve 2 locuri pe aceeași dată, serverul respinge cererea și afișează un mesaj explicativ.

Scenariul 2 – Publicarea unui tur de către un ghid

**Actor principal**: Ghid (Andrei)
**Descriere**: Andrei, ghid voluntar, își creează un cont de ghid și completează profilul. Adaugă un tur nou despre street art, cu preț, durată, punct de întâlnire și trei date disponibile, fiecare cu maximum 12 locuri.
* **Comportament sistem**: Turul devine vizibil în listă imediat după salvare. Ulterior, Andrei poate modifica descrierea sau poate șterge o dată, dar nu poate edita turul altui ghid.

Scenariul 3 – Gestionarea rezervărilor din panoul ghidului

**Actor principal**: Ghid (Andrei)
**Descriere**: Andrei deschide panoul și vede rezervările pentru următorul tur: 9 locuri ocupate din 12, împărțite între 4 rezervări în așteptare. Confirmă trei rezervări și refuză una.
**Comportament sistem**: Locurile aferente rezervării refuzate devin din nou disponibile automat. Turiștii văd noul status în contul lor (și, opțional, primesc o notificare prin e-mail).

Scenariul 4 – Anularea unei rezervări

**Actor principal**: Turist (Ion)
**Descriere**: Ion nu mai poate ajunge la tur. Din secțiunea „Rezervările mele”, el anulează rezervarea cu cel puțin 24 de ore înainte.
**Comportament sistem**: Statusul rezervării devine „anulat”, iar locurile eliberate revin automat în stocul disponibil al turului. Ghidul vede modificarea în panoul propriu de gestiune.
