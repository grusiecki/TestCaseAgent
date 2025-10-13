

## 1. Przegląd produktu

### 1.1. Nazwa produktu
Tester Agent - AI-powered Test Case Generator

### 1.2. Wersja i status
Wersja: MVP (Minimum Viable Product)
Status: W fazie planowania
Data ostatniej aktualizacji: 13 października 2025

### 1.3. Zespół produktowy
Grupa docelowa: Zespół wewnętrzny - testerzy pracujący w projektach firmy
Typ aplikacji: Narzędzie wewnętrzne firmowe
Model dystrybucji: Invite-only registration system

### 1.4. Cel produktu
Tester Agent to aplikacja webowa wykorzystująca sztuczną inteligencję do automatyzacji procesu tworzenia test case'ów. Aplikacja umożliwia testerom wklejenie dokumentacji funkcjonalności (user stories, acceptance criteria, opisy funkcjonalności) i automatyczne wygenerowanie kompleksowych test case'ów w formacie gotowym do importu do TestRail.

### 1.5. Wartość biznesowa
Główną wartością produktu jest radykalna redukcja czasu poświęcanego na żmudny proces manualnego tworzenia test case'ów, przy jednoczesnym zachowaniu wysokiej jakości i kompletności dokumentacji testowej. Narzędzie ma na celu zwiększenie produktywności testerów poprzez eliminację powtarzalnych, czasochłonnych zadań i umożliwienie koncentracji na bardziej wartościowych aspektach testowania.

### 1.6. Stack technologiczny
Frontend: Astro framework z React componentami dla interaktywnych części
Backend: Supabase (authentication, database, Row Level Security)
AI Integration: Openrouter.ai dla komunikacji z modelami językowymi
Deployment: Docker containerization, DigitalOcean hosting
CI/CD: GitHub Actions

## 2. Problem użytkownika

### 2.1. Kontekst problemu
Testerzy w projektach spędzają znaczną część swojego czasu na manualnym tworzeniu dokumentacji test case'ów. Proces ten jest żmudny, powtarzalny i podatny na błędy ludzkie. Typowy workflow obejmuje analizę dokumentacji funkcjonalności, identyfikację scenariuszy testowych, formułowanie kroków testowych, określanie warunków wstępnych i oczekiwanych rezultatów.

### 2.2. Obecne bolączki użytkowników
Czasochłonność: Tworzenie kompletnych test case'ów dla złożonych funkcjonalności może zajmować godziny lub dni pracy testera.
Powtarzalność: Wiele scenariuszy testowych ma podobną strukturę, co prowadzi do monotonnej pracy kopiuj-wklej.
Niekompletność: Przy dużej ilości dokumentacji łatwo pominąć istotne scenariusze brzegowe lub alternatywne ścieżki.
Brak standaryzacji: Różni testerzy mogą tworzyć test case'y w odmiennych formatach, co utrudnia współpracę.
Integracja z narzędziami: Przygotowanie test case'ów w formacie kompatybilnym z TestRail wymaga dodatkowych kroków formatowania.

### 2.3. Wartość rozwiązania
Automatyzacja fazy generowania: AI analizuje dokumentację i proponuje kompletną listę scenariuszy testowych.
Kontrola użytkownika: Tester zachowuje pełną kontrolę nad ostatecznym kształtem test case'ów poprzez możliwość edycji, usuwania i dodawania.
Bezpośrednia integracja: Eksport bezpośrednio do formatu CSV kompatybilnego z TestRail eliminuje dodatkowe kroki konwersji.
Jakość i kompletność: AI pomaga w identyfikacji scenariuszy, które mogłyby zostać pominięte w procesie manualnym.
Oszczędność czasu: Redukcja czasu tworzenia test case'ów o co najmniej 50-70% w porównaniu do procesu manualnego.

### 2.4. Grupa docelowa
Testerzy manualni pracujący w zespołach projektowych
Testerzy automatyzujący potrzebujący dokumentacji test case'ów
QA Leads zarządzający wieloma projektami testowymi
Business Analysts weryfikujący pokrycie wymagań testami

## 3. Wymagania funkcjonalne

### 3.1. Autentykacja i zarządzanie użytkownikami
System autentykacji wykorzystuje Supabase Auth z następującymi wymaganiami:

3.1.1. Rejestracja invite-only
System nie posiada publicznej strony rejestracji
Nowi użytkownicy mogą dołączyć wyłącznie poprzez zaproszenie
Formularz rejestracji wymaga wyłącznie email i hasło
Po rejestracji wymagana jest weryfikacja adresu email przed pierwszym logowaniem

3.1.2. Logowanie
Formularz logowania z polami email i hasło
Token JWT z czasem wygaśnięcia 7 dni
Brak automatycznego wylogowania po okresie nieaktywności
Opcja "Remember me" domyślnie aktywna

3.1.3. Zarządzanie profilem
Możliwość zmiany hasła
Wyświetlanie podstawowych informacji profilu (email, data utworzenia konta)
Brak rozbudowanych ustawień użytkownika w wersji MVP

### 3.2. Dashboard użytkownika
Po zalogowaniu użytkownik widzi dashboard z następującymi elementami:

3.2.1. Lista projektów
Wyświetlanie wszystkich projektów użytkownika w formie listy lub kafelków
Każdy projekt zawiera: nazwę, datę utworzenia, liczbę wygenerowanych test case'ów
Sortowanie projektów po dacie utworzenia (najnowsze pierwsze)
Przycisk "New Project" do rozpoczęcia nowej sesji

