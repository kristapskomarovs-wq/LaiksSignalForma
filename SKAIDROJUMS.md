# 📚 Pilns skaidrojums: Angular Frontend + Spring Boot Backend

## 🗺️ KOPAINA — Kas šis projekts dara?

Šis ir **pilna steka (full-stack) web projekts** ar diviem repo:

| Repo | Tehnoloģija | Loma |
|------|-------------|------|
| `PP12Serveris` | Java + Spring Boot | **Backends** (serveris) |
| `LaiksSignalForma` | Angular (TypeScript) | **Frontends** (pārlūkprogramma) |

**Projekta funkcionalitāte:** Lietotājs var reģistrēties vai ielogoties, pēc tam tiek novirzīts uz automašīnu veikala lapu, kur redzamas visas mašīnas no datubāzes.

---

## 🏗️ DAĻA 1: BACKENDS — `PP12Serveris` (Spring Boot / Java)

### 1.1 Kas ir Spring Boot?

Spring Boot ir Java ietvars (framework), kas ļauj ātri uzbūvēt REST API serverus. Tas darbojas kā "vidutājs" starp frontendu un datubāzi.

```
Pārlūks (Angular) ──→ HTTP pieprasījums ──→ Spring Boot serveris ──→ PostgreSQL datubāze
```

---

### 1.2 `pom.xml` — Projekta "recepte"

```xml
<dependencies>
    <dependency>spring-boot-starter-data-jpa</dependency>  <!-- Datubāzes darbs -->
    <dependency>spring-boot-starter-webmvc</dependency>    <!-- REST API -->
    <dependency>postgresql</dependency>                     <!-- PostgreSQL draiveris -->
    <dependency>lombok</dependency>                         <!-- Automātisks kods (getteri, seteri) -->
</dependencies>
```

**Ko katrs dara?**
- **`spring-boot-starter-webmvc`** — ļauj izveidot HTTP endpoint'us (`@GetMapping`, `@PostMapping`)
- **`spring-boot-starter-data-jpa`** — ļauj ar Java klases palīdzību rakstīt/lasīt datubāzē (JPA = Java Persistence API)
- **`postgresql`** — Java programma "zina", kā runāt ar PostgreSQL datubāzi
- **`lombok`** — automātiski ģenerē `getters`, `setters`, konstruktorus — tu to neraksti manuāli

---

### 1.3 `application.properties` — Konfigurācija

```ini
spring.application.name=PP12Serveris

server.port=8088                                          # Serveris klausās uz portu 8088
spring.datasource.url=jdbc:postgresql://localhost:5432/pp12database  # Datubāzes adrese
spring.datasource.username=kristaps                       # Datubāzes lietotājs
spring.datasource.password=bistamais92                    # Datubāzes parole
spring.jpa.hibernate.ddl-auto=update                     # Automātiski izveido/atjaunina tabulas
```

> ⚠️ **Svarīgi:** `ddl-auto=update` nozīmē — ja tu pievieno jaunu lauku modelim, Hibernate automātiski pievienos kolonnu tabulai datubāzē.

---

### 1.4 `Pp12ServerisApplication.java` — Ieejas punkts

```java
@SpringBootApplication         // Šī anotācija "palaiž" visu Spring Boot maģiju
public class Pp12ServerisApplication {
    public static void main(String[] args) {
        SpringApplication.run(Pp12ServerisApplication.class, args);  // Startē serveri
    }
}
```

`@SpringBootApplication` = trīs anotācijas vienā:
- `@Configuration` — šī klase ir konfigurācija
- `@EnableAutoConfiguration` — automātiski konfigurē visu
- `@ComponentScan` — atrod visas klases ar `@Component`, `@Service`, `@Repository`, `@RestController`

---

### 1.5 Modeļi (Models) — Datubāzes tabulas kā Java klases

#### `UserModel.java`

```java
@Entity           // Šī klase = tabula datubāzē
@Data             // Lombok: automātiski izveido getters/setters/toString/equals
@Table(name = "users")  // Tabulas nosaukums datubāzē
public class UserModel {

    @Id                                           // Šis ir primārā atslēga (PRIMARY KEY)
    @GeneratedValue(strategy = GenerationType.AUTO)  // ID automātiski pieaug (1, 2, 3...)
    private Long id;

    private String email;     // kolonna "email" tabulā
    private String password;  // kolonna "password" tabulā
}
```

