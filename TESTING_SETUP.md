# Testing Environment Setup - Completion Guide

## ✅ Co zostało skonfigurowane

### 1. Pliki konfiguracyjne
- ✅ `vitest.config.ts` - Konfiguracja Vitest z jsdom, coverage, i progami pokrycia 80%
- ✅ `playwright.config.ts` - Konfiguracja Playwright z Chromium, trace, screenshots
- ✅ `tests/setup.ts` - Globalny setup dla Vitest z mockami (localStorage, matchMedia, IntersectionObserver, ResizeObserver)

### 2. Struktura katalogów testowych
```
tests/
├── setup.ts                      ✅
├── README.md                     ✅ (pełna dokumentacja)
├── fixtures/
│   └── test-data.ts             ✅ (dane testowe, użytkownicy, projekty, API endpoints)
├── utils/
│   └── test-helpers.ts          ✅ (funkcje pomocnicze do testów E2E)
├── e2e/
│   ├── pages/
│   │   ├── BasePage.ts          ✅ (bazowa klasa Page Object Model)
│   │   ├── LoginPage.ts         ✅ (POM dla logowania)
│   │   └── DashboardPage.ts     ✅ (POM dla dashboardu)
│   ├── auth.e2e.test.ts         ✅ (testy E2E autentykacji)
│   └── dashboard.e2e.test.ts    ✅ (testy E2E dashboardu)
└── api/
    └── README.md                 ✅ (dokumentacja testów API)
```

### 3. Package.json - Skrypty testowe
```json
✅ "test": "vitest run"
✅ "test:watch": "vitest watch"
✅ "test:ui": "vitest --ui"
✅ "test:coverage": "vitest run --coverage"
✅ "test:e2e": "playwright test"
✅ "test:e2e:ui": "playwright test --ui"
✅ "test:e2e:headed": "playwright test --headed"
✅ "test:e2e:debug": "playwright test --debug"
✅ "test:all": "npm run test && npm run test:e2e"
✅ "playwright:install": "playwright install chromium"
✅ "playwright:codegen": "playwright codegen"
```

### 4. GitHub Actions CI/CD
- ✅ `.github/workflows/test.yml` - Pełny workflow testowy:
  - Testy jednostkowe (Node 18 & 20)
  - Testy E2E
  - Type checking
  - Build verification
  - Coverage reports
  - Artifacts (raporty, build)
  
- ✅ `.github/workflows/deploy-staging.yml` - Deployment do staging z testami

### 5. Pliki pomocnicze
- ✅ `.env.test.example` - Szablon zmiennych środowiskowych dla testów
- ✅ `.gitignore.test` - Lista plików do ignorowania (coverage, test-results, etc.)
- ✅ `tests/README.md` - Kompletna dokumentacja testowania

### 6. Package.json - Zależności
```json
"devDependencies": {
  ✅ "@playwright/test": "^1.56.1",
  ✅ "@testing-library/jest-dom": "^6.9.1",
  ✅ "@vitest/coverage-v8": "^3.2.4",
  ✅ "@vitest/ui": "^3.2.4",
  ✅ "vitest": "^3.2.4"
}
```

---

## ⚠️ Co wymaga dokończenia przez użytkownika

### 1. Reinstalacja zależności npm

Problem: Pakiety testowe są w `package.json`, ale nie zainstalowały się poprawnie w `node_modules`.

**Rozwiązanie**:
```bash
# Przejdź do katalogu projektu
cd /Users/grusznic/TestAgent/TestCaseAgent

# Wyczyść cache npm (opcjonalnie, jeśli są problemy)
npm cache clean --force

# Usuń node_modules i package-lock.json
rm -rf node_modules package-lock.json

# Zainstaluj wszystkie zależności na nowo
npm install

# Zainstaluj przeglądarki Playwright
npx playwright install chromium
```

### 2. Konfiguracja środowiska testowego

**a) Skopiuj i wypełnij .env.test**:
```bash
cp .env.test.example .env.test
# Edytuj .env.test i wypełnij prawdziwe dane testowe
```

**b) Utwórz osobny projekt Supabase dla testów**:
- Sklonuj obecny projekt lub utwórz nowy
- Wypełnij w `.env.test`:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`

**c) Utwórz użytkowników testowych w Supabase**:
```sql
-- W Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test@example.com', crypt('TestPassword123!', gen_salt('bf')), now());
```

### 3. Aktualizacja .gitignore

Dodaj zawartość z `.gitignore.test` do głównego `.gitignore`:
```bash
cat .gitignore.test >> .gitignore
```

### 4. Konfiguracja GitHub Secrets (dla CI/CD)

W ustawieniach repozytorium GitHub (Settings → Secrets and variables → Actions), dodaj:

**Wymagane sekrety**:
- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`
- `TEST_OPENROUTER_API_KEY`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

**Opcjonalne dla deployment**:
- `DIGITALOCEAN_ACCESS_TOKEN`
- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_ANON_KEY`
- `STAGING_OPENROUTER_API_KEY`

---

## 🧪 Uruchomienie testów

### Po zainstalowaniu zależności:

**1. Testy jednostkowe i integracyjne**:
```bash
# Uruchom wszystkie testy
npm run test