3.2.2. Podstawowe statystyki
Całkowita liczba projektów użytkownika
Całkowita liczba wygenerowanych test case'ów
Średnia ocena jakości generacji (z systemu ratingu)

3.2.3. Nawigacja
Link do profilu użytkownika
Opcja wylogowania
Logo/nazwa aplikacji prowadzący do dashboardu

### 3.3. Proces generowania test case'ów
Główny workflow aplikacji składa się z czterech etapów realizowanych na jednej stronie z automatycznym przechodzeniem między sekcjami.

3.3.1. Etap 1: Input dokumentacji
Textarea z możliwością wklejenia dokumentacji funkcjonalności
Live character counter wyświetlający liczbę znaków (format: 1250/5000)
Walidacja wymagająca minimum 100 znaków i maksimum 5000 znaków
Komunikaty walidacyjne w języku angielskim:
  - "Documentation must be at least 100 characters long"
  - "Documentation cannot exceed 5000 characters"
Opcjonalne pole "Project Name" do nazwania sesji (domyślnie: "Project - [data]")
Przycisk "Generate Test Cases" aktywny tylko po spełnieniu warunków walidacji
Loading state z tekstem "Analyzing requirements and generating test case titles..."

3.3.2. Etap 2: Zarządzanie tytułami test case'ów
Po wygenerowaniu tytułów użytkownik widzi listę propozycji
Każdy tytuł prezentowany jako element listy z przyciskiem delete (ikona X)
Przyciski delete po prawej stronie każdego tytułu
Na końcu listy: text field + przycisk "Add" do dodawania własnych tytułów
Komunikat wyświetlany gdy AI wygeneruje 0 tytułów:
  - "No test cases were generated. Please try again with different requirements or add titles manually."
  - Przycisk "Retry" do ponownego generowania
  - Możliwość dodawania tytułów manualnie mimo braku wygenerowanych
Licznik wygenerowanych/dodanych tytułów w formacie: "15 test cases ready"
Walidacja: minimum 1 tytuł wymagany do przejścia dalej
Maksymalna liczba tytułów: 20 (limit sesji)
Komunikat przy próbie przekroczenia limitu: "Maximum 20 test cases per session"
Przycisk "Continue to Details" aktywny gdy lista zawiera 1-20 tytułów
Przycisk "Back" do powrotu do edycji dokumentacji

3.3.3. Etap 3: Generowanie i edycja szczegółów
Po kliknięciu "Continue to Details" aplikacja automatycznie generuje szczegóły dla każdego test case'a
Loading state z progress indicator: "Generating details for test case 3 of 15..."
Po wygenerowaniu szczegółów użytkownik widzi formularz edycji dla pierwszego TC
Każdy test case prezentowany jest w osobnym widoku z możliwością nawigacji

Formularz edycji pojedynczego test case'a zawiera:
- Read-only pole z numerem i tytułem test case'a (np. "Test Case 1/15: User Login Validation")
- Edytowalne text field "Preconditions" (multiline, bez limitu znaków)
- Edytowalne text area "Steps" (multiline, bez limitu znaków)
- Edytowalne text area "Expected Result" (multiline, bez limitu znaków)

Nawigacja między test case'ami:
- Przyciski "Previous" i "Next" do przemieszczania się między TC
- Przycisk "Previous" nieaktywny na pierwszym TC
- Przycisk "Next" zmienia się w "Finish & Export" na ostatnim TC
- Progress indicator: "Test Case 5 of 15"

Automatyczne zapisywanie zmian:
- Wszystkie edycje zapisywane w localStorage jako cache
- Odświeżenie strony nie resetuje pracy
- Po zakończeniu edycji wszystkich TC dane zapisywane w Supabase

3.3.4. Etap 4: Eksport i rating
Po zakończeniu edycji użytkownik widzi podsumowanie:
- Nazwa projektu
- Liczba test case'ów
- Przycisk "Export to CSV"

Proces eksportu:
- Generowanie pliku CSV w formacie kompatybilnym z TestRail
- Format nazwy pliku: "TestCases_YYYY-MM-DD_HH-MM.csv"
- 4 kolumny CSV: Title, Steps, Expected Result, Preconditions
- Pozostałe kolumny wymagane przez TestRail pozostawione puste
- Automatyczne pobieranie pliku przez przeglądarkę

System ratingu (wyświetlany PO eksporcie):
- 5-gwiazdkowy system oceny jakości generacji
- Pytanie: "How would you rate the quality of generated test cases?"
- Opcjonalne pole tekstowe na dodatkowy feedback
- Przycisk "Submit Rating" (opcjonalny - użytkownik może pominąć)
- Po submitowaniu lub pominięciu: przekierowanie do dashboardu

### 3.4. Zarządzanie projektami
3.4.1. Przeglądanie historii projektów
Dashboard wyświetla wszystkie zapisane projekty użytkownika
Możliwość kliknięcia w projekt do podglądu szczegółów
Widok szczegółów projektu pokazuje:
  - Nazwę projektu
  - Datę utworzenia
  - Oryginalną dokumentację input
  - Listę wszystkich test case'ów z pełnymi szczegółami
  - Możliwość ponownego eksportu do CSV

3.4.2. Usuwanie projektów
Przycisk delete przy każdym projekcie na dashboardzie
Confirmation dialog: "Are you sure you want to delete this project? This action cannot be undone."
Przyciski: "Cancel" i "Delete"

3.4.3. Brak limitów ilościowych
Internal tool bez ograniczeń na liczbę projektów na użytkownika
Brak ograniczeń na całkowitą liczbę test case'ów
Brak subscription tiers lub płatnych planów