**Rezultāts datubāzē — tabula `users`:**

| id | email | password |
|----|-------|----------|
| 1  | user@test.com | parole123 |
| 2  | another@test.com | abc |

#### `ShopModel.java`

```java
@Entity
@Data
@Table(name = "shop")   // Tabula "shop" datubāzē
public class ShopModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // IDENTITY = datubāze pati generē ID
    private Long id;
    private String model;    // Mašīnas modelis
    private Integer year;    // Gads
    private String color;    // Krāsa
    private Integer milage;  // Nobraukums
    private Double price;    // Cena
}
```

---

### 1.6 Repository — "Maģiskais" datubāzes slānis

```java
@Repository
public interface UserRepository extends JpaRepository<UserModel, Long> {
    //                                     ↑ strādā ar UserModel, ID ir Long tips

    Boolean existsByEmail(String email);  // Spring automātiski raksta SQL: SELECT EXISTS(SELECT 1 FROM users WHERE email=?)
    UserModel findByEmail(String email);  // Spring automātiski: SELECT * FROM users WHERE email=?
}
```

> 🔮 **Maģija:** Tu tikai nosaki metodes nosaukumu — Spring Boot pats uzraksta SQL vaicājumu! `existsByEmail` → `SELECT EXISTS(...WHERE email=?)`

```java
@Repository
public interface ShopRepository extends JpaRepository<ShopModel, Long> {
    // Tukšs! JpaRepository jau satur: findAll(), save(), deleteById(), findById()...
}
```

---

### 1.7 Service — Biznesa loģika

```java
@Service               // Spring zina, ka šī klase satur loģiku
@RequiredArgsConstructor  // Lombok: izveido konstruktoru ar visiem final laukiem
public class UserService {

    private final UserRepository userRepository;  // Spring automātiski "ieinjicē" (Dependency Injection)
    private final ShopRepository shopRepository;

    public Long createUser(UserModel user) throws ... {
        user.setEmail(user.getEmail().toLowerCase());  // Email → mazajiem burtiem
        UserModel savedUser = userRepository.save(user);  // Saglabā datubāzē
        return savedUser.getId();  // Atgriež jaunā lietotāja ID
    }

    public Boolean checkEmail(String email) {
        return userRepository.existsByEmail(email);  // true = lietotājs eksistē
    }

    public Long signIn(UserModel user) {
        UserModel foundUser = userRepository.findByEmail(user.getEmail().toLowerCase());
        if (!foundUser.getPassword().equals(user.getPassword())) {
            return null;  // Parole nepareiza
        }
        return foundUser.getId();  // Atgriež lietotāja ID = veiksmīga ielogošanās
    }

    public List<ShopModel> getAllAutos() {
        return shopRepository.findAll();  // Visi ieraksti no "shop" tabulas
    }
}
```

---

### 1.8 Controller — HTTP Endpoint'i (API)

```java
@CrossOrigin(origins = "http://localhost:4200", ...)
// ↑ Atļauj pieprasījumus no Angular dev servera (CORS politika)

@RestController        // Šī klase atbild uz HTTP pieprasījumiem ar JSON
@RequiredArgsConstructor
public class Controller {
    private final UserService userService;

    // POST http://localhost:8088/api/v1/saveuser
    @PostMapping("/api/v1/saveuser")
    public ResponseEntity<Long> saveUser(@RequestBody UserModel user) throws ... {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(userService.createUser(user));
    }

    // GET http://localhost:8088/api/v1/checkemail/user@test.com
    @GetMapping("/api/v1/checkemail/{email}")
    public ResponseEntity<Boolean> checkEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.checkEmail(email));
    }

    // POST http://localhost:8088/api/v1/signin
    @PostMapping("/api/v1/signin")
    public ResponseEntity<Long> signIn(@RequestBody UserModel user) {
        Long userId = userService.signIn(user);
        if (userId != null) {
            return ResponseEntity.ok(userId);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(-1L);
    }

    // GET http://localhost:8088/api/v1/getallautos
    @GetMapping("/api/v1/getallautos")
    public ResponseEntity<List<ShopModel>> findAllAutos() {
        return ResponseEntity.ok(userService.getAllAutos());
    }
}
```

