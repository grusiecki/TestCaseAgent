# Specyfikacja systemu autentykacji

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Strony i Layouty
- **Strony logowania i odzyskiwania hasła**:
  - Strona logowania (`/login.astro` lub odpowiednia strona w Astro) oparta na layoutzie dedykowanym do autentykacji (np. `AuthLayout.astro`).
  - Strona odzyskiwania hasła (`/change-password.astro`) wraz z odpowiednim layoutem.


### Komponenty i Formularze
- **Komponenty React (client-side)**:
  - `LoginForm.tsx`: Formularz logowania zawierający pola: email, hasło oraz przycisk logowania.
  - `ChangePasswordForm.tsx`: Formularz do zmiany hasła. Użytkownik podaje swój email, a następnie otrzymuje link do resetu. Po kliknięciu linku użytkownik podaje nowe hasło i potwierdza je.
  - `AuthFeedback.tsx`: Komponent wyświetlający komunikaty błędów, walidacji (np. niepoprawny format email, puste pola) oraz informacje o postępie (np. "Logowanie...", "Wysyłanie linku resetującego...").

### Podział odpowiedzialności pomiędzy Astro a React
- **Strony Astro**:
  - Odpowiedzialne za inicjalizację sesji, renderowanie layoutów i integrację z backendem (np. sprawdzanie stanu sesji przed renderowaniem strony chronionej).
  - Ułatwienie nawigacji pomiędzy stronami (np. po poprawnym logowaniu, przekierowanie do dashboardu).
- **Komponenty React**:
  - Obsługa interakcji użytkownika na poziomie formularzy, walidacja danych wejściowych w czasie rzeczywistym.
  - Dynamiczne wyświetlanie komunikatów błędów i informacji zwrotnych.

### Walidacja i Komunikaty Błędów
- **Walidacja na poziomie klienta**:
  - Sprawdzenie poprawności formatu email, wymagalność pola hasła.
  - Natychmiastowa walidacja pól i wyświetlanie komunikatów (np. "Pole email jest wymagane", "Hasło musi zawierać minimum 8 znaków").
- **Walidacja na poziomie serwera**:
  - Dodatkowe sprawdzenie poprawności danych wejściowych przy każdym żądaniu do API,
  - Obsługa błędów autentykacji (np. niepoprawne dane, wygasły token, brak uprawnień) z odpowiednimi komunikatami dla użytkownika.

### Scenariusze Użytkownika
- **Logowanie (US-Core-5)**:
  - Użytkownik przechodzi do strony logowania, wypełnia formularz.
  - Po wysłaniu formularza, dane są przesyłane do API logowania.
  - W przypadku błędu (np. niepoprawne dane) wyświetlany jest komunikat oraz możliwość ponowienia próby.
  - W przypadku sukcesu, użytkownik zostaje przekierowany do dashboardu.
- **Odzyskiwanie hasła (US-Core-6)**:
  - Użytkownik wybiera opcję "Change Password".
  - System wysyła email z linkiem resetującym hasło.
  - Po przejściu na stronę resetu hasła, użytkownik wprowadza nowe hasło i potwierdza je.
  - Po poprawnej zmianie hasła, użytkownik zostaje przekierowany na stronę logowania.

## 2. LOGIKA BACKENDOWA

### Struktura Endpointów API
- **/api/auth/login**: Przyjmuje dane logowania (email, hasło), weryfikuje je i zwraca token JWT oraz informacje o sesji.
- **/api/auth/logout**: Unieważnia aktualną sesję użytkownika.
- **/api/auth/register**: (Opcjonalnie, jeśli rejestracja przez zaproszenie) przyjmuje dane rejestracji, weryfikuje je i tworzy nowe konto użytkownika.
- **/api/auth/request-password-reset**: Przyjmuje email użytkownika, wysyła email z linkiem resetu hasła.
- **/api/auth/reset-password**: Aktualizuje hasło użytkownika na podstawie tokenu resetującego.

### Modele Danych i Kontrakty
- **Model Użytkownika**:
  - Pola: id, email, hashedPassword, createdAt, updatedAt, status (aktywny, nieaktywny) itd.
- **Model Sesji**:
  - Informacje o ważności tokenu, data expiracji, powiązanie z użytkownikiem.

### Mechanizm Walidacji
- **Walidacja wejścia**:
  - JSON Schema lub inne rozwiązanie do walidacji danych wejściowych w endpointach.
  - Sprawdzanie wymagalności pól oraz zgodności ich formatu.
- **Obsługa Wyjątków**:
  - Globalny middleware do obsługi błędów, który przechwytuje wyjątki i zwraca odpowiednie kody HTTP oraz komunikaty.
  - Logowanie błędów w dedykowanym module (np. w `src/lib/logging/`).

### Aktualizacja Renderowania Serwerowego
- Integracja z `astro.config.mjs` oraz wykorzystanie możliwości Astro do server-side rendering.
- Dynamiczne ładowanie layoutów w zależności od stanu autentykacji użytkownika (np. przekierowywanie do strony logowania, jeśli brak ważnej sesji).

## 3. SYSTEM AUTENTYKACJI

### Wykorzystanie Supabase Auth
- **Rejestracja i autoryzacja**:
  - Użycie Supabase Auth do zarządzania kontami użytkowników, weryfikacji email oraz zabezpieczeń.
  - Integracja z mechanizmem Row Level Security (RLS) w bazie danych.
- **Tokenizacja i sesje**:
  - Generowanie JWT z ważnością 7 dni.
  - Przechowywanie i odświeżanie tokenów podczas logowania.
- **Odzyskiwanie konta**:
  - Mechanizm wysyłania emaila z linkiem do zmiany hasła.
  - Proces resetowania hasła, weryfikacja tokenu resetującego i aktualizacja danych w bazie.

### Integracja z Astro i Frontendem
- Backend dostarcza niezbędne API, a strony Astro zarządzają routinguem i renderowaniem odpowiednich layoutów.
- Frontend (React) komunikuje się z API za pomocą fetch/axios, zarządzając stanem autentykacji w aplikacji.

## Podsumowanie
Kluczowe elementy systemu autentykacji obejmują:
- Spójną architekturę warstwy użytkownika, rozdzielającą logikę wizualną (React) od stron serwerowych (Astro).
- Bezpieczne endpointy API i walidację po stronie serwera, z dodatkową walidacją na poziomie klienta.
- Wykorzystanie Supabase Auth dla zarządzania kontami użytkowników, z pełną obsługą rejestracji, logowania, wylogowywania oraz odzyskiwania hasła.

Ta specyfikacja stanowi podstawę do implementacji modułu autentykacji w ramach istniejącej architektury systemu, zgodnie z wymaganiami i technologiami określonymi w dokumentacji produktu oraz stacku technologicznym.