### 3.5. Obsługa błędów i edge cases
3.5.1. Błędy AI generation
Retry mechanizm przy błędach komunikacji z AI
Fallback mechanizm: jeśli JSON validation fails, użycie uproszczonego promptu
Komunikat błędu: "Generation failed. Please try again."
Przycisk "Retry" zachowuje oryginalny input użytkownika

3.5.2. Błędy połączenia
Informowanie użytkownika o problemach z połączeniem
Automatyczne przywracanie sesji z localStorage po powrocie połączenia
Komunikat: "Connection lost. Your work is saved locally and will sync when connection is restored."

3.5.3. Timeout generation
Maksymalny czas oczekiwania na response AI: 2 minuty
Po timeout: komunikat "Generation is taking longer than expected. Please try again."
Możliwość retry lub edycja inputu

3.5.4. Pusta lub nieprawidłowa dokumentacja
Komunikat dla inputu poniżej 100 znaków: "Documentation too short. Please provide at least 100 characters."
Sugestie dla użytkownika: "Try including user stories, acceptance criteria, or functional descriptions."

### 3.6. Bezpieczeństwo danych
3.6.1. Row Level Security (RLS)
Implementacja RLS policies w Supabase dla wszystkich tabel
Users widzą wyłącznie własne projekty i test case'y
Polityki RLS oparte na user_id z JWT token

3.6.2. Walidacja input
Sanityzacja wszystkich input fields przed zapisem do bazy
Zabezpieczenie przed injection attacks
Walidacja długości i formatu danych po stronie backendu

3.6.3. Session management
JWT tokens z bezpiecznym storage
Automatyczne odświeżanie tokenów przed wygaśnięciem
Logout usuwa wszystkie session data z localStorage i cookie

### 3.7. Integracja z TestRail
3.7.1. Format eksportu CSV
Struktura CSV z 4 kolumnami:
  - Title: Tytuł test case'a
  - Steps: Kroki testowe (numerowane lub w punktach)
  - Expected Result: Oczekiwany rezultat dla wszystkich kroków
  - Preconditions: Warunki wstępne przed wykonaniem testu

3.7.2. Kompatybilność z TestRail templates
CSV kompatybilny z TestRail "Test Case (Text)" template
Single-row format: każdy test case w jednym wierszu
Możliwość bezpośredniego importu do TestRail bez dodatkowej konwersji

3.7.3. Encoding i formatowanie
UTF-8 encoding dla międzynarodowych znaków
Poprawne escapowanie przecinków i znaków nowej linii w CSV
Headers w pierwszym wierszu pliku

## 4. Granice produktu

### 4.1. Co jest w zakresie MVP
Autentykacja invite-only z email/hasło
Dashboard z listą projektów i podstawowymi statystykami
Textarea input z walidacją 100-5000 znaków
AI generowanie tytułów test case'ów (maksymalnie 20 na sesję)
Możliwość usuwania i dodawania tytułów manualnie
AI generowanie szczegółów dla każdego TC (preconditions, steps, expected result)
Edycja wszystkich elementów każdego test case'a
Export do CSV w formacie TestRail-compatible
5-gwiazdkowy system ratingu po eksporcie
Zapisywanie projektów w Supabase z RLS
localStorage cache dla sesji
Retry mechanizmy przy błędach AI
JSON Schema validation z fallback
Widok szczegółów i ponowny eksport historycznych projektów
Usuwanie projektów z confirmation dialog

### 4.2. Co NIE jest w zakresie MVP
4.2.1. Advanced features
Brak fine-tuningu modeli AI dla specyficznych typów dokumentacji
Brak A/B testingu różnych modeli AI
Brak automatycznego kategoryzowania test case'ów
Brak sugestii priorytetów test case'ów
Brak integracji z systemami verzjonowania (Git)
Brak collaborative editing (jednoczesna edycja przez wielu użytkowników)
Brak komentarzy i adnotacji na test case'ach
Brak template library dla różnych typów testów

4.2.2. User management
Brak systemu ról (admin/viewer/editor)
Brak możliwości udostępniania projektów innym użytkownikom
Brak team management funkcjonalności
Brak permission system poza podstawowym RLS
Brak activity logs użytkowników

4.2.3. Reporting i analytics
Brak zaawansowanych dashboardów analitycznych
Brak raportów użytkowania aplikacji
Brak trend analysis jakości generacji
Brak porównań między projektami
Brak eksportu raportów w innych formatach niż CSV TestRail

4.2.4. Integracje
Brak bezpośredniej integracji API z TestRail (tylko eksport CSV)
Brak integracji z Jira, Azure DevOps, lub innymi narzędziami PM
Brak webhooks dla automatyzacji
Brak API publicznego dla integracji zewnętrznych

4.2.5. UI/UX enhancements
Brak dark mode
Brak customization kolorystyki interfejsu
Brak keyboard shortcuts
Brak drag-and-drop dla reorganizacji test case'ów
Brak bulk operations (masowe usuwanie, edycja)
Brak advanced search i filtering na dashboardzie

4.2.6. AI capabilities
Brak natural language queries dla modyfikacji TC
Brak automatycznego updateowania TC przy zmianie requirements
Brak sugestii improvement dla istniejących TC
Brak detekcji duplikatów test case'ów
Brak multi-language support dla generacji (tylko angielski output)

### 4.3. Przyszłe rozszerzenia (poza MVP)
Możliwość wyboru modelu AI z listy dostępnych w Openrouter
Template system dla różnych typów testów (functional, regression, smoke)
Eksport do innych formatów (Jira, Azure DevOps, Zephyr)
Collaborative features dla zespołów
Advanced analytics i reporting
Direct API integration z TestRail
Multi-language support dla interfejsu i generacji

