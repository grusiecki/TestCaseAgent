# API Endpoint Implementation Plan: POST /projects

## 1. Przegląd punktu końcowego
Endpoint służy do tworzenia nowego projektu. Jego głównym celem jest zarejestrowanie projektu, wraz z opcjonalnymi tytułami test case’ów. Dodatkowo implementacja zapewnia walidację limitu (maksymalnie 20 tytułów) oraz właściwą autoryzację, aby tylko uprawnieni użytkownicy mogli stworzyć nowy projekt.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: /projects
- **Parametry**:
  - **Wymagane**:
    - `name` (string) – nazwa projektu
  - **Opcjonalne**:
    - `initialTitles` (string[]) – tablica początkowych tytułów test case’ów; limit: maksymalnie 20 elementów
- **Request Body**:
  ```json
  {
    "name": "Project Name",
    "initialTitles": ["Title 1", "Title 2", "..."]
  }
  ```

## 3. Wykorzystywane typy
- **Command Model**:
  - `CreateProjectCommand` (definiowany w `src/types.ts`): zawiera `name` (wymagane) oraz opcjonalne `initialTitles`
- **DTO**:
  - `ProjectDTO` – reprezentuje podsumowanie utworzonego projektu (z polami: `id`, `name`, `created_at`, `rating`, `testCaseCount`)
  
## 4. Szczegóły odpowiedzi
- **Sukces**:
  - Kod: 201 Created
  - Treść odpowiedzi:
    ```json
    {
      "id": "uuid",
      "name": "Project Name",
      "created_at": "timestamp"
    }
    ```
- **Błędy**:
  - 400 Bad Request – dla nieprawidłowych danych wejściowych, np. gdy liczba przesłanych `initialTitles` przekracza 20
  - 401 Unauthorized – gdy użytkownik nie jest zalogowany lub nie ma dostępu

## 5. Przepływ danych
1. Klient wysyła żądanie POST z danymi w ciele żądania.
2. Warstwa middleware sprawdza autoryzację i przekazuje obiekt `supabase` pobrany z `context.locals`.
3. Kontroler wywołuje dedykowaną logikę (service), która:
   - Waliduje strukturę danych wejściowych przy użyciu narzędzi (np. Zod) oraz reguł biznesowych (sprawdzenie limitu 20 tytułów)
   - Inicjuje transakcję tworzenia rekordu projektu w bazie danych, a w razie przekazania także tworzy powiązane rekordy test case’ów
4. Po zakończeniu operacji, dane nowo utworzonego projektu (DTO) są zwracane jako wynik odpowiedzi.

## 6. Względy bezpieczeństwa
- **Autoryzacja**: Upewnienie się, że żądanie pochodzi od uwierzytelnionego użytkownika. Wykorzystanie obiektu `supabase` z `context.locals` do odczytania kontekstu sesji.
- **Walidacja danych**: Walidacja struktury wejściowej oraz limitu liczby tytułów (maks. 20).
- **RLS (Row-Level Security)**: Gwarantuje, że użytkownik może uzyskać dostęp tylko do swoich danych.
- **Bezpieczne komunikaty błędów**: Unikanie ujawniania wrażliwych informacji z systemu podczas raportowania błędów.

## 7. Obsługa błędów
- **Błędy walidacji**: Gdy dane wejściowe nie spełniają wymagań (np. przekroczono limit `initialTitles`) – zwrócenie 400 Bad Request z odpowiednim komunikatem.
- **Błędy autoryzacji**: Brak uwierzytelnienia lub niewystarczające uprawnienia – zwrócenie 401 Unauthorized.
- **Błędy wewnętrzne**: Problemy bazy danych lub serwera – zwrócenie 500 Internal Server Error oraz logowanie błędu dla dalszej analizy.
- Opcjonalnie, implementacja rejestrowania nieudanych prób lub wyjątków do dedykowanej tabeli błędów (jeśli dotyczy).

## 8. Rozważania dotyczące wydajności
- **Indeksowanie**: Upewnienie się, że stosowane indeksy na polach wykorzystywanych przy wyszukiwaniu (np. user_id w projektach) są zoptymalizowane.
- **Transakcje**: Grupowanie operacji (tworzenie projektu i ewentualnych test case’ów) w pojedynczej transakcji, aby zagwarantować spójność danych.
- **Ograniczenie liczby test case’ów**: Walidacja na poziomie aplikacji ograniczająca liczbę test case’ów do 20, co zapobiega potencjalnemu nadużywaniu endpointu.

## 9. Etapy wdrożenia
1. **Walidacja wejścia**: 
   - Utworzenie lub modyfikacja schematu walidacji (np. przy użyciu Zod) dla `CreateProjectCommand`.
   - Walidacja liczby przekazanych `initialTitles`.
2. **Implementacja logiki biznesowej**:
   - Utworzenie nowej funkcji serwisowej (`ProjectService.createProject`) odpowiedzialnej za zapis projektu i powiązanych rekordów test case’ów.
   - Obsługa błędów oraz transakcji.
3. **Kontroler API**:
   - Utworzenie lub modyfikacja kontrolera odpowiedzialnego za obsługę POST /projects.
   - Integracja walidacji i logiki serwisowej.
4. **Autoryzacja i bezpieczeństwo**:
   - Weryfikacja użytkownika przy użyciu obiektu `supabase` z `context.locals`.
   - Implementacja mechanizmów RLS.
5. **Testy**:
   - Unit testy dla logiki serwisowej.
   - Testy integracyjne end-to-end dla endpointu, aby zweryfikować poprawność walidacji, transakcji i obsługi błędów.
6. **Monitorowanie i logowanie**:
   - Implementacja logowania błędów (ewentualnie do dedykowanej tabeli logów błędów).
   - Monitorowanie statystyk użycia endpointu pod kątem potencjalnych problemów wydajnościowych.
7. **Dokumentacja**:
   - Aktualizacja dokumentacji API oraz kodu, aby zawierał informacje o nowym endpointzie wraz z przykładami użycia.
