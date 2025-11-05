
1. Wstęp i Cele
Niniejszy dokument opisuje strategię i plan testów dla aplikacji webowej służącej do generowania i zarządzania przypadkami testowymi z wykorzystaniem AI. Aplikacja oparta jest o nowoczesny stos technologiczny, w tym Astro, React, Supabase i OpenAI.

1.1. Cel testowania
Głównym celem testów jest zapewnienie wysokiej jakości, niezawodności, wydajności i bezpieczeństwa aplikacji przed jej wdrożeniem produkcyjnym. Proces testowy ma na celu weryfikację, czy aplikacja spełnia wszystkie wymagania funkcjonalne i niefunkcjonalne, a także identyfikację i eliminację defektów.

1.2. Zakres testowania (In Scope)
Testy obejmą wszystkie kluczowe moduły i funkcjonalności aplikacji:

Uwierzytelnianie: Logowanie, wylogowywanie, zmiana hasła.
Tworzenie nowego projektu: Wprowadzanie dokumentacji, generowanie tytułów przypadków testowych.
Edycja tytułów: Modyfikacja, dodawanie i usuwanie tytułów.
Generowanie szczegółów przypadków testowych: Proces generowania zapytań do AI, nawigacja, edycja i autozapis.
Dashboard: Wyświetlanie listy projektów, statystyk, paginacja, usuwanie i eksport projektów.
Eksport do CSV: Podgląd danych i generowanie pliku CSV.
API Backend: Wszystkie endpointy w src/pages/api/.
Middleware: Weryfikacja działania mechanizmów rate limiting, limitu rozmiaru payloadu i autoryzacji.
1.3. Poza zakresem (Out of Scope)
Testy wewnętrznej infrastruktury Supabase i DigitalOcean (zakładamy niezawodność dostawców).
Testy samego modelu językowego OpenAI pod kątem poprawności merytorycznej (skupiamy się na integracji i obsłudze odpowiedzi).
Szczegółowe testy bibliotek firm trzecich (np. Shadcn/ui, Zod), zakładając ich poprawne działanie. Testowana będzie jedynie ich integracja z aplikacją.
2. Strategie Testowania
Zastosujemy wielopoziomowe podejście do testowania (piramida testów), aby zapewnić kompleksowe pokrycie i wczesne wykrywanie błędów.

2.1. Rodzaje testów do przeprowadzenia
Analiza statyczna kodu: ESLint i Prettier (już zintegrowane) do zapewnienia spójności i jakości kodu.
Testy jednostkowe (Unit Tests): Skupione na izolowanych funkcjach, hookach i usługach w src/lib oraz src/components. Projekt już zawiera testy dla niektórych komponentów (np. DashboardView.test.tsx), co jest dobrą podstawą do rozbudowy.
Testy komponentów (Component Tests): Weryfikacja pojedynczych komponentów React w izolacji, sprawdzanie ich renderowania, stanu i interakcji. Wykorzystanie Vitest i React Testing Library.
Testy integracyjne (Integration Tests): Testowanie współpracy między komponentami, usługami i API. Szczególny nacisk na integrację frontend-backend (API endpoints) oraz integrację z localStorage (np. TitlesService). Istniejący plik projects.integration.test.ts jest wzorcem do naśladowania.
Testy End-to-End (E2E): Symulacja pełnych przepływów użytkownika w przeglądarce, od logowania po eksport pliku CSV.
Testy API: Bezpośrednie testowanie endpointów API w src/pages/api pod kątem logiki biznesowej, walidacji danych (Zod schemas) i obsługi błędów.
Testy niefunkcjonalne: Weryfikacja wydajności, bezpieczeństwa, dostępności i kompatybilności.
2.2. Priorytety testów
P1 (Krytyczne): Przepływ tworzenia projektu (generowanie tytułów i szczegółów), uwierzytelnianie, zapis i odczyt danych z Supabase. To są kluczowe funkcje aplikacji.
P2 (Wysokie): Funkcjonalności dashboardu (wyświetlanie, usuwanie, paginacja), edycja tytułów, eksport do CSV.
P3 (Średnie): Testy walidacji formularzy po stronie klienta, obsługa stanów krańcowych (np. brak projektów), responsywność interfejsu.
P4 (Niskie): Drobne elementy UI, stylowanie, komunikaty informacyjne.
2.3. Kryteria akceptacji
Wszystkie scenariusze testowe dla priorytetów P1 i P2 zakończone pomyślnie.
Brak błędów krytycznych i blokujących.
Pokrycie kodu testami jednostkowymi i integracyjnymi na poziomie > 80% dla nowej logiki biznesowej.
Spełnienie wymagań niefunkcjonalnych (wydajność, bezpieczeństwo).
3. Plan Testów Funkcjonalnych

3.1. Obszary krytyczne do testowania
Moduł Uwierzytelniania (/auth)
Moduł Tworzenia Projektu (/new-project)
Moduł Generowania Szczegółów (/generate-details)
Moduł Panelu Głównego (/dashboard)
Moduł Eksportu (/export)
Warstwa API (/api)
3.2. Scenariusze testowe i spodziewane rezultaty
Moduł: Uwierzytelnianie

