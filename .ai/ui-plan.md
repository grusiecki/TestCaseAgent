# Architektura UI dla Tester Agent - AI Test Case Generator

## 1. Przegląd struktury UI

System interfejsu użytkownika składa się z szeregu powiązanych widoków, których hierarchia odzwierciedla strukturę API oraz główny przepływ użytkownika. Kluczowe etapy obejmują:
- Wprowadzanie dokumentacji, która inicjuje generowanie tytułów.
- Ekran edytowania tytułów test case'ów, gdzie użytkownik może usuwać, edytować lub dodawać tytuły.
- Generowanie szczegółowych danych test case (preconditions, steps, expected result) na podstawie wybranych tytułów.
- Ekran ekspordu CSV, umożliwiający pobranie wyników zgodnych z TestRail.
Interfejs korzysta z responsywnego designu opartego o Tailwind CSS i komponenty Shadcn/ui, integrując rozwiązania Astro, React oraz mechanizmy uwierzytelniania (Supabase Auth) i obsługi błędów.

## 2. Lista widoków

### 2.1. Dashboard
- **Ścieżka widoku:** `/dashboard`
- **Główny cel:** Przegląd projektów użytkownika wraz ze statystykami (ilość projektów, średnia ocena, liczba TC).
- **Kluczowe informacje do wyświetlenia:**
  - Lista projektów z informacjami (nazwa, data utworzenia, liczba test case'ów, ocena).
  - Przycisk "New Project".
- **Kluczowe komponenty widoku:**
  - Karta projektu (Card).
  - Lista/paginacja obiektów.
  - Wskaźniki statystyczne.
- **UX, dostępność i względy bezpieczeństwa:**
  - Prosty i czytelny layout.
  - Obsługa klawiatury i czytelność wskaźników.
  - Dane pobierane zgodnie z uprawnieniami (RLS).

### 2.2. Widok szczegółów projektu
- **Ścieżka widoku:** `/projects/:id`
- **Główny cel:** Wyświetlenie szczegółowych danych wybranego projektu oraz powiązanych test case'ów.
- **Kluczowe informacje do wyświetlenia:**
  - Informacje o projekcie (nazwa, data, rating).
  - Lista test case'ów wraz z tytułami i kolejnością.
- **Kluczowe komponenty widoku:**
  - Szczegółowy podgląd projektu.
  - Lista test case'ów z możliwością przejścia do edycji.
- **UX, dostępność i względy bezpieczeństwa:**
  - Dynamiczne ładowanie szczegółów.
  - Spójny styl oraz intuicyjna nawigacja.
  - Obsługa błędów, np. gdy projekt nie istnieje lub brakuje uprawnień.

### 2.3. Widok edycji test case
- **Ścieżka widoku:** `/projects/:projectId/testcase/:id/edit`
- **Główny cel:** Edycja szczegółowych informacji dla pojedynczego test case (preconditions, steps, expected result).
- **Kluczowe informacje do wyświetlenia:**
  - Formularz edycji danych test case.
  - Wskaźnik postępu generowania szczegółów.
  - Mechanizm autosave oraz lokalnego buforowania.
- **Kluczowe komponenty widoku:**
  - Formularz (inputy, textarea).
  - Nawigacja "Previous/Next" po tytułach.
  - Komunikaty statusowe oraz walidacyjne.
- **UX, dostępność i względy bezpieczeństwa:**
  - Intuicyjny przepływ edycji z informacjami o stanie zapisu.
  - Automatyczne zapisywanie zmian i walidacja w czasie rzeczywistym.
  - Bezpieczne aktualizacje poprzez REST API z obsługą RLS.

### 2.4. Widok wprowadzania dokumentacji i generowania tytułów
- **Ścieżka widoku:** `/new`
- **Główny cel:** Pozwolenie użytkownikowi na wprowadzenie dokumentacji oraz (opcjonalnie) nazwy projektu – inicjuje proces generowania tytułów.
- **Kluczowe informacje do wyświetlenia:**
  - Pole tekstowe/textarea o limicie 100-5000 znaków.
  - Licznik znaków.
  - Opcjonalne pole na nazwę projektu.
  - Wskaźnik "loading" podczas generowania tytułów.
- **Kluczowe komponenty widoku:**
  - Formularz wejściowy.
  - Komponent informujący o postępie (spinner, progress bar).
  - Komunikaty błędów przy nieudanej walidacji lub braku tytułów.
- **UX, dostępność i względy bezpieczeństwa:**
  - Walidacja danych wejściowych i czytelna informacja o błędach.
  - Obsługa stanu "brak tytułów" z możliwością ponownego uruchomienia procesu.
  - Bezpieczne przesyłanie danych do API.

### 2.5. Widok edytowania tytułów test case'ów
- **Ścieżka widoku:** `/new/edit-titles`
- **Główny cel:** Umożliwienie użytkownikowi przeglądu oraz modyfikacji wygenerowanych tytułów – dodawanie, usuwanie i edycja tytułów test case'ów.
- **Kluczowe informacje do wyświetlenia:**
  - Lista wygenerowanych tytułów.
  - Opcje edycji: przyciski do usuwania, edycji i dodawania nowego tytułu.
- **Kluczowe komponenty widoku:**
  - Lista edytowalna tytułów (list item z polem tekstowym).
  - Przycisk dodawania nowego tytułu.
  - Komponent walidacji liczby tytułów (minimum 1, maksymalnie 20).
- **UX, dostępność i względy bezpieczeństwa:**
  - Intuicyjna manipulacja listą tytułów.
  - Natychmiastowa walidacja oraz synchronizacja lokalnego stanu (autosave).
  - Przejrzysta nawigacja umożliwiająca powrót do poprzedniego kroku lub przejście dalej.

### 2.6. Widok generowania szczegółów test case'ów
- **Ścieżka widoku:** `/projects/:projectId/generate-details`
- **Główny cel:** Automatyczne generowanie szczegółowych informacji dla każdego test case na podstawie tytułów.
- **Kluczowe informacje do wyświetlenia:**
  - Lista tytułów z przypisanymi szczegółami generowania (preconditions, steps, expected result).
  - Wskaźnik postępu dla każdego test case.
  - Możliwość edycji szczegółów po ich wygenerowaniu.
- **Kluczowe komponenty widoku:**
  - Komponent listy test case'ów.
  - Wskaźnik postępu generowania.
  - Formularz umożliwiający ręczną ingerencję w wygenerowane dane.
- **UX, dostępność i względy bezpieczeństwa:**
  - Jasne informacje o stanie generowania (np. "Generating test case 3 z 10").
  - Opcja przerwania lub ponowienia generowania w przypadku błędów.
  - Bezpieczne pobieranie danych z API z obsługą błędów.

### 2.7. Widok eksportu CSV
- **Ścieżka widoku:** `/projects/:id/export`
- **Główny cel:** Umożliwienie eksportu danych test case w formacie CSV zgodnym z TestRail.
- **Kluczowe informacje do wyświetlenia:**
  - Podsumowanie projektu oraz listy test case'ów.
  - Przycisk "Export", który wyzwala generowanie CSV.
- **Kluczowe komponenty widoku:**
  - Komponent podsumowania danych projektu.
  - Przycisk eksportu.
  - Komunikaty o sukcesie lub błędach przy eksporcie.
- **UX, dostępność i względy bezpieczeństwa:**
  - Intuicyjna informacja o powodzeniu lub niepowodzeniu operacji eksportu.
  - Ochrona dostępu poprzez weryfikację sesji użytkownika.
  - Bezpieczne przekazywanie żądania do API.

### 2.8. Widok uwierzytelniania/logowania
- **Ścieżka widoku:** `/login` oraz `/register`
- **Główny cel:** Umożliwienie logowania lub rejestracji użytkownika (invite-only).
- **Kluczowe informacje do wyświetlenia:**
  - Formularze z polami: email, hasło (oraz kod zaproszenia przy rejestracji).
  - Komunikaty o błędach autoryzacyjnych i statusie weryfikacji.
- **Kluczowe komponenty widoku:**
  - Formularze logowania/rejestracji.
  - Komponenty komunikatów błędów.
- **UX, dostępność i względy bezpieczeństwa:**
  - Bezpieczne przesyłanie danych uwierzytelniających.
  - Walidacja pól wejściowych oraz obsługa komunikatów o błędach (np. błąd logowania, nieprawidłowe dane).
  - Informacje o konieczności weryfikacji email.

## 3. Mapa podróży użytkownika

1. **Autoryzacja:** Użytkownik loguje się lub rejestruje, po czym trafia na Dashboard.
2. **Dashboard:** Użytkownik przegląda istniejące projekty lub wybiera opcję "New Project", aby rozpocząć nowy przepływ.
3. **Wprowadzanie dokumentacji:** Użytkownik przechodzi do widoku `/new`, gdzie wpisuje dokumentację (oraz opcjonalnie nazwę projektu), co uruchamia proces generowania tytułów.
4. **Edycja tytułów:** Po wygenerowaniu tytułów użytkownik przechodzi do widoku `/new/edit-titles`, gdzie ma możliwość usuwania, edycji lub dodawania nowych tytułów test case'ów.
5. **Generowanie szczegółów:** Następnie, wybrane (i ewentualnie zmodyfikowane) tytuły trafiają do widoku generowania szczegółów (`/projects/:projectId/generate-details`), gdzie API generuje dla każdego test case pełne dane (preconditions, steps, expected result). 
6. **Szczegóły projektu:** Po akceptacji szczegółów użytkownik wraca do widoku szczegółów projektu, gdzie ma pełen podgląd wszystkich test case'ów. Użytkownik ma możliwośc ręcznej edycji w razie potrzeby.
7. **Eksport CSV:** Końcowy etap to widok eksportu CSV (`/projects/:id/export`), gdzie użytkownik inicjuje i pobiera plik CSV kompatybilny z TestRail.
8. **Powrót:** Użytkownik może powrócić na Dashboard lub rozpocząć nowy przepływ.

## 4. Układ i struktura nawigacji

- **Nawigacja główna:** Pasek widoczny po logowaniu zawiera linki do Dashboard, Nowego Projektu oraz profilu (w tym wylogowanie).
- **Ścieżki kontekstowe:** W widokach szczegółowych (edytowanie test case, eksport CSV) stosowany jest "breadcrumb" umożliwiający szybki powrót do wyższych poziomów.
- **Menu boczne:** W widoku Dashboard oraz szczegółów projektu może być zastosowany panel boczny dla szybkiej nawigacji między sekcjami (lista test case'ów, ustawienia projektu).
- **Responsywność:** Menu dostosowuje się do urządzeń mobilnych (np. hamburger menu), zapewniając spójny dostęp do kluczowych sekcji.

## 5. Kluczowe komponenty

- **Formularze:** Używane w widokach wprowadzania dokumentacji, edycji tytułów, edycji szczegółów test case oraz logowania/rejestracji – z wbudowaną walidacją, wskaźnikami postępu oraz mechanizmem autosave.
- **Karty (Cards):** Prezentacja projektów i test case'ów w liście oraz szczegółach.
- **Alerty i powiadomienia:** Informowanie użytkownika o sukcesach, błędach, walidacji oraz statusie operacji (np. generowanie tytułów, eksport CSV).
- **Wskaźniki postępu:** Komponenty wizualizujące stan operacji (np. generowanie szczegółów test case).
- **Nawigacja i Breadcrumbs:** Elementy nawigacyjne umożliwiające łatwą orientację w hierarchii widoków.
- **Komponent modalny/popup:** Do potwierdzania operacji krytycznych (np. usunięcie tytułu lub projektu) oraz wyświetlania komunikatów błędów uwierzytelniania i walidacji.