**Backend API kopsavilkums:**

| HTTP Metode | URL | Ko dara | Atgriež |
|-------------|-----|---------|---------|
| `POST` | `/api/v1/saveuser` | Reģistrē lietotāju | Jauna lietotāja `id` |
| `GET` | `/api/v1/checkemail/{email}` | Vai email eksistē? | `true` / `false` |
| `POST` | `/api/v1/signin` | Ielogošanās | Lietotāja `id` vai `-1` |
| `GET` | `/api/v1/getallautos` | Visu mašīnu saraksts | JSON masīvs |

---

## 🌐 DAĻA 2: FRONTENDS — `LaiksSignalForma` (Angular)

### 2.1 Kas ir Angular?

Angular ir TypeScript ietvars, kas darbojas **pārlūkprogrammā**. Tas veido **Single Page Application (SPA)** — lapa nemainās, tikai nomainās saturs.

---

### 2.2 `src/index.html` — Vienīgā HTML lapa

```html
<body>
  <app-root></app-root>  <!-- Šeit Angular "ievieto" visu lietotni -->
</body>
```

> Tā ir **vienīgā** HTML lapa. Angular pats dinamiski maina saturu — tāpēc tas saucas SPA.

---

### 2.3 `src/main.ts` — Angular palaišana

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)   // "Palaidiet App komponentu ar šo konfigurāciju"
  .catch((err) => console.error(err));
```

---

### 2.4 `app.config.ts` — Globālā konfigurācija

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),  // Globāla kļūdu apstrāde
    provideRouter(routes)                  // Aktivizē maršrutētāju (router)
  ]
};
```

> ⚠️ **Pamanīsi:** Šeit trūkst `provideHttpClient()`! Tas nozīmē, ka HTTP pieprasījumi var nestrādāt pareizi. Pareizi vajadzētu pievienot `provideHttpClient()`.

---

### 2.5 `app.routes.ts` — Navigācija (Maršruti)

```typescript
export const routes: Routes = [
    // URL "" (sakne) → parāda MainPage komponentu
    { path: '', component: MainPage, title: 'User registration' },

    // URL "/shop" → lazy-load Shop komponentu
    { path: 'shop', loadComponent: () => import('./shop/shop').then(m => m.Shop), title: 'Shop' },

    // Jebkurš nezināms URL → novirza uz sākumu
    { path: '**', redirectTo: '' }
];
```

**`loadComponent` = Lazy Loading** — Shop komponenta kods netiek ielādēts uzreiz, tikai tad, kad lietotājs aiziet uz `/shop`. Tas paātrina sākotnējo ielādi.

---

### 2.6 `app.ts` + `app.html` — Saknes komponents

```typescript
@Component({
  selector: 'app-root',        // Atbilst <app-root> index.html
  imports: [RouterOutlet],     // Ļauj izmantot <router-outlet />
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('LaiksSignalForma');  // Signal — reaktīvs mainīgais
}
```

```html
<router-outlet />
<!-- Šeit Angular "ieliek" aktīvo lapu (MainPage vai Shop) atkarībā no URL -->
```

---

### 2.7 Signals — Jaunā Angular reaktivitāte

**Signals** ir Angular 17+ jaunums. Tas ir **reaktīvs mainīgais** — kad tas mainās, UI automātiski atjaunojas.

```typescript
// Parasts mainīgais:
let skaitlis = 5;
skaitlis = 10;  // UI nezina par šo izmaiņu!

// Signal:
const skaitlis = signal(5);
skaitlis.set(10);  // UI AUTOMĀTISKI atjaunojas!
skaitlis();        // Lai nolasītu vērtību, jāizsauc kā funkcija: skaitlis()
```

---

### 2.8 Modeļi — Datu struktūras

#### `user-login.model.ts`