### 4.4. Techniczne ograniczenia MVP
Maksymalna długość input dokumentacji: 5000 znaków
Maksymalna liczba test case'ów na sesję: 20
Minimum wymaganych znaków dokumentacji: 100
Timeout dla AI generation: 30 sekund
Brak limitów na liczbę projektów lub użytkowników (internal tool)
Session token validity: 7 dni

## 5. Historyjki użytkowników

### 5.1. Autentykacja i onboarding

US-001: Rejestracja przez zaproszenie
Jako nowy użytkownik chcę zarejestrować się w systemie używając otrzymanego zaproszenia, żeby uzyskać dostęp do aplikacji.

Kryteria akceptacji:
- System wyświetla formularz rejestracji z polami email i hasło
- Hasło wymaga minimum 8 znaków
- Po submicie formularza system wysyła email weryfikacyjny
- Komunikat po rejestracji: "Registration successful. Please check your email to verify your account."
- Użytkownik nie może się zalogować przed weryfikacją emaila
- Po weryfikacji użytkownik jest przekierowywany do strony logowania

US-002: Weryfikacja emaila
Jako nowy użytkownik chcę zweryfikować mój adres email, żeby aktywować konto i móc się zalogować.

Kryteria akceptacji:
- Email weryfikacyjny zawiera link aktywacyjny z tokenem
- Kliknięcie linku przekierowuje do aplikacji
- System wyświetla komunikat: "Email verified successfully. You can now log in."
- Po weryfikacji użytkownik może się zalogować
- Token weryfikacyjny jest jednorazowy
- Link wygasa po 24 godzinach

US-003: Logowanie do aplikacji
Jako zarejestrowany użytkownik chcę zalogować się do aplikacji używając email i hasła, żeby uzyskać dostęp do moich projektów.

Kryteria akceptacji:
- Formularz logowania zawiera pola email i hasło
- Opcja "Remember me" jest domyślnie zaznaczona
- Po poprawnym logowaniu użytkownik jest przekierowywany do dashboardu
- Komunikat przy błędnych danych: "Invalid email or password"
- Komunikat gdy email nie jest zweryfikowany: "Please verify your email address before logging in"
- JWT token jest zapisywany i ważny przez 7 dni

US-004: Wylogowanie
Jako zalogowany użytkownik chcę wylogować się z aplikacji, żeby zakończyć sesję i zabezpieczyć moje dane.

Kryteria akceptacji:
- Przycisk "Logout" dostępny w nawigacji
- Po kliknięciu logout użytkownik jest przekierowywany do strony logowania
- JWT token jest usuwany z storage
- localStorage cache sesji pozostaje (dla przyszłego logowania)
- Komunikat: "You have been logged out successfully"

US-005: Zmiana hasła
Jako użytkownik chcę zmienić moje hasło, żeby zaktualizować dane dostępowe.

Kryteria akceptacji:
- Opcja zmiany hasła dostępna w ustawieniach profilu
- Formularz wymaga: obecne hasło, nowe hasło, potwierdzenie nowego hasła
- Walidacja: nowe hasło minimum 8 znaków
- Walidacja: nowe hasło i potwierdzenie muszą się zgadzać
- Po zmianie hasła: komunikat "Password changed successfully"
- Użytkownik pozostaje zalogowany po zmianie hasła

### 5.2. Dashboard i zarządzanie projektami

US-006: Wyświetlanie dashboardu
Jako zalogowany użytkownik chcę zobaczyć dashboard z moimi projektami i statystykami, żeby mieć przegląd mojej aktywności.

Kryteria akceptacji:
- Dashboard wyświetla listę wszystkich projektów użytkownika
- Każdy projekt pokazuje: nazwę, datę utworzenia, liczbę TC
- Projekty sortowane po dacie utworzenia (najnowsze pierwsze)
- Wyświetlane statystyki: całkowita liczba projektów, całkowita liczba TC, średnia ocena
- Przycisk "New Project" prowadzący do formularza input
- Logo aplikacji prowadzące do dashboardu
- Link do profilu użytkownika

US-007: Tworzenie nowego projektu
Jako użytkownik chcę rozpocząć nowy projekt, żeby wygenerować test case'y dla nowej funkcjonalności.

Kryteria akceptacji:
- Kliknięcie "New Project" prowadzi do strony z textarea input
- Opcjonalne pole "Project Name" z placeholder "Project - [current date]"
- Textarea z placeholder "Paste your requirements, user stories, or acceptance criteria here..."
- Live character counter w formacie "0/5000"
- Przycisk "Generate Test Cases" nieaktywny dopóki input < 100 znaków
- Przycisk "Cancel" prowadzący z powrotem do dashboardu

US-008: Przeglądanie szczegółów projektu
Jako użytkownik chcę zobaczyć szczegóły zapisanego projektu, żeby przejrzeć wygenerowane test case'y.

Kryteria akceptacji:
- Kliknięcie w projekt na dashboardzie prowadzi do widoku szczegółów
- Widok pokazuje: nazwę projektu, datę utworzenia, oryginalną dokumentację input
- Pełna lista test case'ów z wszystkimi szczegółami
- Każdy TC wyświetla: tytuł, preconditions, steps, expected result
- Przycisk "Export to CSV" umożliwiający ponowny eksport
- Przycisk "Back to Dashboard"
- Przycisk "Delete Project" z ikoną kosza

US-009: Usuwanie projektu
Jako użytkownik chcę usunąć nieaktualny projekt, żeby uporządkować mój dashboard.

