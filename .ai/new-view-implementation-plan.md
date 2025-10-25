# Plan implementacji widoku Nowy Projekt

## 1. Przegląd
Widok "Nowy Projekt" służy do wprowadzania dokumentacji oraz opcjonalnej nazwy projektu, co inicjuje proces generowania tytułów test case’ów. Użytkownik wkleja dokumentację (100-5000 znaków), obserwuje licznik znaków, wprowadza opcjonalnie nazwę projektu, a następnie zatwierdza dane, co uruchamia generowanie tytułów. Dodatkowo, w procesie generowania tytułów wykorzystamy OpenAI (GPT) do dynamicznego tworzenia propozycji tytułów.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/new`.

## 3. Struktura komponentów
- **NewProjectView** – główny kontener widoku
  - **NewProjectForm** – formularz zawierający pola wejściowe
    - **DocumentationTextarea** – pole tekstowe dla dokumentacji z licznikiem znaków
    - **ProjectNameInput** – opcjonalne pole dla nazwy projektu
    - **GenerateTitlesButton** – przycisk zatwierdzający formularz i inicjujący generowanie tytułów
  - **LoadingIndicator** – wskaźnik ładowania wyświetlany podczas oczekiwania na odpowiedź AI
  - **ErrorMessage** – komponent do wyświetlania komunikatów o błędach

## 4. Szczegóły komponentów

### NewProjectView
- **Opis:** Główny komponent widoku odpowiedzialny za prezentację formularza oraz zarządzanie stanem widoku (ładowanie, błędy).
- **Główne elementy:** Zawiera komponenty `NewProjectForm`, `LoadingIndicator` oraz `ErrorMessage`.
- **Obsługiwane interakcje:** Zarządza stanem widoku (np. `isLoading`, `error`) i przekazuje callback do komponentu formularza w celu obsługi wysyłki danych.
- **Typy:** Używa modelu widoku (`NewProjectViewModel`), który rozszerza dane formularza o stany pomocnicze.
- **Propsy:** Callback po pomyślnej akcji (np. nawigacja do kolejnego etapu).

### NewProjectForm
- **Opis:** Formularz umożliwiający wprowadzenie dokumentacji oraz, opcjonalnie, nazwy projektu.
- **Główne elementy:** 
  - `DocumentationTextarea` z dynamicznym licznikiem znaków,
  - `ProjectNameInput` dla nazwy projektu,
  - `GenerateTitlesButton` wysyłający dane.
- **Obsługiwane interakcje:** Zmiana wartości pól, walidacja (dokumentacja musi zawierać od 100 do 5000 znaków) oraz wysyłka danych.
- **Walidacja:** 
  - Dokumentacja: minimum 100 znaków, maksimum 5000 znaków.
  - Nazwa projektu: pole opcjonalne, możliwość trimowania białych znaków.
- **Typy:** `NewProjectFormData` (z polami: `documentation`, `projectName?`, `charCount`).
- **Propsy:** Callback do obsługi wysłania formularza, przekazanie metod walidacji.

### DocumentationTextarea
- **Opis:** Pole tekstowe do wprowadzania dokumentacji z wyświetlaczem licznika znaków.
- **Główne elementy:** Element `<textarea>` oraz dynamiczny licznik znaków obok.
- **Obsługiwane zdarzenia:** `onChange` (aktualizacja stanu tekstu i licznika), `onBlur`.
- **Walidacja:** Liczba znaków musi być w przedziale 100-5000.
- **Typy:** Prosty typ string reprezentowany w `NewProjectFormData`.

### ProjectNameInput
- **Opis:** Opcjonalne pole tekstowe do wprowadzania nazwy projektu.
- **Główne elementy:** Element `<input type="text">`.
- **Obsługiwane zdarzenia:** `onChange` (aktualizacja nazwy w stanie formularza).
- **Walidacja:** Brak restrykcyjnych wymagań, tylko trimowanie białych znaków.
- **Typy:** Pole typu string w `NewProjectFormData`.

### GenerateTitlesButton
- **Opis:** Przycisk zatwierdzający formularz i inicjujący akcję generowania tytułów.
- **Główne elementy:** Przycisk, opcjonalnie z ikoną (np. `Plus` z lucide-react).
- **Obsługiwane zdarzenia:** `onClick` (uruchamia wysyłkę formularza pod warunkiem poprawnej walidacji).
- **Walidacja/Warunki aktywności:** Przyciski aktywowany, gdy dokumentacja spełnia wymagania (min 100 znaków).
- **Typy:** Standardowy event typu React.MouseEvent.

### LoadingIndicator
- **Opis:** Komponent wyświetlający animowany wskaźnik ładowania (spinner lub pasek postępu).
- **Elementy:** Graficzny spinner lub pasek postępu.
- **Obsługiwane interakcje:** Pojawia się tylko podczas procesu wysyłania danych do API.

### ErrorMessage
- **Opis:** Komponent do wyświetlania komunikatów o błędach.
- **Elementy:** Prosty komponent tekstowy wyświetlający komunikaty błędów.
- **Obsługiwane interakcje:** Wyświetlanie, gdy wystąpią błędy walidacji lub odpowiedź z błędem z API.

## 5. Typy
- **NewProjectFormData**
  - `documentation: string` – treść dokumentacji wprowadzana przez użytkownika.
  - `projectName?: string` – opcjonalna nazwa projektu.
  - `charCount: number` – licznik znaków w dokumencie, aktualizowany dynamicznie.
- **NewProjectViewModel**
  - Rozszerzenie `NewProjectFormData` o dodatkowe stany:
    - `isLoading: boolean` – informacja o statusie ładowania.
    - `error?: string` – komunikat o błędzie (jeśli wystąpił).
- **GenerateTitlesCommand (opcjonalnie)**
  - `documentation: string`
  - `projectName?: string`
- **OpenAITitlesResponse (nowy typ)**
  - `titles: string[]` – lista wygenerowanych tytułów test case’ów.

## 6. Zarządzanie stanem
- **Lokalny stan widoku:** Użycie hooka `useState` w `NewProjectView` dla `isLoading`, `error` oraz wartości formularza.
- **Custom hook:** Propozycja utworzenia hooka `useNewProjectForm` do zarządzania logiką walidacji, aktualizacji licznika znaków i wysyłki formularza.
- **Efekty uboczne:** Hook `useEffect` do monitorowania zmian w polu dokumentacji i aktualizacji `charCount`.

## 7. Integracja API
- **Generowanie tytułów przez GPT:** 
  - Po zatwierdzeniu formularza, dane będą przesyłane do usługi OpenAI, która zostanie wykorzystana do generowania tytułów.
  - **Żądanie:** Obiekt typu `GenerateTitlesCommand`, zawierający `{ documentation, projectName? }`.
  - **Wywołanie API:** Wykorzystanie SDK lub bezpośredniego wywołania endpointu OpenAI (np. endpointu Completion API) celem wygenerowania tekstu.
  - **Oczekiwana odpowiedź:** Obiekt zgodny z `OpenAITitlesResponse`, czyli `{ titles: string[] }`.
  - **Obsługa stanu:** Ustawienie stanu `isLoading` przed wysłaniem żądania; po otrzymaniu odpowiedzi, aktualizacja modelu widoku oraz przejście do kolejnego etapu (wyświetlenie wygenerowanych tytułów).
- **Obsługa błędów:** 
  - W przypadku problemów z połączeniem lub błędnej odpowiedzi, stan `error` zostanie uaktualniony, a komunikat błędu wyświetlony przez `ErrorMessage`.
  - Przewidzenie mechanizmu retry (ponowienia żądania) w razie timeoutu lub innych problemów.

## 8. Interakcje użytkownika
- **Wprowadzanie dokumentacji:** Dynamiczne liczenie znaków, walidacja długości tekstu.
- **Wprowadzanie nazwy projektu:** Aktualizacja stanu formularza, automatyczne trimowanie białych znaków.
- **Kliknięcie przycisku "Generate":** 
  - Walidacja formularza, 
  - Ustawienie stanu `isLoading` i wysłanie danych do usługi OpenAI w celu generowania tytułów,
  - W przypadku powodzenia – wyświetlenie tytułów lub przejście do kolejnego widoku,
  - W przypadku błędu – wyświetlenie komunikatu błędu za pomocą `ErrorMessage`.

## 9. Warunki i walidacja
- **Dokumentacja:**
  - Minimum 100 znaków.
  - Maksimum 5000 znaków.
  - Walidacja przebiega dynamicznie podczas wpisywania oraz przy próbie wysyłki formularza.
- **Nazwa projektu:**
  - Pole opcjonalne; wprowadzone dane są automatycznie trimowane przed wysłaniem.
- **Aktywacja przycisku:** Przycisk `GenerateTitlesButton` aktywny tylko wtedy, gdy spełnione są wszystkie warunki walidacji.

## 10. Obsługa błędów
- **Błędy walidacji:** Natychmiastowe wyświetlanie komunikatów błędów pod polami wejściowymi.
- **Błędy po stronie OpenAI:** W przypadku błędów połączenia, timeoutu lub nieprawidłowej odpowiedzi, wyświetlenie czytelnego komunikatu w komponencie `ErrorMessage`, z możliwością ponowienia żądania.
- **Scenariusze timeout:** Mechanizm retry oraz stosowne powiadomienie użytkownika w komunikacie o błędzie.

## 11. Kroki implementacji
1. Utworzyć routing widoku `/new` w konfiguracji routingu Astro.
2. Stworzyć główny komponent `NewProjectView` wraz z jego strukturą oraz stanem.
3. Zaimplementować komponent `NewProjectForm` z polami:
   - `DocumentationTextarea` z dynamicznym licznikiem,
   - `ProjectNameInput`,
   - `GenerateTitlesButton` odpowiedzialny za wysłanie formularza.
4. Utworzyć komponenty `LoadingIndicator` i `ErrorMessage` do obsługi odpowiednich stanów.
5. Zaimplementować logikę formularza, wykorzystując `useState` i/lub custom hook `useNewProjectForm` do zarządzania stanem i walidacją.
6. Dodać mechanizm dynamicznej aktualizacji licznika znaków oraz walidację danych wejściowych.
7. Rozbudować funkcję wywołania akcji przy kliknięciu przycisku tak, aby:
   - Walidować dane,
   - Ustawić stan `isLoading`,
   - Wysłać żądanie do usługi OpenAI (w formacie `GenerateTitlesCommand`) dla generowania tytułów,
   - Obsłużyć odpowiedź (aktualizacja stanu widoku lub przejście do następnego etapu) oraz potencjalne błędy.
8. Zaimplementować integrację z OpenAI, korzystając z odpowiedniego SDK lub bezpośredniego wywołania REST API oraz zaimplementować typy żądań/odpowiedzi (`GenerateTitlesCommand`, `OpenAITitlesResponse`).
9. Przetestować wszystkie interakcje, walidacje oraz scenariusze obsługi błędów.
10. Zaktualizować dokumentację oraz przeprowadzić code review.