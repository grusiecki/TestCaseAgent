# Plan implementacji widoku CSV Export

## 1. Przegląd
Widok eksportu CSV umożliwia użytkownikowi pobranie danych test case’ów z projektu w formacie CSV zgodnym z wymaganiami TestRail. Widok jest wywoływany po kliknięciu przycisku "Finish & Export" w komponencie nawigacji, a celem jest prezentacja podsumowania projektu oraz przeprowadzenie akcji eksportu z odpowiednim feedbackiem.

## 2. Routing widoku
Widok zostanie dostępny pod ścieżką `/projects/:id/export`, gdzie `:id` to identyfikator projektu.

## 3. Struktura komponentów
- `CsvExportView` (główny widok eksportu)
  - `ProjectSummary` (komponent wyświetlający informacje o projekcie)
  - `TestCaseList` (komponent listujący test case’y)
  - `ExportButton` (przycisk uruchamiający eksport)
  - `FeedbackMessage` (komponent komunikatów sukcesu/błędów)

## 4. Szczegóły komponentów
### CsvExportView
- Opis: Główny widok łączący wszystkie elementy: prezentację danych projektu, listę test case’ów i funkcję eksportu.
- Elementy: Layout z nagłówkiem, sekcją z podsumowaniem, listą test case’ów oraz przyciskiem eksportu.
- Zdarzenia: Inicjacja eksportu poprzez kliknięcie przycisku, przekierowanie do dashboardu po sukcesie.
- Walidacja: Sprawdzenie obecności danych projektu i test case’ów, weryfikacja poprawności sesji użytkownika.
- Typy: Korzysta z typów `ProjectDTO` oraz `TestCaseDTO`.
- Propsy: Brak (stan zarządzany wewnętrznie lub pobierany z API).

### ProjectSummary
- Opis: Komponent prezentujący kluczowe informacje o projekcie (nazwa, data, ocena, liczba TC).
- Elementy: Tytuł projektu, data utworzenia, informacja o ocenie i liczbie test case’ów.
- Zdarzenia: Brak bezpośrednich interakcji; dane przekazywane jako props.
- Walidacja: Walidacja obecności danych.
- Typy: Wykorzystuje `ProjectDTO`.
- Propsy: `project: ProjectDTO`.

### TestCaseList
- Opis: Komponent wyświetlający listę test case’ów przypisanych do projektu.
- Elementy: Lista elementów z tytułami test case’ów.
- Zdarzenia: Brak interakcji; opcjonalne funkcje do rozwinięcia szczegółów test case’ów.
- Walidacja: Sprawdzenie czy lista nie jest pusta.
- Typy: Wykorzystuje `TestCaseDTO[]`.
- Propsy: `testCases: TestCaseDTO[]`.

### ExportButton
- Opis: Przycisk inicjujący akcję eksportowania danych do CSV.
- Elementy: Button z etykietą "Export".
- Zdarzenia: OnClick wywołujący akcję API do eksportu, przełączanie stanów ładowania.
- Walidacja: Blokowanie przycisku podczas trwania operacji eksportu.
- Typy: Standardowy typ przycisku; opcjonalnie status ładowania typu boolean.
- Propsy: `onExport: () => Promise<void>`, `loading: boolean`.

### FeedbackMessage
- Opis: Komponent odpowiedzialny za wyświetlanie komunikatów sukcesu lub błędów podczas eksportu.
- Elementy: Komunikaty tekstowe z odpowiednim stylem (zielony dla sukcesu, czerwony dla błędu).
- Zdarzenia: Brak interakcji użytkownika.
- Walidacja: Format komunikatu zgodny z wynikiem akcji eksportu.
- Typy: Prosty typ string lub obiekt zawierający status i wiadomość.
- Propsy: `message: string`, `type: success | error`.

## 5. Typy
Nowe typy (ViewModel) mogą obejmować:
- `CsvExportViewModel`:
  - `project: ProjectDTO` - dane podsumowania projektu
  - `testCases: TestCaseDTO[]` - lista test case’ów
  - `exportStatus: idle | loading | success | error` - status eksportu
  - `feedbackMessage?: string` - opcjonalny komunikat dla użytkownika

## 6. Zarządzanie stanem
- W widoku `CsvExportView` wykorzystamy hook `useState` do zarządzania stanem:
  - Przechowywanie danych projektu i test case’ów
  - Stan eksportu (`exportStatus`)
  - Komunikat zwrotny (`feedbackMessage`)
- Opcjonalnie utworzymy custom hook np. `useCsvExport` do obsługi logiki eksportu i wywołań API.

## 7. Integracja API
- Endpoint: GET `/projects/:id/export` (podany w dokumentacji API).
- Żądanie: Wysłanie żądania do API po kliknięciu przycisku export.
- Typ żądania: Brak dodatkowych danych poza identyfikatorem projektu.
- Odpowiedź: CSV generowany po stronie serwera i streamowany do przeglądarki.
- Integracja: Użycie biblioteki do pobierania plików, np. poprzez `fetch` z odpowiednim nagłówkiem i przekierowaniem do pobierania.
- Weryfikacja: Sprawdzenie kodu odpowiedzi, obsługa błędów (np. 401, 404, 500).

## 8. Interakcje użytkownika
- Kliknięcie w przycisk `Export` inicjuje akcję eksportu.
- W trakcie eksportu przycisk jest dezaktywowany i wyświetlany jest status ładowania.
- Po zakończeniu eksportu wyświetlany jest komunikat sukcesu (lub błąd) i użytkownik może zostać przekierowany do dashboardu.

## 9. Warunki i walidacja
- Walidacja obecności danych projektu oraz test case’ów przed wywołaniem eksportu.
- Sprawdzenie poprawności sesji użytkownika i autoryzacji przed wysłaniem żądania.
- Weryfikacja odpowiedzi API: kod statusu, format CSV.

## 10. Obsługa błędów
- Obsługa błędów sieciowych lub serwerowych (np. wyświetlenie komunikatu "Błąd eksportu, spróbuj ponownie")
- Obsługa błędów autoryzacyjnych – przekierowanie do logowania lub wyświetlenie komunikatu o braku dostępu.
- Zabezpieczenie przed wielokrotnym wywołaniem eksportu poprzez blokowanie przycisku podczas operacji.

## 11. Kroki implementacji
1. Utworzenie widoku `CsvExportView` w ramach nowej strony pod ścieżką `/projects/:id/export`.
2. Implementacja komponentu `ProjectSummary` pobierającego dane projektu i wyświetlającego je.
3. Implementacja komponentu `TestCaseList` wyświetlającego listę test case’ów.
4. Implementacja komponentu `ExportButton` z logiką wywołania API i stanem ładowania.
5. Utworzenie komponentu `FeedbackMessage` do wyświetlania komunikatów zwrotnych.
6. Zaimplementowanie hooka `useCsvExport` obsługującego wywołanie endpointu eksportu oraz aktualizację stanu widoku.
7. Integracja komponentów w `CsvExportView` i testowanie przepływu eksportu, weryfikacja poprawności komunikatów i reakcji UI.
8. Przeprowadzenie testów manualnych i e2e, weryfikacja zgodności z wymaganiami bezpieczeństwa i UX.

