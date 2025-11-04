

Tester Agent - AI Test Case Generator (PRD - Wersja Skrócona)
1. Przegląd Produktu
Nazwa: Tester Agent - AI-powered Test Case Generator
Status: MVP w fazie planowania
Typ: Wewnętrzne narzędzie firmowe (invite-only)
Stack: Astro + React, Supabase, Openrouter.ai, Docker, DigitalOcean
Cel: Automatyzacja tworzenia test case’ów poprzez AI. Użytkownicy wklejają dokumentację funkcjonalności, otrzymują gotowe TC w formacie CSV kompatybilnym z TestRail.
Wartość biznesowa: 50-70% redukcja czasu tworzenia test case’ów przy zachowaniu jakości i kompletności.
2. Problem i Rozwiązanie
Problem: Testerzy spędzają godziny na manualnym tworzeniu dokumentacji testowej - proces żmudny, powtarzalny, podatny na błędy.
Rozwiązanie: AI analizuje dokumentację → generuje tytuły TC → generuje szczegóły → użytkownik edytuje → eksport CSV do TestRail.
3. Kluczowe Wymagania Funkcjonalne
3.1. Autentykacja
	•	Invite-only registration (email + hasło)
	•	Weryfikacja email przed pierwszym logowaniem
	•	JWT token (7 dni validity)
	•	Supabase Auth + Row Level Security
	•	Zmiana hasła przez uzytkownika
3.2. Główny Workflow (4 etapy na jednej stronie)
Etap 1: Input dokumentacji
	•	Textarea: 100-5000 znaków (walidacja)
	•	Live character counter (format: “1250/5000”)
	•	Opcjonalna nazwa projektu
	•	Loading: “Analyzing requirements and generating test case titles…”
Etap 2: Zarządzanie tytułami
	•	AI generuje tytuły (0-20 max)
	•	Możliwość usuwania/dodawania tytułów manualnie
	•	Walidacja: min 1, max 20 tytułów na sesję
	•	Edge case: jeśli AI generuje 0 → komunikat + opcja retry + manual add
Etap 3: Generowanie szczegółów
	•	AI generuje dla każdego TC: preconditions, steps, expected result
	•	Progress indicator: “Generating details for test case 3 of 15…”
	•	Formularz edycji per TC z nawigacją Previous/Next
	•	Autosave w localStorage
	•	Ostatni TC: “Finish & Export”
Etap 4: Eksport + Rating
	•	CSV export (format TestRail): Title, Steps, Expected Result, Preconditions
	•	5-gwiazdkowy rating jakości generacji
	•	Redirect do dashboard
3.3. Dashboard
	•	Lista projektów (nazwa, data, liczba TC)
	•	Statystyki: total projects, total TC, średnia ocena
	•	Możliwość: przeglądanie szczegółów, re-export, usuwanie projektów
	•	“New Project” button
3.4. Obsługa Błędów
	•	Retry mechanizm (max 3 próby)
	•	Timeout: 2 minuty per AI call
	•	JSON Schema validation z fallback prompt
	•	Offline cache w localStorage
	•	Connection loss handling
4. Granice MVP
✅ W zakresie:
	•	AI generowanie tytułów i szczegółów TC
	•	Edycja wszystkich elementów TC
	•	CSV export (TestRail compatible)
	•	Supabase + RLS security
	•	localStorage cache/autosave
	•	Rating system
	•	Invite-only auth
❌ Poza zakresem:
	•	Multi-user collaboration
	•	Advanced analytics/reporting
	•	Direct TestRail API integration
	•	Template system
	•	Multi-language support
	•	Team management/roles
	•	Bulk operations
	•	Advanced AI features (fine-tuning, model selection)
5. Kluczowe Ograniczenia Techniczne
	•	Input: 100-5000 znaków dokumentacji
	•	Sesja: Max 20 test case’ów
	•	AI timeout: 2 minuty per call
	•	JWT validity: 7 dni
	•	Brak limitów: projekty per user (internal tool)
6. Kluczowe User Stories (Priorytet 1)
US-Core-1: Jako tester wklejam dokumentację (100-5000 chars) → AI generuje tytuły TC → mogę usuwać/dodawać → przechodzę dalej.
US-Core-2: AI automatycznie generuje szczegóły per TC → mogę edytować preconditions/steps/expected result → nawiguję między TC → kończę edycję.
US-Core-3: Eksportuję CSV kompatybilny z TestRail → oceniam jakość 1-5 gwiazdek → wracam do dashboard.
US-Core-4: Widzę dashboard z moimi projektami → mogę przeglądać szczegóły → re-exportować → usuwać projekty.
US-Core-5 Ekran logowania -> uzytkownik loguje się podanymi loginem i haslem > user jest na dashboard
US-Core-6 Ekran logowania -> Button Change password -> user wpisuje swojego maila -> otwiera link w mailu -> User wpisuje haslo i powtarza wciska button change password -> user jest na login screen
7. Metryki Sukcesu
Jakość Produktu:
	•	User Satisfaction: Średnia ocena ≥ 3.5/5 → cel: 4.0/5
	•	CSV Export Rate: ≥ 75% completion rate → cel: 85%+
Performance:
	•	AI Success Rate: ≥ 95% → cel: 98%+
	•	Generation Time: Tytuły < 10s, szczegóły < 5s per TC
	•	Error Rate: < 5% → cel: < 2%
Business Impact:
	•	Time Savings: 50-70% redukcja czasu vs manual process
	•	Time to First Export: Median < 1h od rejestracji → cel: < 30min
8. Workflow Techniczny (LLM Integration)
  1. User input → OpenAi API (titles generation)
  2. JSON Schema validation → fallback prompt if invalid
  3. Titles → OpenAI API per TC (details generation)  
  4. localStorage autosave → Supabase final save
  5. CSV generation → TestRail format → browser download
  Error Handling: Retry (max 3x) → Timeout (2min) → Fallback prompt → User notification → Cache preservation
Kluczowe elementy dla implementacji LLM: Input validation (100-5000 chars), JSON Schema dla AI output, timeout handling, fallback prompts, progress tracking, autosave cache, CSV formatting specification .