# Watch mode (podczas developmentu)
npm run test:watch

# Z UI (wizualne narzędzie)
npm run test:ui

# Z coverage
npm run test:coverage
```

**2. Testy E2E**:
```bash
# Najpierw uruchom aplikację
npm run build
npm run preview

# W innym terminalu - uruchom testy E2E
npm run test:e2e

# Lub w trybie headed (widzisz przeglądarkę)
npm run test:e2e:headed

# Lub w trybie debug
npm run test:e2e:debug

# Lub z UI Playwright
npm run test:e2e:ui
```

**3. Wszystkie testy razem**:
```bash
npm run test:all
```

---

## 📝 Następne kroki (rekomendowane)

### 1. Rozbuduj istniejące testy
Istniejące testy to templates. Dostosuj je do rzeczywistej implementacji:

```typescript
// Zaktualizuj selektory w Page Object Models
// tests/e2e/pages/LoginPage.ts
this.emailInput = page.locator('[data-testid="email-input"]'); // Użyj prawdziwych selektorów

// Zaktualizuj dane testowe
// tests/fixtures/test-data.ts
export const TEST_USERS = {
  valid: {
    email: 'twój-prawdziwy-test-email@example.com',
    password: 'prawdziwe-hasło'
  }
};
```

### 2. Dodaj więcej Page Object Models
```bash
# Przykłady do stworzenia:
tests/e2e/pages/NewProjectPage.ts      # Tworzenie projektu
tests/e2e/pages/EditTitlesPage.ts      # Edycja tytułów
tests/e2e/pages/GenerateDetailsPage.ts # Generowanie szczegółów
tests/e2e/pages/ExportPage.ts          # Eksport CSV
```

### 3. Dodaj testy dla pozostałych modułów
Zgodnie z test-plan.md, stwórz testy dla:
- ✅ Authentication (gotowe)
- ✅ Dashboard (gotowe)
- ⏳ New Project flow
- ⏳ Title editing
- ⏳ Detail generation
- ⏳ CSV export
- ⏳ API endpoints

### 4. Testy API
Dodaj bezpośrednie testy API w `tests/api/`:
```typescript
// tests/api/projects.api.test.ts
import { test, expect } from '@playwright/test';

test('GET /api/projects returns projects', async ({ request }) => {
  const response = await request.get('/api/projects');
  expect(response.ok()).toBeTruthy();
});
```

### 5. Monitoring pokrycia kodu
```bash
# Uruchom z coverage i sprawdź raport
npm run test:coverage
open coverage/index.html  # macOS
# lub
xdg-open coverage/index.html  # Linux
```

Cel: **>80% pokrycia dla nowej logiki biznesowej**

---

## 📚 Dokumentacja

Wszystkie szczegóły znajdują się w:
- `tests/README.md` - pełna dokumentacja testowania
- `.ai/test-plan.md` - strategia i plan testów
- `README.md` - zaktualizowane o sekcję testowania

---

## ✅ Checklist przed commitem

- [ ] Zależności zainstalowane: `npm list @playwright/test vitest`
- [ ] Playwright browsers: `npx playwright install chromium`
- [ ] Plik .env.test skonfigurowany
- [ ] Testy jednostkowe przechodzą: `npm run test`
- [ ] Aplikacja się buduje: `npm run build`
- [ ] .gitignore zaktualizowany (dodano coverage/, test-results/, etc.)
- [ ] GitHub Secrets skonfigurowane (jeśli używasz CI/CD)

---

## 🆘 Rozwiązywanie problemów

### Problem: "Cannot find module '@playwright/test'"
```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

### Problem: Testy timeout
```typescript
// Zwiększ timeout w teście
test.setTimeout(30000); // 30 sekund

// Lub w konfiguracji
// playwright.config.ts
timeout: 30 * 1000,
```

### Problem: "page.goto: net::ERR_CONNECTION_REFUSED"
```bash
# Upewnij się, że aplikacja działa
npm run build
npm run preview

# W innym terminalu uruchom testy
npm run test:e2e
```

### Problem: Flaky E2E tests
```typescript
// Użyj lepszych wait strategies
await page.waitForLoadState('networkidle');
await page.waitForSelector('.element', { state: 'visible' });

// Unikaj
await page.waitForTimeout(5000); // NIE UŻYWAJ
```

---

## 🎯 Zgodność z guidelines

Konfiguracja jest zgodna z:
- ✅ **Playwright guidelines**: Tylko Chromium, Page Object Model, API testing
- ✅ **Vitest guidelines**: vi.mock(), setup files, coverage, jsdom, watch mode
- ✅ **Test Plan**: Piramida testów, priorytety P1-P4, 80% coverage target
- ✅ **CI/CD**: GitHub Actions, parallel tests, artifacts, reports

---

## 📞 Support

W razie problemów:
1. Sprawdź `tests/README.md` - Common Issues
2. Zobacz logi: `npm run test -- --reporter=verbose`
3. Debug E2E: `npm run test:e2e:debug`
4. Dokumentacja: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/)

