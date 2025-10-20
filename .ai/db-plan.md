<decisions>
Użytkownicy, Projekty i Test Cases będą kluczowymi encjami, z relacjami FK: każdy projekt powiązany jest z jednym użytkownikiem, a każdy przypadek testowy z jednym projektem.
Test Cases będą zawierać szczegółowe atrybuty: tytuł, preconditions, steps oraz expected result.
W encji Test Cases zostanie dodana kolumna odpowiadająca kolejności (np. order_index) umożliwiająca nawigację.
Tabela Projekty będzie przechowywać atrybuty takie jak nazwa, data utworzenia oraz ocena końcowa.
Limit 20 przypadków testowych na sesję będzie egzekwowany w warstwie aplikacji.
Tabela Użytkownicy będzie posiadać unikalny identyfikator Supabase Auth do integracji z systemem autoryzacji.
Zostanie zastosowane indeksowanie na często wyszukiwanych kolumnach (np. user_id w Projekty, project_id w Test Cases).
Implementacja RLS (Row-Level Security) zostanie przeprowadzona, aby każdy użytkownik miał dostęp tylko do swoich danych.
Zostanie wdrożona metoda soft delete poprzez dodanie kolumny typu deleted_at w tabelach Projekty i Test Cases.
Ograniczenia na długości pól tekstowych oraz dodanie kolumn z timestampami (np. dla autosave) są przewidziane zgodnie z wymaganiami.
</decisions>
<matched_recommendations>
Implementacja relacji między Użytkownicy, Projekty i Test Cases dla poprawnego mapowania własności.
Szczegółowe atrybuty w Test Cases, aby zachować integralność danych.
Użycie kolumny order_index w Test Cases w celu umożliwienia nawigacji.
Dodanie atrybutów do tabeli Projekty takich jak nazwa, data utworzenia i ocena.
Egzekwowanie limitu przypadków testowych w warstwie aplikacji.
Włączenie kolumny identyfikatora Supabase Auth w tabeli Użytkownicy.
Wdrożenie indeksowania na kluczowych kolumnach.
Implementacja RLS dla zabezpieczenia danych użytkowników.
Dodanie soft delete poprzez kolumnę deleted_at.
Ograniczenie długości pól tekstowych oraz dodanie timestampów zgodnie z wymaganiami.
</matched_recommendations>
<database_planning_summary>
Główne wymagania:
Utworzenie trzech głównych encji: Użytkownicy, Projekty oraz Test Cases.
Każdy projekt musi być powiązany z konkretnym użytkownikiem. Każdy przypadek testowy musi być przypisany do projektu.
Tabele mają zawierać istotne atrybuty: dla projekty – nazwa, data utworzenia, ocena; dla test cases – tytuł, preconditions, steps, expected result oraz kolumnę order_index.
Logika ograniczająca ilość przypadków testowych (max 20) będzie obsługiwana w warstwie aplikacji.
Specyfikacja wymaga zastosowania ograniczeń na długość tekstowych pól oraz timestampów przy autosave.
Zastosowanie indeksowania kluczowych kolumn (np. user_id, project_id) ma wspierać wydajność przy wyszukiwaniu.
Projekt przewiduje implementację RLS, aby użytkownicy widzieli tylko swoje dane, co zwiększa poziom bezpieczeństwa.
Wdrożenie mechanizmu soft delete umożliwi zachowanie historii danych bez trwałego usuwania.
</database_planning_summary>
<unresolved_issues>
Brak implementacji mechanizmu logowania akcji (audytu) w bazie danych.
Nie wdrożono tabeli lub mechanizmu przechowywania historii eksportów CSV.
Możliwość przyszłego rozszerzenia (np. wyzwalacze, materialized views) pozostaje otwarta, ale nie została szczegółowo omówiona na etapie MVP.
</unresolved_issues>

