# Image Filter Editor

Un'applicazione web semplice per caricare un'immagine e applicare dei filtri base.
Il codice è stato strutturato in modo modulare per facilitare la manutenzione e la
scalabilità.

## Struttura del progetto

- **index.html**: layout dell'applicazione e collegamenti a stili e script.
- **css/styles.css**: contiene tutti gli stili dell'interfaccia.
- **js/**: cartella con i diversi moduli JavaScript.
  - `elements.js`: raccoglie i riferimenti agli elementi del DOM.
  - `state.js`: mantiene lo stato corrente dell'applicazione.
  - `dragDrop.js`: gestione del caricamento dell'immagine tramite drag & drop.
  - `filters.js`: logica per la selezione dei filtri e la regolazione dei parametri.
  - `imageActions.js`: azioni sull'immagine (download, reset, nuovo progetto).
  - `toast.js`: notifiche testuali.
  - `main.js`: punto di ingresso che inizializza tutti i moduli.

## Come usare

Apri `index.html` in un browser moderno e trascina un'immagine nell'area centrale.
Seleziona un filtro dal pannello di sinistra e regola i parametri nel pannello di destra.
Puoi scaricare l'immagine o creare un nuovo progetto dalle azioni presenti nel footer.