```typescript
export interface UserLoginModel {
    id?: number;           // ? = neobligāts lauks
    email: string;
    password: string;
    confirmPassword: string;  // Tikai frontendā — backendā nav šī lauka
}

export interface UserDataShopModel {
    id: number;
    email: string;
}

// Izveido signal ar tukšiem datiem (sākuma stāvoklis)
export function createUserLoginForm(): WritableSignal<UserLoginModel> {
    return signal<UserLoginModel>({
        email: '',
        password: '',
        confirmPassword: ''
    });
}

// Validācijas noteikumi
export function validateUserLoginForm(s: SchemaPathTree<UserLoginModel>) {
    required(s.email, { message: 'Email is required' });
    required(s.password, { message: 'Password is required' });
    required(s.confirmPassword, { message: 'Confirm Password is required' });

    // Pielāgota validācija: pārbauda vai paroles sakrīt
    validate(s.confirmPassword, ({ value, valueOf }) => {
        const pass = valueOf(s.password);
        const confirmPass = value();
        if (pass !== confirmPass) {
            return { kind: 'passwordMismatch', message: 'Passwords do not match' };
        }
        return null;  // null = nav kļūdas
    });
}
```

---

### 2.9 `MainPage` — Galvenā lapa

```typescript
export class MainPage {
    // Signal, kas satur formas datus
    mainSignal = signal({
        userLogin: createUserLoginForm()(),  // Izveido tukšu UserLoginModel
    });

    // form() — "ietina" signalu un pievieno validāciju
    mainForm = form(this.mainSignal, (v) => {
        validateUserLoginForm(v.userLogin);
    });
}
```

```html
<!-- Nodod mainForm.userLogin kā input uz UserLogin komponentu -->
<app-user-login [fromMain="mainForm.userLogin"] />
```

**Loģika:** `MainPage` ir "vecākkomponents" (*parent*). Tas izveido formu un nodod to bērnam `UserLogin`.

---

### 2.10 `UserLogin` — Reģistrācijas/Pieteikšanās forma

```typescript
export class UserLogin {
    userRegService = inject(UserRegService);
    userDataService = inject(UserDataService);
    router = inject(Router);

    fromMain = input.required<FieldTree<UserLoginModel>>();

    isRegistered = signal<boolean>(false);  // Vai lietotājs ir reģistrēts?
    show = signal<boolean>(false);          // Rādīt paroles lauku?

    onEmailInput() {
        this.userRegService.checkEmailExists(this.fromMain().email().value()).subscribe({
            next: (r) => {
                this.isRegistered.set(r.body!);
                this.show.set(true);
            }
        });
    }

    saveUser() {
        this.userRegService.saveUser(this.fromMain()().value()).subscribe({
            next: (r) => {
                if (r.status === 201) {
                    this.userDataService.userData.set({
                        id: r.body!,
                        email: this.fromMain()().value().email,
                    });
                    this.router.navigateByUrl('/shop');
                }
            }
        });
    }

    onSignIn() {
        this.userRegService.signIn(this.fromMain()().value()).subscribe({
            next: (r) => {
                if (r.status === 200) {
                    this.userDataService.userData.set({
                        id: r.body!,
                        email: this.fromMain()().value().email,
                    });
                    this.router.navigateByUrl('/shop');
                }
            },
            error: (err) => {
                this.fromMain().email().value.set('');
                this.fromMain().password().value.set('');
                alert('An error occurred while signing in...');
            }
        });
    }
}
```

#### HTML veidne

```html
<input [formField]="fromMain().email" (keyup)="onEmailInput()" />

@if(show() === false) {
    <button (click)="onEmailInput()">Submit</button>
}

@if(show() === true) {
    <input type="password" [formField]="fromMain().password" />

    @if (!isRegistered()) {
        <input type="password" [formField]="fromMain().confirmPassword" />
    }

    @if(isRegistered() === true) {
        <button (click)="onSignIn()">Sign In</button>
    }
    @if(isRegistered() === false) {
        <button (click)="saveUser()">Register</button>
    }
}
```

---

### 2.11 `ErrorValidation` — Kļūdu rādīšana

```typescript
export class ErrorValidation {
    fieldState = input.required<FieldState<any, string>>();
}
```