Kryteria akceptacji:
- Przycisk delete przy każdym projekcie na dashboardzie
- Po kliknięciu wyświetla się confirmation dialog
- Dialog zawiera tekst: "Are you sure you want to delete this project? This action cannot be undone."
- Przyciski w dialog: "Cancel" i "Delete"
- Po kliknięciu "Delete" projekt jest usuwany z bazy danych
- Dashboard automatycznie odświeża listę projektów
- Komunikat: "Project deleted successfully"

US-010: Pusta lista projektów
Jako nowy użytkownik bez projektów chcę zobaczyć komunikat zachęcający do utworzenia pierwszego projektu.

Kryteria akceptacji:
- Gdy użytkownik nie ma żadnych projektów, dashboard pokazuje empty state
- Komunikat: "You don't have any projects yet. Create your first project to get started!"
- Duży przycisk "Create First Project" na środku ekranu
- Statystyki pokazują wartości zerowe

### 5.3. Proces generowania - Input i walidacja

US-011: Wklejanie dokumentacji
Jako użytkownik chcę wkleić dokumentację funkcjonalności do textarea, żeby rozpocząć proces generowania test case'ów.

Kryteria akceptacji:
- Textarea akceptuje tekst do 5000 znaków
- Live counter aktualizuje się przy każdym wpisanym znaku
- Counter pokazuje format "1250/5000"
- Counter zmienia kolor na czerwony gdy przekroczono limit
- Możliwość wklejenia tekstu za pomocą Ctrl+V lub menu kontekstowego
- Textarea automatycznie rozszerza się przy większej ilości tekstu

US-012: Walidacja długości dokumentacji
Jako użytkownik chcę otrzymać informację o nieprawidłowej długości tekstu, żeby skorygować input przed generowaniem.

Kryteria akceptacji:
- Komunikat błędu gdy input < 100 znaków: "Documentation must be at least 100 characters long"
- Komunikat błędu gdy input > 5000 znaków: "Documentation cannot exceed 5000 characters"
- Przycisk "Generate Test Cases" nieaktywny gdy walidacja nie przechodzi
- Komunikaty błędów wyświetlane na czerwono pod textarea
- Możliwość edycji tekstu i automatyczne usunięcie komunikatu błędu po spełnieniu wymagań

US-013: Nadawanie nazwy projektowi
Jako użytkownik chcę nadać nazwę projektowi, żeby łatwiej go identyfikować na dashboardzie.

Kryteria akceptacji:
- Opcjonalne pole "Project Name" nad textarea
- Domyślna nazwa generowana automatycznie: "Project - October 13, 2025"
- Użytkownik może nadpisać domyślną nazwę
- Maksymalna długość nazwy: 100 znaków
- Nazwa zapisywana razem z projektem w bazie danych

US-014: Zapisywanie draftu w localStorage
Jako użytkownik chcę aby moja praca była zapisana lokalnie, żeby nie stracić inputu przy przypadkowym odświeżeniu strony.

Kryteria akceptacji:
- Każda zmiana w textarea automatycznie zapisywana w localStorage
- Po odświeżeniu strony textarea zawiera poprzedni tekst
- localStorage zapisuje również nazwę projektu
- Cache jest czyszczony po pomyślnym eksporcie CSV
- Komunikat przy odświeżeniu strony: "Your work has been restored from cache"

### 5.4. Proces generowania - Tytuły test case'ów

US-015: Generowanie tytułów AI
Jako użytkownik chcę aby AI wygenerowało tytuły test case'ów na podstawie dokumentacji, żeby uzyskać listę scenariuszy testowych.

Kryteria akceptacji:
- Po kliknięciu "Generate Test Cases" wyświetla się loading spinner
- Loading message: "Analyzing requirements and generating test case titles..."
- System wywołuje AI API z dokumentacją jako input
- AI generuje listę tytułów test case'ów (od 0 do 20)
- Po zakończeniu generowania wyświetla się lista tytułów
- Każdy tytuł wyświetlany jako element listy z przyciskiem delete

US-016: Przeglądanie wygenerowanych tytułów
Jako użytkownik chcę przejrzeć listę wygenerowanych tytułów, żeby ocenić propozycje AI.

Kryteria akceptacji:
- Lista tytułów wyświetlana w formie numerowanej listy
- Każdy element listy zawiera: numer, tytuł TC, przycisk delete (X)
- Licznik na górze: "15 test cases ready"
- Scroll dla list dłuższych niż ekran
- Czytelna typografia i odstępy między elementami

US-017: Usuwanie niepotrzebnych tytułów
Jako użytkownik chcę usunąć niepotrzebne tytuły z listy, żeby pozostawić tylko relevantne scenariusze.

Kryteria akceptacji:
- Przycisk delete (X) po prawej stronie każdego tytułu
- Kliknięcie X natychmiast usuwa tytuł z listy (bez confirmation)
- Licznik automatycznie aktualizuje się po usunięciu
- Animacja fade-out przy usuwaniu elementu
- Możliwość usunięcia wszystkich wygenerowanych tytułów

US-018: Dodawanie własnych tytułów
Jako użytkownik chcę dodać własne tytuły test case'ów, żeby uzupełnić propozycje AI o scenariusze, które system pominął.

Kryteria akceptacji:
- Text field na końcu listy z placeholder "Add your own test case title..."
- Przycisk "Add" obok text field
- Przycisk "Add" aktywny tylko gdy text field nie jest pusty
- Po kliknięciu "Add" nowy tytuł dodawany do listy
- Text field czyszczony po dodaniu
- Licznik automatycznie aktualizuje się po dodaniu
- Możliwość dodania tytułu przez Enter key

