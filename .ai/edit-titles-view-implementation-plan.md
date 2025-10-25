# Plan implementacji widoku Edytowanie Tytułów Test Case'ów

## 1. Przegląd
Widok umożliwia użytkownikowi przegląd, edycję oraz modyfikację listy wygenerowanych tytułów test case'ów. Użytkownik może dodawać nowe tytuły, edytować istniejące oraz usuwać niepotrzebne, przy jednoczesnej walidacji liczby tytułów (od 1 do 20). Dodatkowo, widok zapewnia autosave, dzięki czemu zmiany są natychmiast synchronizowane z lokalnym stanem.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką /new/edit-titles.

## 3. Struktura komponentów
- Główny komponent widoku: 
  - Komponent listy tytułów: 
    - Komponent pojedynczego elementu tytułu: 
      - Pole tekstowe do edycji tytułu
      - Przycisk edycji
      - Przycisk usuwania
  - Komponent przycisku dodawania tytułu: 
  - Komponent walidacji:  (wyświetla komunikaty o błędach walidacji ilości)

## 4. Szczegóły komponentów
### EditTitlesView
- Opis: Główny kontener widoku, który pobiera początkowe dane tytułów, zarządza stanem listy oraz obsługuje autosave.
- Główne elementy: nagłówek, , , .
- Obsługiwane interakcje: inicjalizacja stanu, przekazywanie akcji do podsieci oraz integracja autosave.
- Walidacja: zapewnienie, że lista zawiera przynajmniej 1 tytuł oraz nie więcej niż 20.
- Typy: ViewModel zawierający tablicę tytułów (string[]), flagę walidacji, status autosave.
- Propsy: brak, widok inicjuje własny stan.

### TitlesList
- Opis: Wyświetla listę elementów tytułów, umożliwiając edycję każdego elementu.
- Główne elementy: iteracja po tablicy tytułów, renderowanie komponentu  dla każdego wpisu.
- Obsługiwane interakcje: przekazywanie zmienionego tytułu, usuwanie tytułu.
- Walidacja: delegowana do  na poziomie rodzica.
- Typy: lista stringów przekazywanych jako props.
- Propsy: , , , .

### TitleItem
- Opis: Pojedynczy element listy tytułów, z polem tekstowym umożliwiającym edycję oraz przyciskami do edycji i usuwania.
- Główne elementy: pole input, przyciski Edytuj i Usuń.
- Obsługiwane interakcje: zmiana wartości inputa, wywołanie funkcji usuwania lub potwierdzenia edycji.
- Walidacja: możliwość akceptacji tylko tekstu niepustego.
- Typy: pojedynczy tytuł (string) oraz indeks (number).
- Propsy: , , , .

### AddTitleButton
- Opis: Przycisk umożliwiający dodanie nowego, domyślnego tytułu do listy.
- Główne elementy: przycisk z ikoną lub tekstem Dodaj tytuł.
- Obsługiwane interakcje: kliknięcie powoduje wywołanie funkcji dodania nowego tytułu.
- Walidacja: przed dodaniem sprawdzenie, czy liczba tytułów nie przekracza 20.
- Typy: brak oddzielnego modelu, operuje na stringie.
- Propsy: .

### TitlesValidator
- Opis: Komponent odpowiedzialny za wyświetlanie komunikatów walidacyjnych, np. przekroczenie limitu tytułów lub brak tytułu.
- Główne elementy: komunikat błędu wyświetlany użytkownikowi.
- Obsługiwane interakcje: dynamiczna aktualizacja komunikatu w oparciu o zmiany stanu listy.
- Walidacja: sprawdzenie minimalnej (1) i maksymalnej (20) liczby tytułów.
- Typy: proste flagi walidacji i komunikat (string).
- Propsy: .

## 5. Typy
Nowe typy widoku:
- : {
    titles: string[];        // Lista tytułów
    errorMessage: string | null;  // Komunikat walidacyjny
    isAutosaving: boolean;   // Flaga statusu autosave
  }

Inne typy wykorzystywane z definicji:
-  z pliku types.ts (choć głównie do operacji AI, nie bezpośrednio w widoku edycji).

## 6. Zarządzanie stanem
- Widok  zarządza stanem listy tytułów lokalnie z użyciem hooka .
- Możliwe wykorzystanie custom hooka  do obsługi automatycznego zapisywania zmian lokalnych do localStorage.
- Stan obejmuje tablicę tytułów, ewentualny komunikat walidacyjny oraz flagę informującą o trwającym autosave.

## 7. Integracja API
- W tym widoku API nie jest bezpośrednio integrowane, ponieważ edycja tytułów odbywa się lokalnie.
- Autosave może synchronizować lokalny stan z API (np. POST do endpointu '/new/update-titles') – jeśli będzie taka potrzeba, należy dodać odpowiednie wywołanie API wykorzystujące typy:  lub dedykowany endpoint.

## 8. Interakcje użytkownika
- Edycja tytułu: użytkownik modyfikuje istniejący tytuł, zmiana jest zapisywana lokalnie i walidowana (nie pusty tekst).
- Usuwanie tytułu: użytkownik usuwa tytuł, system sprawdza, czy lista nie spadła poniżej jednego tytułu i wyświetla komunikat walidacyjny, jeśli tak.
- Dodawanie tytułu: użytkownik klika przycisk, a system dodaje nowy domyślny (pusty) tytuł do listy, pod warunkiem, że liczba tytułów nie przekracza 20.
- Autosave: zmiany w stanie widoku są automatycznie zapisywane lokalnie.

## 9. Warunki i walidacja
- Minimalna liczba tytułów: 1
- Maksymalna liczba tytułów: 20
- Walidacja pola tekstowego: tytuł nie może być pusty
- Przed dodaniem nowego tytułu należy sprawdzić, czy liczba tytułów jest poniżej 20.

## 10. Obsługa błędów
- Błędy walidacji (np. brak tytułu lub przekroczenie limitu) są wyświetlane za pomocą komponentu .
- W przypadku nieudanej operacji autosave (jeśli zastosowane API) powinna zostać wyświetlona informacja o błędzie oraz możliwość ponowienia akcji.

## 11. Kroki implementacji
1. Stworzenie głównego komponentu  oraz zarządzanie stanem listy tytułów.
2. Implementacja komponentu  do dynamicznego renderowania listy.
3. Utworzenie komponentu  z obsługą pola tekstowego i przycisków edycji/usuwania.
4. Dodanie komponentu  do umożliwienia dodania nowego tytułu.
5. Implementacja komponentu  do wyświetlania komunikatów błędów walidacyjnych.
6. Zaimplementowanie logiki walidacji stanu (min 1, max 20 tytułów) w głównym komponencie.
7. Dodanie mechanizmu autosave (custom hook  lub bezpośrednia implementacja) synchronizującego zmiany z localStorage lub API.
8. Testowanie interakcji użytkownika i scenariuszy błędów.
9. Refaktoryzacja oraz dokumentacja kodu.