```html
@if(fieldState().invalid() && fieldState().touched()) {
    @for(err of fieldState().errors(); track err) {
        <p style="color: red">{{err.message}}</p>
    }
}
```

> **`touched()`** — nozīmē, ka lietotājs ir klikšķinājis uz lauka un pārgājis tālāk. Kļūdas nerāda uzreiz, kamēr lauks nav "pieskartas".

---

### 2.12 Servisi — HTTP komunikācija ar backendu

#### `user-reg-service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class UserRegService {
    http = inject(HttpClient);
    path: string = 'http://localhost:8088/api/v1';

    public saveUser(userLogin: UserLoginModel): Observable<HttpResponse<number>> {
        return this.http.post<number>(`${this.path}/saveuser`, userLogin, {
            observe: 'response',
        });
    }

    public checkEmailExists(email: string): Observable<HttpResponse<boolean>> {
        return this.http.get<boolean>(
            `http://localhost:8088/api/v1/checkemail/${encodeURIComponent(email)}`,
            { observe: 'response' }
        );
    }

    public signIn(userLogin: UserLoginModel): Observable<HttpResponse<number>> {
        return this.http.post<number>(`${this.path}/signin`, userLogin, {
            observe: 'response',
        });
    }
}
```

#### `user-data.ts` — Globālais stāvoklis

```typescript
@Injectable({ providedIn: 'root' })
export class UserDataService {
    // Globāls signal — saglabā ielogotā lietotāja datus
    // Pieejams jebkurā komponentā, kas injicē šo servisu
    userData = signal<UserDataShopModel>({ id: 0, email: '' });
}
```

#### `autos-service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class AutosService {
    http = inject(HttpClient);

    public getAllAutos() {
        return this.http.get<AutoModel[]>('http://localhost:8088/api/v1/getallautos', {
            observe: 'response',
        });
    }
}
```

---

### 2.13 `Shop` — Veikala lapa

```typescript
export class Shop implements OnInit {
    userDataService = inject(UserDataService);
    userData: UserDataShopModel = this.userDataService.userData();

    autosService = inject(AutosService);
    allAutosSignal = signal<AllAutosModel>({ allAutos: [] });
    autosForm = form(this.allAutosSignal);

    ngOnInit(): void {
        this.startShop();
    }

    startShop() {
        this.autosService.getAllAutos().subscribe({
            next: (r) => {
                if (r.status === 200) {
                    this.allAutosSignal.set({ allAutos: (r.body as AutoModel[]) ?? [] });
                }
            },
            error: (err) => {
                alert('An error occurred while fetching autos...');
            }
        });
    }
}
```

```html
<h3>Sveiks, {{ userData.email }} !</h3>

@for(auto of autosForm.allAutos; track $index; let i=$index) {
    <p>Modelis: {{auto.model().value()}} </p>
    <p>Gads: {{auto.year().value()}} </p>
    <p>Krāsa: {{auto.color().value()}} </p>
    <p>Nobraukums: {{auto.milage().value()}} </p>
    <p>Cena: {{auto.price().value()}} </p>
}
```

---

## 🔄 DAĻA 3: FRONTEND ↔ BACKEND PLŪSMA

```
LIETOTĀJS IEVADA EMAIL UN KLIKŠĶINA "Submit"
         ↓
UserLogin.onEmailInput()
         ↓
UserRegService.checkEmailExists("user@test.com")
         ↓
HTTP GET → http://localhost:8088/api/v1/checkemail/user@test.com
         ↓
Controller.checkEmail("user@test.com")
         ↓
UserService.checkEmail() → userRepository.existsByEmail()
         ↓
PostgreSQL: SELECT EXISTS(SELECT 1 FROM users WHERE email='user@test.com')
         ↓
Atbild: true vai false
         ↓
Atpakaļ frontendā: isRegistered.set(true/false), show.set(true)
         ↓