US-019: Limit 20 test case'ów na sesję
Jako użytkownik chcę być poinformowany o limicie sesji, żeby nie przekroczyć maksymalnej liczby test case'ów.

Kryteria akceptacji:
- Maksymalna liczba tytułów: 20
- Po osiągnięciu limitu przycisk "Add" staje się nieaktywny
- Komunikat przy próbie dodania: "Maximum 20 test cases per session"
- Text field również nieaktywny po osiągnięciu limitu
- Licznik pokazuje "20/20 test cases (maximum reached)"

US-020: AI wygenerowało 0 tytułów
Jako użytkownik chcę otrzymać komunikat i opcje działania gdy AI nie wygenerowało żadnych tytułów, żeby móc kontynuować proces.

Kryteria akceptacji:
- Komunikat: "No test cases were generated. Please try again with different requirements or add titles manually."
- Przycisk "Retry" do ponownego wywołania generowania
- Możliwość dodawania tytułów manualnie mimo braku wygenerowanych
- Przycisk "Back" do edycji oryginalnej dokumentacji
- Text field do dodawania tytułów pozostaje aktywny

US-021: Przejście do generowania szczegółów
Jako użytkownik chcę przejść do etapu generowania szczegółów, żeby rozwinąć tytuły w kompletne test case'y.

Kryteria akceptacji:
- Przycisk "Continue to Details" na dole listy tytułów
- Przycisk aktywny tylko gdy lista zawiera 1-20 tytułów
- Komunikat walidacji gdy lista pusta: "Add at least one test case to continue"
- Przycisk "Back" do powrotu do edycji dokumentacji
- Po kliknięciu "Continue" automatyczne rozpoczęcie generowania szczegółów

### 5.5. Proces generowania - Szczegóły test case'ów

US-022: Automatyczne generowanie szczegółów
Jako użytkownik chcę aby AI automatycznie wygenerowało szczegóły dla wszystkich test case'ów, żeby otrzymać kompletną dokumentację.

Kryteria akceptacji:
- Po kliknięciu "Continue to Details" rozpoczyna się generowanie szczegółów
- Loading state z progress indicator: "Generating details for test case 3 of 15..."
- System generuje dla każdego TC: preconditions, steps, expected result
- Progress bar wizualizujący postęp generowania
- Po zakończeniu automatyczne wyświetlenie formularza edycji pierwszego TC

US-023: Wyświetlanie formularza edycji
Jako użytkownik chcę zobaczyć formularz edycji pierwszego test case'a, żeby przejrzeć i zmodyfikować wygenerowane szczegóły.

Kryteria akceptacji:
- Nagłówek pokazuje: "Test Case 1/15: [Tytuł TC]"
- Formularz zawiera 4 sekcje:
  - Read-only tytuł test case'a
  - Edytowalne text field "Preconditions" (multiline)
  - Edytowalne text area "Steps" (multiline)
  - Edytowalne text area "Expected Result" (multiline)
- Wszystkie pola zawierają wygenerowany przez AI content
- Możliwość edycji każdego pola
- Autosave zmian w localStorage

US-024: Edycja szczegółów test case'a
Jako użytkownik chcę edytować szczegóły test case'a, żeby dostosować je do moich potrzeb i standardów.

Kryteria akceptacji:
- Możliwość kliknięcia w każde pole i edycji tekstu
- Brak limitów znaków dla pól edycyjnych
- Text areas automatycznie rozszerzają się przy większej ilości tekstu
- Każda zmiana zapisywana w localStorage
- Możliwość użycia formatowania (enter dla nowych linii)
- Możliwość kopiowania i wklejania tekstu

US-025: Nawigacja między test case'ami
Jako użytkownik chcę przemieszczać się między test case'ami, żeby przejrzeć i edytować wszystkie wygenerowane szczegóły.

Kryteria akceptacji:
- Przyciski "Previous" i "Next" na dole formularza
- Przycisk "Previous" nieaktywny na pierwszym TC
- Przycisk "Next" zmienia się w "Finish & Export" na ostatnim TC
- Progress indicator: "Test Case 5 of 15"
- Kliknięcie "Next" zapisuje zmiany i przechodzi do kolejnego TC
- Kliknięcie "Previous" zapisuje zmiany i wraca do poprzedniego TC
- Płynna animacja przejścia między TC

US-026: Zapis zmian w localStorage
Jako użytkownik chcę aby moje edycje były automatycznie zapisywane lokalnie, żeby nie stracić pracy przy przypadkowych problemach.

Kryteria akceptacji:
- Każda edycja pola automatycznie zapisywana w localStorage
- Delay 500ms między ostatnią zmianą a zapisem (debouncing)
- Odświeżenie strony przywraca wszystkie edycje
- Komunikat dyskretny: "All changes saved locally"
- localStorage zawiera wszystkie TC z aktualnymi wartościami

US-027: Zakończenie edycji wszystkich test case'ów
Jako użytkownik chcę zakończyć proces edycji, żeby przejść do eksportu test case'ów.

Kryteria akceptacji:
- Na ostatnim TC przycisk "Next" zmienia się w "Finish & Export"
- Kliknięcie "Finish & Export" zapisuje wszystkie TC w Supabase
- Loading state: "Saving your test cases..."
- Po zapisie wyświetla się ekran podsumowania z opcją eksportu
- Użytkownik może wrócić do edycji poprzez przycisk "Back to editing"

### 5.6. Eksport i rating

US-028: Wyświetlanie ekranu podsumowania
Jako użytkownik chcę zobaczyć podsumowanie projektu przed eksportem, żeby zweryfikować liczbę test case'ów.

