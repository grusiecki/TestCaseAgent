# Plan implementacji widoku generate-details

## 1. Przegląd
Widok generowania szczegółów test case’ów umożliwia automatyczne generowanie szczegółowych danych (preconditions, steps, expected result) dla każdego przypadku testowego na podstawie ich tytułów. Widok dostarcza użytkownikowi wizualny wskaźnik postępu generowania, możliwość ręcznej edycji wygenerowanych informacji oraz nawigację między kolejnymi test case’ami, z opcją autosave w localStorage oraz finalnego zatwierdzenia i eksportu.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką: `/projects/:projectId/generate-details`.
Widok powinien się pojawiać po kliknięciu "Create test case details" button w @EditTitlesView.tsx


## 3. Struktura komponentów
- **GenerateDetailsView** – główny komponent widoku.
  - **TestCaseList** – komponent odpowiedzialny za renderowanie listy test case’ów.
    - **TestCaseItem** – pojedynczy element listy, wyświetlający tytuł, postęp generowania oraz formularz edycji szczegółów.
  - **ProgressIndicator** – komponent wyświetlający aktualny postęp (np. "Generating details for test case 3 of 15...").
  - **NavigationButtons** – komponent odpowiedzialny za nawigację między test case’ami (Previous, Next) oraz przycisk „Finish & Export” w ostatnim elemencie.
  - **ErrorFallback** – komponent wyświetlający komunikaty o błędach oraz umożliwiający retry generowania.

## 4. Szczegóły komponentów
### GenerateDetailsView
- **Opis**: Główny kontener, który inicjuje proces generowania szczegółów dla wszystkich test case’ów i zarządza globalnym stanem widoku.
- **Główne elementy**: 
  - Renderowanie listy test case’ów.
  - Integracja z API do generowania szczegółów.
  - Obsługa stanu globalnego (np. aktualnie edytowany test case, wskaźnik postępu).
- **Obsługiwane interakcje**: 
  - Inicjalizacja generowania danych przy wczytaniu widoku.
  - Obsługa retry w przypadku błędu.
- **Walidacja**: Sprawdzenie poprawności otrzymanych danych z API oraz kompletności informacji dla każdego test case.
- **Typy**: Wykorzystuje typy `GenerateDetailsCommand` oraz `TestCaseDetailsDTO` z pliku `src/types.ts`.
- **Propsy**: Identyfikator projektu (pobrany z route parameters).

### TestCaseList
- **Opis**: Komponent listy, który iteracyjnie renderuje wszystkie test case’y przekazane z widoku głównego.
- **Główne elementy**:
  - Pętla renderująca komponent `TestCaseItem` dla każdego elementu listy.
- **Obsługiwane interakcje**: Kliknięcia w poszczególne elementy listy w celu przełączenia aktywnego test case.
- **Walidacja**: Upewnia się, że lista nie jest pusta i zawiera maksymalnie 20 test case’ów.
- **Typy**: Lista elementów wykorzystująca struktury typu `TestCaseDetailsDTO` rozszerzone o flagi statusu (np. loading, error, success).
- **Propsy**: Lista test case’ów, callback do zmiany aktywnego indeksu.

### TestCaseItem
- **Opis**: Reprezentacja pojedynczego test case’u, wyświetlająca tytuł, pola do edycji szczegółów oraz wskaźnik statusu generowania.
- **Główne elementy HTML**:
  - Nagłówek z tytułem test case’u.
  - Formularz edycji zawierający pola: preconditions (textarea), steps (textarea), expected result (textarea).
  - Wskaźnik postępu (np. spinner lub pasek postępu).
- **Obsługiwane interakcje**:
  - Edycja pól formularza.
  - Zapis lokalny (autosave) po edycji.
- **Walidacja**:
  - Sprawdzenie, czy pola nie są puste (w przypadku wymaganych danych).
  - Walidacja formatu danych zgodnie z wymaganiami API.
- **Typy**: `TestCaseDetailsDTO` oraz dodatkowy typ `TestCaseViewModel` z polami: `status: "pending" | "loading" | "error" | "completed"` oraz opcjonalnym `errorMessage?: string`.
- **Propsy**: Dane test case’u, funkcje aktualizujące dane, status generowania.

### ProgressIndicator
- **Opis**: Komponent wyświetlający informacje o aktualnym postępie generacji informacji.
- **Główne elementy**: Tekst (np. "Generating details for test case 3 of 15...")
- **Obsługiwane interakcje**: Aktualizacja w czasie rzeczywistym na podstawie stanu widoku.
- **Typy**: Prosty typ liczbowy dla indeksu oraz całkowita liczba test case’ów.
- **Propsy**: Aktualny indeks oraz łączna liczba test case’ów.

