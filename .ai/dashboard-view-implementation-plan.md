# Plan implementacji widoku Dashboard

## 1. Przegląd
Widok Dashboard służy do prezentacji projektów użytkownika wraz ze statystykami, umożliwiając przegląd szczegółów każdego projektu, ponowny eksport danych oraz ich usuwanie. Celem widoku jest zapewnienie szybkiego dostępu do informacji o projektach i umożliwienie podstawowych operacji na nich w przyjazny dla użytkownika sposób.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/dashboard`.

## 3. Struktura komponentów
- **DashboardView** – główny komponent widoku, odpowiedzialny za pobieranie danych z API oraz zarządzanie stanem widoku.
  - **ProjectList** – komponent wyświetlający listę projektów.
    - **ProjectCard** – karta pojedynczego projektu zawierająca informacje o nazwie, dacie utworzenia, liczbie test case’ów oraz ocenie.
  - **DashboardStats** – komponent prezentujący wskaźniki statystyczne, takie jak łączna liczba projektów, średnia ocena oraz suma test case’ów.
  - **Pagination** – komponent do nawigacji po stronach listy projektów.
  - **NewProjectButton** – przycisk do tworzenia nowego projektu.

## 4. Szczegóły komponentów
### DashboardView
- **Opis:** Główny kontener widoku dashboard, odpowiedzialny za pobieranie danych, zarządzanie stanem i dystrybucję danych do komponentów potomnych.
- **Elementy:** Kontener, loader, obsługa błędów.
- **Obsługiwane interakcje:** Inicjalne ładowanie projektów, odświeżanie listy, przekierowanie przy kliknięciu karty w celu wyświetlenia szczegółów projektu.
- **Walidacja:** Weryfikacja poprawności danych zwróconych z API, sprawdzenie statusu odpowiedzi HTTP.
- **Typy:** Użycie `ProjectsListResponse` oraz `ProjectDTO` z pliku typów.
- **Propsy:** Brak (komponent główny, pobiera własne dane).

### ProjectList
- **Opis:** Odpowiedzialny za renderowanie listy projektów otrzymanych z API.
- **Elementy:** Lista elementów `<ProjectCard>`, wrapper kontenera, ewentualny komunikat brak wyników.
- **Obsługiwane interakcje:** Kliknięcie w kartę projektu, przekazanie zdarzenia do widoku nadrzędnego.
- **Walidacja:** Sprawdzenie czy lista projektów nie jest pusta.
- **Typy:** Tablica `ProjectDTO`.
- **Propsy:** `projects: ProjectDTO[]`, opcjonalnie funkcja callback przy zmianie wybranej karty.

### ProjectCard
- **Opis:** Reprezentacja pojedynczego projektu w formie karty, wyświetlająca najważniejsze informacje.
- **Elementy:** Nazwa projektu, data utworzenia, liczba test case’ów, ocena, przyciski do akcji (re-export, usuń).
- **Obsługiwane interakcje:** Kliknięcie (nawigacja do szczegółów), akcje przycisków (eksport, usunięcie).
- **Walidacja:** Weryfikacja obecności wymaganych danych (nazwa, data, ilość).
- **Typy:** `ProjectDTO`.
- **Propsy:** `project: ProjectDTO`, callbacki dla akcji (onExport, onDelete, onSelect).

### DashboardStats
- **Opis:** Komponent wyświetlający statystyki związane z projektami użytkownika.
- **Elementy:** Liczba projektów, średnia ocena, łączna liczba test case’ów.
- **Obsługiwane interakcje:** Brak – komponent tylko do prezentacji.
- **Walidacja:** Sumaryczne dane muszą być liczbowe i wyświetlane poprawnie.
- **Typy:** Nowy typ ViewModel np. `DashboardStatsViewModel` z polami: `totalProjects: number`, `averageRating: number`, `totalTestCases: number`.
- **Propsy:** `stats: DashboardStatsViewModel`.

### Pagination
- **Opis:** Komponent umożliwiający nawigację między stronami listy projektów.
- **Elementy:** Przyciski zmiany stron, aktualna strona, możliwe linki do poszczególnych stron.
- **Obsługiwane interakcje:** Kliknięcia przycisków, zmiana strony, emisja zdarzenia do nadrzędnego komponentu.
- **Walidacja:** Aktualna strona nie może być mniejsza niż 1.
- **Typy:** Typ dla ustawień paginacji, np. `PaginationOptions` z polami: `page: number`, `limit: number`, `total: number`.
- **Propsy:** `page: number`, `limit: number`, `total: number`, `onPageChange: (page: number) => void`.

### NewProjectButton
- **Opis:** Przycisk umożliwiający utworzenie nowego projektu i przekierowanie do odpowiedniego formularza.
- **Elementy:** Przycisk, ikona lub dodatkowy tekst.
- **Obsługiwane interakcje:** Kliknięcie powodujące przekierowanie do formularza tworzenia projektu.
- **Walidacja:** Brak dodatkowej walidacji.
- **Typy:** Brak dodatkowych typów.
- **Propsy:** Callback onClick lub bezpośrednie wykorzystanie linku.

## 5. Typy
- **ProjectDTO:** Pochodzący z `src/types.ts` zawiera pola: `id`, `name`, `created_at`, `rating`, `testCaseCount`.
- **ProjectsListResponse:** Struktura odpowiedzi z API, zawiera: `projects`, `page`, `limit`, `total`.
- **DashboardStatsViewModel (nowy typ):**
  - `totalProjects: number`
  - `averageRating: number`
  - `totalTestCases: number`
- **PaginationOptions (nowy typ):**
  - `page: number`
  - `limit: number`
  - `total: number`

## 6. Zarządzanie stanem
Widok wykorzysta lokalny stan komponentu DashboardView. Możliwe użycie hooka `useState` do przechowywania:
- Listy projektów
- Aktualnych statystyk (DashboardStatsViewModel)
- Opcji paginacji
- Stanów ładowania i błędów
Opcjonalnie zostanie stworzony customowy hook np. `useDashboard` do centralizacji logiki pobierania danych i zarządzania stanem.

## 7. Integracja API
DashboardView będzie integrował się z endpointem GET /projects. 
- Żądanie: Metoda GET, nagłówki autoryzacyjne (JWT), brak dodatkowego payloadu
- Odpowiedź: Obiekt `ProjectsListResponse` zawierający listę projektów wraz z danymi statystycznymi.
- Walidacja odpowiedzi: Sprawdzenie statusu 200 oraz poprawności struktury danych. W przypadku błędów należy wyświetlić komunikat użytkownikowi.

## 8. Interakcje użytkownika
- **Ładowanie widoku:** Po wejściu na `/dashboard` widok automatycznie pobiera dane projektów.
- **Kliknięcie w projekt:** Użytkownik może kliknąć na kartę projektu, co przekierowuje do strony szczegółów projektu.
- **Akcja re-export:** Przycisk w karcie umożliwiający ponowne wyeksportowanie danych projektu.
- **Usuwanie projektu:** Przycisk w karcie umożliwiający usunięcie projektu po potwierdzeniu.
- **Zmiana strony w paginacji:** Kliknięcie w przyciski paginacji zmienia widoczną stronę listy projektów.
- **Tworzenie nowego projektu:** Kliknięcie w przycisk New Project przekierowuje do formularza tworzenia nowego projektu.

## 9. Warunki i walidacja
- Walidacja odpowiedzi z API – struktura danych musi odpowiadać typom `ProjectsListResponse` i `ProjectDTO`.
- Weryfikacja obecności obowiązkowych pól przy wyświetlaniu danych w `ProjectCard` (nazwa, data, liczba test case’ów).
- Komponent `Pagination` kontroluje zakres stron, nie umożliwiając przejścia poniżej strony 1.

## 10. Obsługa błędów
- W DashboardView: 
  - Wyświetlenie komunikatu błędu w przypadku niepowodzenia pobrania danych z API.
  - Dodatkowe logowanie błędów (np. wykorzystanie loggera).
  - Obsługa timeoutów i błędnych odpowiedzi HTTP.
- W ProjectCard: Potwierdzenie przed wykonaniem operacji usunięcia projektu.

## 11. Kroki implementacji
1. Utworzenie struktury routingu i komponentu DashboardView pod ścieżką `/dashboard`.
2. Stworzenie komponentów `ProjectList`, `ProjectCard`, `DashboardStats`, `Pagination` oraz `NewProjectButton`.
3. Definicja nowych typów `DashboardStatsViewModel` i `PaginationOptions` oraz wykorzystanie istniejących typów `ProjectDTO` i `ProjectsListResponse`.
4. Implementacja logiki pobierania danych z API w DashboardView (opcjonalnie z custom hookiem `useDashboard`).
5. Integracja poszczególnych komponentów: przekazanie danych z DashboardView do komponentów potomnych.
6. Dodanie walidacji odpowiedzi z API oraz obsługi błędów (wyświetlanie komunikatów).
7. Implementacja akcji użytkownika (nawigacja przy kliknięciu karty, paginacja, akcje na przyciskach).
8. Testy integracyjne komponentów i interakcji użytkownika.
9. Finalne poprawki, optymalizacje oraz dostosowanie stylów przy użyciu Tailwind i Shadcn/ui.