Kryteria akceptacji:
- Ekran podsumowania pokazuje:
  - Nazwę projektu
  - Liczbę test case'ów
  - Datę utworzenia
- Przycisk "Export to CSV" wyraźnie widoczny
- Przycisk "Back to Dashboard" (bez eksportu)
- Komunikat: "Your test cases are ready to export!"

US-029: Eksport do CSV
Jako użytkownik chcę wyeksportować test case'y do pliku CSV, żeby zaimportować je do TestRail.

Kryteria akceptacji:
- Kliknięcie "Export to CSV" generuje plik CSV
- Format pliku: "TestCases_2025-10-13_15-34.csv"
- CSV zawiera 4 kolumny: Title, Steps, Expected Result, Preconditions
- Pierwszy wiersz to headers
- Każdy test case w osobnym wierszu
- UTF-8 encoding
- Poprawne escapowanie znaków specjalnych (przecinki, nowe linie)
- Automatyczne pobieranie pliku przez przeglądarkę
- Po eksporcie wyświetla się formularz ratingu

US-030: Ocena jakości generacji
Jako użytkownik chcę ocenić jakość wygenerowanych test case'ów, żeby pomóc w ulepszaniu systemu.

Kryteria akceptacji:
- Po eksporcie CSV wyświetla się 5-gwiazdkowy rating
- Pytanie: "How would you rate the quality of generated test cases?"
- 5 gwiazdek do kliknięcia (1 = najgorsza, 5 = najlepsza)
- Opcjonalne text area "Additional feedback (optional)"
- Przycisk "Submit Rating"
- Przycisk "Skip" do pominięcia ratingu
- Po submicie lub skip: przekierowanie do dashboardu
- Komunikat: "Thank you for your feedback!"

US-031: Ponowny eksport historycznego projektu
Jako użytkownik chcę ponownie wyeksportować historyczny projekt, żeby uzyskać plik CSV bez tworzenia nowego projektu.

Kryteria akceptacji:
- W widoku szczegółów projektu dostępny przycisk "Export to CSV"
- Kliknięcie generuje CSV z zapisanych test case'ów
- Format nazwy pliku identyczny jak przy pierwszym eksporcie (nowa data)
- Brak ponownego ratingu przy re-eksporcie
- Komunikat: "CSV file exported successfully"

### 5.7. Obsługa błędów

US-032: Błąd generowania tytułów
Jako użytkownik chcę być poinformowany o błędzie generowania i móc ponowić próbę, żeby ukończyć proces pomimo problemów technicznych.

Kryteria akceptacji:
- Komunikat błędu: "Generation failed. Please try again."
- Przycisk "Retry" do ponownego wywołania AI
- Przycisk "Edit Input" do modyfikacji dokumentacji
- Oryginalny input zachowany i dostępny do edycji
- Licznik retry attempts (maksymalnie 3 próby)
- Po 3 nieudanych próbach: sugestia "Try simplifying your requirements or contact support"

US-033: Timeout generowania
Jako użytkownik chcę być poinformowany gdy generowanie trwa zbyt długo, żeby móc podjąć decyzję o dalszych działaniach.

Kryteria akceptacji:
- Maksymalny czas oczekiwania: 2 minuty
- Po timeout komunikat: "Generation is taking longer than expected. Please try again."
- Przycisk "Retry"
- Przycisk "Cancel" wracający do edycji input
- Możliwość zmiany input przed ponowną próbą

US-034: JSON validation failure
Jako użytkownik chcę aby system miał fallback mechanizm gdy AI zwróci nieprawidłowy format, żeby proces mógł kontynuować.

Kryteria akceptacji:
- System waliduje response AI względem JSON Schema
- Przy błędzie walidacji automatyczne użycie uproszczonego promptu
- Retry z fallback prompt bez informowania użytkownika
- Jeśli fallback również fails: komunikat błędu i opcja retry
- Logowanie błędów walidacji dla debugowania

US-035: Utrata połączenia
Jako użytkownik chcę być poinformowany o utracie połączenia i automatycznym zapisie pracy, żeby nie stracić postępów.

Kryteria akceptacji:
- Detekcja utraty połączenia internetowego
- Komunikat: "Connection lost. Your work is saved locally and will sync when connection is restored."
- Banner na górze ekranu z informacją o braku połączenia
- Możliwość kontynuowania edycji offline (zapis w localStorage)
- Po przywróceniu połączenia: automatyczny sync z Supabase
- Komunikat po sync: "Connection restored. Your work has been synced."

US-036: Błąd zapisu w Supabase
Jako użytkownik chcę być poinformowany o błędzie zapisu i móc ponowić próbę, żeby moja praca została zapisana w bazie.

Kryteria akceptacji:
- Komunikat błędu: "Failed to save your project. Please try again."
- Przycisk "Retry Save"
- Dane zachowane w localStorage
- Możliwość kontynuowania pracy offline
- Automatyczna próba ponownego zapisu po przywróceniu połączenia
- Po 3 nieudanych próbach: sugestia "Your work is saved locally. Please contact support."

### 5.8. Bezpieczeństwo i autoryzacja

US-037: Row Level Security dla projektów
Jako użytkownik chcę aby moje projekty były widoczne tylko dla mnie, żeby zabezpieczyć poufność danych.

Kryteria akceptacji:
- RLS policy w Supabase dla tabeli projects
- Policy: SELECT WHERE user_id = auth.uid()
- Użytkownik widzi tylko własne projekty na dashboardzie
- API calls zwracają tylko projekty należące do zalogowanego użytkownika
- Próba dostępu do projektu innego użytkownika zwraca 403 Forbidden