Scenariusz: Logowanie z poprawnymi danymi.
Spodziewany Rezultat: Użytkownik zostaje zalogowany i przekierowany do /dashboard.
Priorytet: P1
Scenariusz: Logowanie z niepoprawnymi danymi.
Spodziewany Rezultat: Wyświetlany jest komunikat o błędzie. Użytkownik pozostaje na stronie logowania.
Priorytet: P1
Scenariusz: Żądanie resetu hasła dla istniejącego emaila.
Spodziewany Rezultat: Wyświetlany jest komunikat o wysłaniu linku.
Priorytet: P2
Scenariusz: Wylogowanie.
Spodziewany Rezultat: Użytkownik zostaje wylogowany i przekierowany na stronę logowania.
Priorytet: P1
Moduł: Tworzenie Projektu

Scenariusz: Generowanie tytułów z poprawną dokumentacją (100-5000 znaków).
Spodziewany Rezultat: Aplikacja przechodzi do widoku edycji (/new/edit-titles) z wygenerowaną listą tytułów.
Priorytet: P1
Scenariusz: Próba generowania z niepoprawną dokumentacją (<100 lub >5000 znaków).
Spodziewany Rezultat: Przycisk "Generate" jest nieaktywny lub wyświetla błąd walidacji.
Priorytet: P2
Scenariusz: Edycja, dodawanie (do 20) i usuwanie (do min. 1) tytułów.
Spodziewany Rezultat: Zmiany są poprawnie zapisywane w localStorage i odzwierciedlane w UI.
Priorytet: P2
Moduł: Generowanie Szczegółów

Scenariusz: Pomyślne wygenerowanie szczegółów dla wszystkich tytułów.
Spodziewany Rezultat: Wszystkie przypadki testowe mają status "completed" i wypełnione pola.
Priorytet: P1
Scenariusz: Nawigacja (w przód i w tył) między przypadkami testowymi.
Spodziewany Rezultat: Aplikacja poprawnie wyświetla i zarządza currentIndex.
Priorytet: P2
Scenariusz: Ręczna edycja wygenerowanych danych i autozapis.
Spodziewany Rezultat: Zmiany są zapisywane w localStorage (mechanizm useAutosave).
Priorytet: P2
Scenariusz: Obsługa błędu podczas generowania z API OpenAI.
Spodziewany Rezultat: Przypadek testowy ma status "error" i wyświetla komunikat o błędzie. Użytkownik może kontynuować pracę.
Priorytet: P1
Moduł: Dashboard

Scenariusz: Wyświetlanie listy projektów z poprawną paginacją.
Spodziewany Rezultat: Projekty są wyświetlane, a nawigacja między stronami działa poprawnie.
Priorytet: P2
Scenariusz: Usuwanie projektu.
Spodziewany Rezultat: Projekt jest usuwany z listy (soft delete w DB), a UI jest odświeżane.
Priorytet: P2
Moduł: Eksport

Scenariusz: Przejście do widoku eksportu i pobranie pliku CSV.
Spodziewany Rezultat: Plik CSV jest generowany i pobierany, a jego zawartość jest zgodna z danymi projektu.
Priorytet: P2
Moduł: API

Scenariusz: Testowanie endpointu POST /api/ai/generate z poprawnym i niepoprawnym ciałem żądania.
Spodziewany Rezultat: Endpoint zwraca poprawną strukturę JSON lub odpowiedni kod błędu (400/500).
Priorytet: P1
Scenariusz: Testowanie endpointów CRUD /api/projects.
Spodziewany Rezultat: Endpointy działają zgodnie ze specyfikacją, poprawnie walidują dane i zwracają odpowiednie kody statusu.
Priorytet: P1


4. Dane Testowe
Użytkownicy: Co najmniej dwóch różnych użytkowników testowych do weryfikacji izolacji danych.
Dokumentacja projektowa:
Krótka (ok. 150 słów).
Długa (ok. 4500 słów).
Zawierająca specjalistyczne słownictwo techniczne.
Przypadki testowe:
Projekt bez przypadków testowych.
Projekt z maksymalną liczbą przypadków testowych (20).
Dane zawierające znaki specjalne, długie ciągi tekstu bez spacji.
5. Środowisko Testowe
Środowisko lokalne: Używane przez deweloperów do uruchamiania testów jednostkowych i integracyjnych.
Środowisko Staging/Testowe: Oddzielna instancja aplikacji hostowana na DigitalOcean, połączona z osobnym projektem Supabase. Środowisko to powinno być jak najwierniejszą kopią środowiska produkcyjnego. Tutaj będą przeprowadzane testy E2E, wydajnościowe i UAT.
Narzędzia i frameworki:
Test Runner: Vitest.
Biblioteki do testowania: React Testing Library.
Testy E2E: Playwright.
Testy API: Playwright.

CI/CD: GitHub Actions (uruchamianie testów automatycznych przy każdym pushu i PR).



Warunki powodzenia:
100% testów P1 zakończonych pomyślnie.
>95% testów P2 zakończonych pomyślnie.
Brak znanych błędów o statusie "Krytyczny" lub "Blokujący".
Wszystkie udokumentowane przypadki użycia zostały przetestowane.
Warunki porażki (powody do wstrzymania wydania):
Odnalezienie błędu o statusie "Krytyczny", który nie może być naprawiony w ustalonym czasie.
Niska wydajność kluczowych funkcji.
Poważna luka bezpieczeństwa.
Ścieżka decyzyjna: Ostateczną decyzję o wydaniu podejmuje Product Owner/Manager Projektu na podstawie raportu końcowego z testów i oceny pozostałych ryzyk.