Parāda "Sign In" vai "Register" pogu
```

---

## 📋 DAĻA 4: SECĪBA — KĀ RAKSTĪT NO NULLES

### 🔧 Solis 1: Backend — Datubāze un modeļi
1. Izveido PostgreSQL datubāzi
2. Konfigurē `application.properties`
3. Raksta `UserModel.java` un `ShopModel.java`

### 🔧 Solis 2: Backend — Repository
4. Raksta `UserRepository.java` ar vajadzīgajām metodēm
5. Raksta `ShopRepository.java`

### 🔧 Solis 3: Backend — Service
6. Raksta `UserService.java` — biznesa loģika

### 🔧 Solis 4: Backend — Controller
7. Raksta `Controller.java` ar endpoint'iem
8. Testē ar Postman vai pārlūku

### 🌐 Solis 5: Frontend — Angular projekts
9. `ng new LaiksSignalForma`
10. Izveido modeļus/interfeisus (`user-login.model.ts`, `shop_model.ts`)

### 🌐 Solis 6: Frontend — Servisi
11. Raksta `UserRegService`, `AutosService`, `UserDataService`

### 🌐 Solis 7: Frontend — Komponenti
12. Izveido `ErrorValidation` komponentu
13. Izveido `UserLogin` komponentu
14. Izveido `MainPage` komponentu
15. Izveido `Shop` komponentu

### 🌐 Solis 8: Frontend — Maršruti
16. Konfigurē `app.routes.ts`

---

## 🗂️ Pilna arhitektūras shēma

```
LaiksSignalForma (Angular Frontend)
│
├── src/index.html              ← Vienīgā HTML lapa, satur <app-root>
├── src/main.ts                 ← Palaiž Angular
└── src/app/
    ├── app.ts / app.html       ← Saknes komponents ar <router-outlet>
    ├── app.config.ts           ← Konfigurācija (router, providers)
    ├── app.routes.ts           ← URL → Komponents kartēšana
    │
    ├── main-page/              ← "/" lapa: izveido formu, nodod UserLogin
    ├── user-login/             ← Login/Register forma ar validāciju
    ├── shop/                   ← "/shop" lapa: rāda mašīnas
    ├── error-validation/       ← Atkārtojams kļūdu rādīšanas komponents
    │
    └── services/
        ├── user-reg-service.ts ← HTTP: saveUser, checkEmail, signIn
        ├── user-data.ts        ← Globālais stāvoklis (ielogotais lietotājs)
        └── autos-service.ts    ← HTTP: getAllAutos

PP12Serveris (Spring Boot Backend)
│
├── pom.xml                     ← Atkarības (JPA, Web, PostgreSQL, Lombok)
├── application.properties      ← DB savienojums, ports 8088
└── src/main/java/org/kristaps/PP12Serveris/
    ├── Pp12ServerisApplication.java  ← Ieejas punkts
    ├── models/
    │   ├── UserModel.java      ← "users" tabula DB
    │   └── ShopModel.java      ← "shop" tabula DB
    ├── repository/
    │   ├── UserRepository.java ← DB vaicājumi lietotājiem
    │   └── ShopRepository.java ← DB vaicājumi mašīnām
    ├── services/
    │   └── UserService.java    ← Biznesa loģika
    └── controllers/
        └── Controller.java     ← REST API endpoint'i

PostgreSQL datubāze (porta 5432)
├── tabula: users (id, email, password)
└── tabula: shop  (id, model, year, color, milage, price)
```

---

## 💡 Galvenie jēdzieni — Kopsavilkums

| Jēdziens | Ko nozīmē |
|----------|-----------|
| `@Entity` | Java klase = datubāzes tabula |
| `@RestController` | Klase, kas apstrādā HTTP pieprasījumus |
| `@Service` | Klase ar biznesa loģiku |
| `@Repository` | Klase darbam ar datubāzi |
| `@CrossOrigin` | Atļauj Angular sazināties ar serveri |
| `signal()` | Reaktīvs mainīgais Angular — UI automātiski atjaunojas |
| `inject()` | Angular Dependency Injection — automātiski saņem servisu |
| `input.required()` | Komponents saņem datus no vecāka |
| `@for` / `@if` | Angular 17+ jaunais veidnes sintakss |
| `Observable` | Asinhrona datu plūsma (HTTP atbilde nāk "vēlāk") |
| `subscribe()` | "Klausās" uz Observable — apstrādā atbildi, kad tā pienāk |
| Lazy loading | Kods tiek ielādēts tikai, kad vajadzīgs |