US-038: Row Level Security dla test case'ów
Jako użytkownik chcę aby moje test case'y były zabezpieczone, żeby nikt inny nie miał do nich dostępu.

Kryteria akceptacji:
- RLS policy w Supabase dla tabeli test_cases
- Policy: SELECT WHERE project.user_id = auth.uid()
- Test case'y widoczne tylko poprzez projekty użytkownika
- Foreign key relationship: test_cases.project_id -> projects.id
- Automatyczne filtrowanie w queries

US-039: Session expiration i refresh
Jako użytkownik chcę aby moja sesja była automatycznie odświeżana, żeby nie być wylogowanym podczas pracy.

Kryteria akceptacji:
- JWT token z expiration time 7 dni
- Automatyczne odświeżanie tokenu 1 dzień przed wygaśnięciem
- Brak auto-logout z powodu nieaktywności
- Po wygaśnięciu sesji: przekierowanie do strony logowania
- Komunikat: "Your session has expired. Please log in again."
- localStorage cache zachowany dla przywrócenia pracy po ponownym logowaniu

US-040: Sanityzacja input użytkownika
Jako system chcę sanityzować wszystkie input fields, żeby zabezpieczyć przed injection attacks.

Kryteria akceptacji:
- Walidacja i sanityzacja po stronie backendu dla wszystkich input fields
- Usuwanie potencjalnie niebezpiecznych tagów HTML
- Escapowanie znaków specjalnych SQL
- Walidacja długości wszystkich string fields
- Logowanie podejrzanych input patterns
- Rate limiting dla API endpoints

## 6. Metryki sukcesu

### 6.1. Metryki jakości produktu



6.1.1. User Satisfaction Score
Definicja: Średnia ocena w 5-gwiazdkowym systemie ratingu po eksporcie CSV.

Cel: Średnia ocena minimum 3.5/5 w pierwszym kwartale
Pomiar: Agregacja wszystkich ocen od użytkowników po eksporcie
Benchmark: 4.0/5 jako cel długoterminowy

Metodologia pomiaru:
- Rating prompt po każdym eksporcie CSV
- Tracking średniej oceny per użytkownik i globalnie
- Analiza correlation między długością input a oceną
- Kategoryzacja feedback tekstowego na pozytywny/negatywny/neutralny



### 6.2. Metryki adoption i engagement




6.2.1. CSV Export Rate
Definicja: Procent rozpoczętych projektów zakończonych eksportem CSV.

Cel: Minimum 75% completion rate
Pomiar: Ratio projektów z completed status vs all started projects
Benchmark: 85%+ completion rate jako cel długoterminowy

Metodologia pomiaru:
- Tracking project status: started, titles_generated, details_generated, exported
- Analiza drop-off points w workflow
- Identyfikacja przyczyn porzucania projektów (surveys, session recordings)

6.2.2. Time to First Export
Definicja: Czas od rejestracji użytkownika do pierwszego eksportu CSV.

Cel: Median < 1 godzina od rejestracji
Pomiar: Timestamp różnica między user.created_at a first export
Benchmark: < 30 minut median time to first export

Metodologia pomiaru:
- Tracking timestamps: registration, first login, first project start, first export
- Segmentacja per user cohort
- Correlation analysis z onboarding experience

### 6.3. Metryki techniczne

6.3.1. AI Generation Success Rate
Definicja: Procent udanych wywołań AI API zwracających poprawny output.

Cel: Minimum 95% success rate
Pomiar: Ratio successful API calls vs all API calls
Benchmark: 98%+ success rate po optymalizacji promptów

Metodologia pomiaru:
- Logging wszystkich AI API calls z statusem (success/failure)
- Tracking failure reasons: timeout, invalid JSON, API error
- Monitoring per AI model i per prompt type

6.3.2. Average Generation Time
Definicja: Średni czas generowania tytułów i szczegółów test case'ów.

Cel: 
- Tytuły: < 10 sekund
- Szczegóły (per TC): < 5 sekund

Pomiar: Timestamp różnice w AI API calls
Benchmark: < 8 sekund dla tytułów, < 3 sekundy per TC dla szczegółów

Metodologia pomiaru:
- Timing od wysłania request do otrzymania response
- Percentile analysis: p50, p90, p95, p99
- Correlation z długością input documentation

6.3.3. Error Rate
Definicja: Częstotliwość błędów wymagających user intervention lub retry.

Cel: < 5% error rate
Pomiar: Ratio error events vs all user actions
Benchmark: < 2% error rate po stabilizacji MVP

Metodologia pomiaru:
- Tracking error types: AI generation failures, database errors, network issues
- User-facing errors vs backend errors
- Mean Time To Resolution (MTTR) dla critical errors



### 6.4. Metryki business impact

6.4.1. Time Savings Per User
Definicja: Oszczędność czasu użytkownika w porównaniu do manualnego procesu tworzenia TC.

Cel: Średnia oszczędność 50-70% czasu per projekt
Pomiar: User surveys + time tracking analytics
Benchmark: 70%+ time savings po optymalizacji workflow

Metodologia pomiaru:
- Baseline: średni czas manual creation = 30 minut per TC
- Tracking czasu spędzonego w aplikacji per projekt
- User self-reported time savings w surveys
- Calculation: (baseline time - actual time) / baseline time



### 6.6. Metodologia monitorowania metryk

6.6.1. Data Collection
Supabase database queries dla user actions i project data
Frontend analytics tracking (możliwa integracja z tools jak PostHog, Mixpanel)
Server logs dla technical metrics
User surveys dla qualitative feedback





