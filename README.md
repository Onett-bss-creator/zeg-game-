# Dokumentacja Projektowa: Gra „Labirynt RPG”

## 1. Opis Projektu
**„Labirynt zeg-game”** to dwuwymiarowa gra zręcznościowo-logiczna, uruchamiana bezpośrednio w przeglądarce internetowej. Gracz wciela się w postać maga, którego zadaniem jest przetrwanie w niebezpiecznym labiryncie, eliminacja przeciwników za pomocą czarów, zbieranie zasobów (mikstur), odnalezienie klucza oraz dotarcie do drzwi wyjściowych prowadzących do kolejnych etapów. Gra kończy się pełnym sukcesem po ukończeniu wszystkich dostępnych poziomów lub porażką, gdy punkty życia bohatera spadną do zera.

---

## 2. Struktura Plików Projektu
Projekt składa się z plików źródłowych (HTML, CSS, JS) oraz grafik reprezentujących tekstury obiektów w grze:

├── index.html       
├── style.css        
├── game.js          
├── sciana.png       
├── exit.png         
├── hp_potion.png    
└── mana_potion.png 

---

## 3. Mechanika Gry i Elementy Świata
Gra bazuje na siatce kafelków (ang. *tiles*) o rozmiarze **64x64 piksele**. Plansza ma stałe wymiary **960x640 pikseli** (15 kolumn na 10 wierszy).

### Legendy Mapy (Układ Poziomów)
Poziomy definiowane są za pomocą tablic tekstowych w kodzie JavaScript. Każdy znak odpowiada jednemu kafelkowi:

| Znak | Element | Opis mechaniczny |
| :---: | :--- | :--- |
| `#` | **Ściana** | Blokuje ruch gracza, przeciwników oraz pocisków. |
| `P` | **Gracz** | Miejsce startowe bohatera na danym poziomie. |
| `E` | **Przeciwnik** | Potwór dążący do zadania obrażeń graczowi. Skaluje się wraz z numerem poziomu. |
| `K` | **Klucz** | Przedmiot niezbędny do otwarcia drzwi wyjściowych. |
| `X` | **Wyjście** | Drzwi kończące poziom (wymagają posiadania klucza). |
| `H` | **Mikstura HP** | Odnawia natychmiastowo 30 punktów zdrowia. |
| `M` | **Mikstura Many** | Odnawia natychmiastowo 40 punktów many. |

---

## 4. Instrukcja Obsługi i Sterowanie
Interfejs gry reaguje na klawiaturę w czasie rzeczywistym.

* **Ruch postaci:** Klawisze `W`, `S`, `A`, `D` lub **Strzałki** (Góra, Dół, Lewo, Prawo).
* **Atak (Rzucenie czaru):** Klawisz `Spacja` (koszt: 10 pkt Many). Pocisk leci w stronę, w którą gracz ostatnio się poruszał.
* **Restart gry:** Klawisz `R` (aktywny wyłącznie na ekranie wygranej `GAME_WON` lub przegranej `GAME_OVER`).

---

## 5. Analiza Techniczna Kodu (`game.js`)

### Główna Pętla Gry
Logika gry napędzana jest przez natywną funkcję przeglądarki `requestAnimationFrame(loop)`, która stale wywołuje dwie kluczowe funkcje:
1. `update()` – przelicza pozycje obiektów, sprawdza kolizje, aktualizuje paski stanu.
2. `draw()` – czyszcząca okno `canvas` i rysująca zaktualizowaną grafikę.
