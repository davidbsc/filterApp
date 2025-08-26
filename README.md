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
  - `adjustments.js`: applica regolazioni di luminosità e contrasto all'immagine.
  - `filters.js`: logica per la selezione dei filtri e la regolazione dei parametri.
  - `filters/`: implementazioni dei singoli filtri (es. `blackWhite.js`, `highContrast.js`, `orangeTeal.js`, `sepia.js`, `coolTone.js`, `blur.js`, `sharpen.js`, `vignette.js`).
  - `imageActions.js`: azioni sull'immagine (download, reset, nuovo progetto).
  - `confirmDialog.js`: finestra di conferma personalizzata per le azioni dell'utente.
  - `toast.js`: notifiche testuali.
  - `main.js`: punto di ingresso che inizializza tutti i moduli.
- **template/**: script di esempio (es. `Orange & Teal.py`) per sperimentare nuovi filtri. Oppure script vecchi e altra roba.

## Come usare

Apri `index.html` in un browser moderno e trascina un'immagine nell'area centrale.
Seleziona un filtro dal pannello di sinistra e regola i parametri nel pannello di destra.
Puoi scaricare l'immagine o creare un nuovo progetto dalle azioni presenti nel footer.

Per impostare manualmente i valori dei cursori, fai clic sul numero accanto allo slider,
inserisci il valore desiderato e premi Enter o clicca fuori dall'input per confermare.
Un clic con il tasto destro sullo slider ripristina il valore di default.