### NavigationButtons
- **Opis**: Komponent odpowiedzialny za nawigację między test case’ami oraz finalne zatwierdzenie i eksport danych.
- **Główne elementy**:
  - Przycisk 'Previous' – przechodzi do poprzedniego test case’u.
  - Przycisk 'Next' – przechodzi do następnego test case’u.
  - Przycisk 'Finish & Export' – widoczny na ostatnim elemencie, inicjuje finalny proces eksportu.
- **Obsługiwane interakcje**: Kliknięcia zmieniające aktywny test case lub wysyłające finalne dane do API.
- **Walidacja**: Aktywność przycisków zależna od walidacji poprawności danych w aktualnym teście.
- **Typy**: Prosty licznik i funkcje callback.
- **Propsy**: Aktualny indeks, funkcje zmiany indeksu, status walidacji danych.

### ErrorFallback
- **Opis**: Komponent wyświetlający komunikat o błędzie oraz opcję ponowienia generacji szczegółów.
- **Główne elementy**: Komunikat o błędzie, przycisk Retry.
- **Obsługiwane interakcje**: Retry – ponowna próba generacji.
- **Walidacja**: Warunek wyświetlania tylko w przypadku błędu.
- **Typy**: Prosty komponent bez dodatkowych typów.
- **Propsy**: Callback do funkcji retry.

## 5. Typy
- `GenerateDetailsCommand` – zawiera pola: `title` oraz `context` (zawierające kontekst z wcześniejszych danych test case’u).
- `TestCaseDetailsDTO` – zawiera pola: `preconditions`, `steps`, `expected_result`.
- `TestCaseViewModel` – rozszerzenie `TestCaseDetailsDTO` o dodatkowe pola: `status: "pending" | "loading" | "error" | "completed"` oraz opcjonalne `errorMessage?: string`.

## 6. Zarządzanie stanem
- Użycie custom hooka (np. `useGenerateDetails`) do zarządzania stanem listy test case’ów, aktualnie wybranego test case’u oraz stanów ładowania/edycji.
- Stan globalny widoku: 
  - Lista test case’ów z danymi wygenerowanymi z API i modyfikacjami użytkownika.
  - Aktualny indeks aktywnego test case’u.
  - Flagi statusu: `loading`, `error`, `success`.
- Autosave: Mechanizm zapisujący stan do localStorage na bieżąco.

## 7. Integracja API
- Wywołanie API: POST z danymi `GenerateDetailsCommand` dla każdego test case’u.
- Oczekiwana odpowiedź: dane typu `TestCaseDetailsDTO`.
- Walidacja danych odpowiedzi przed aktualizacją stanu widoku.
- Obsługa retry w przypadku błędów komunikacji lub walidacji odpowiedzi.

## 8. Interakcje użytkownika
- Automatyczne rozpoczęcie generowania szczegółów po załadowaniu widoku.
- Nawigacja między test case’ami przez przyciski Previous/Next.
- Ręczna edycja pól formularza dla każdego test case’u.
- Dynamiczna aktualizacja wskaźnika postępu generacji.
- Mechanizm autosave edytowanych danych do localStorage.
- Finalne zatwierdzenie i eksport danych po kliknięciu „Finish & Export”.

## 9. Warunki i walidacja
- Walidacja pól edycji: pola nie mogą być puste oraz muszą być zgodne z wymaganym formatem.
- Walidacja odpowiedzi API: sprawdzenie obecności pól `preconditions`, `steps`, `expected_result`.
- Weryfikacja liczby test case’ów: maksymalnie 20 elementów.

## 10. Obsługa błędów
- Wykorzystanie komponentu `ErrorFallback` do wyświetlania komunikatów o błędach.
- Możliwość retry generowania dla pojedynczych test case’ów lub całości.
- Informowanie użytkownika o błędach i proponowanie opcji ponowienia.

## 11. Kroki implementacji
1. Utworzenie routing'u i widoku `GenerateDetailsView` na ścieżce `/projects/:projectId/generate-details`.
2. Zbudowanie struktury komponentów: `GenerateDetailsView`, `TestCaseList`, `TestCaseItem`, `ProgressIndicator`, `NavigationButtons`, `ErrorFallback`.
3. Definicja typów i ViewModeli dla test case’ów poprzez rozszerzenie `TestCaseDetailsDTO` o dodatkowe pola statusowe.
4. Implementacja custom hooka `useGenerateDetails` do zarządzania stanem widoku oraz integracji z API.
5. Integracja widoku z API do generowania szczegółów, obsługa walidacji odpowiedzi oraz retry w przypadku błędów.
6. Implementacja formularza edycji w komponencie `TestCaseItem` z mechanizmem autosave do localStorage.
7. Dodanie logiki nawigacji między test case’ami przez komponent `NavigationButtons`.
8. Testowanie i optymalizacja interfejsu pod kątem UX, dostępności i obsługi błędów.
9. Przeprowadzenie testów jednostkowych oraz integracyjnych.
