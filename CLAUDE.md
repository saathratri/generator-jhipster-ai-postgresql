# JHipster Multiple Human-Readable Foreign Key Fields Blueprint

## Overview

This is a **JHipster Side-by-Side (SBS) blueprint** that enhances entity relationships by allowing multiple human-readable fields to be displayed instead of just technical IDs when showing foreign key references in the UI.

**Version:** 2.0.12
**Author:** Amar Premsaran Patel
**License:** MIT
**JHipster Base Version:** 8.10.0

## What Problem Does This Solve?

In standard JHipster applications, when you have entity relationships, the UI typically displays only the ID or a single field from the related entity. This blueprint allows you to display multiple concatenated fields for better user experience.

### Example Use Case

Instead of showing just `productId: 123` in an Order interface, you can display:
- `Product: Laptop - Electronics`
- `Customer: John Doe (john.doe@example.com)`

## Installation

```bash
npm install -g generator-jhipster-multiple-human-readable-foreign-key-fields
```

## Usage

### Basic Usage

```bash
jhipster --blueprints multiple-human-readable-foreign-key-fields
```

### Entity Definition with Custom Annotations

In your JDL file, mark fields to display using `@customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK")`:

```jdl
entity Product {
  id Long
  @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK") @customAnnotation(" - ") name String required
  @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK") @customAnnotation("") category String required
  price BigDecimal
}

entity Customer {
  id Long
  @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK") @customAnnotation(" ") firstName String required
  @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK") @customAnnotation("") lastName String required
  email String
}

entity Order {
  id Long
  orderDate Instant
  totalAmount BigDecimal
}

relationship ManyToOne {
  Order{product} to Product
  Order{customer} to Customer
}
```

**Annotation Format:**
- First annotation: `"DISPLAY_IN_GUI_RELATIONSHIP_LINK"` - Marks the field for display
- Second annotation: Separator/delimiter (e.g., `" - "`, `" "`, `""` for no separator)

The fields will be concatenated in the order they appear with the specified separators.

## Project Structure

```
generator-jhipster-multiple-human-readable-foreign-key-fields/
├── cli/
│   └── cli.cjs                          # CLI entry point
├── generators/
│   ├── app/                             # Main application generator
│   │   └── generator.js
│   ├── client/                          # Client-side generator
│   │   └── generator.js
│   ├── cypress/                         # Cypress testing generator
│   │   └── generator.js
│   ├── docker/                          # Docker configuration generator
│   │   └── generator.js
│   ├── spring-boot/                     # Spring Boot generator
│   │   └── generator.js
│   ├── spring-cache/                    # Spring Cache configuration
│   │   └── generator.js
│   ├── sql-angular/                     # SQL with Angular frontend
│   │   ├── generator.js
│   │   ├── sql-angular-utils.js         # Angular UI utilities
│   │   └── templates/
│   │       └── _entityFolder_/
│   │           ├── _entityFile_.model.ts.ejs
│   │           ├── list/_entityFile_.component.html.ejs
│   │           ├── detail/_entityFile_-detail.component.html.ejs
│   │           └── update/_entityFile_-update.component.html.ejs
│   ├── sql-docker/                      # SQL Docker configurations
│   │   ├── generator.js
│   │   └── templates/
│   │       └── docker/
│   │           ├── postgresql.yml.ejs
│   │           └── postgresql-init-scripts/
│   │               └── init-vector-extension.sql.ejs
│   └── sql-spring-boot/                 # SQL with Spring Boot backend
│       ├── generator.js
│       ├── sql-spring-boot-utils.js     # Spring Boot utilities
│       └── templates/
│           └── _entityPackage_/
│               ├── service/dto/_dtoClass_.java.ejs
│               ├── service/mapper/_entityClass_Mapper.java.ejs
│               └── web/rest/_entityClass_ResourceIT.java.ejs
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── .yo-rc.json                          # Yeoman generator configuration
```

## Key Features

### 1. Human-Readable Foreign Keys

Automatically generates UI code to display multiple fields from related entities:

**Generated Angular TypeScript (Model):**
```typescript
export interface IOrder {
  id: number;
  orderDate?: dayjs.Dayjs | null;
  totalAmount?: number | null;
  product?: Pick<IProduct, 'id' | 'name' | 'category'> | null;
  customer?: Pick<ICustomer, 'id' | 'firstName' | 'lastName'> | null;
}
```

**Generated Angular HTML (List View):**
```html
<td>
  <div *ngIf="order.product">
    <a [routerLink]="['/product', order.product.id, 'view']">
      {{ order.product.name }} - {{ order.product.category }}
    </a>
  </div>
</td>
```

### 2. Spring Boot DTO Integration

Generates DTOs with proper field mappings:

```java
@Mapping(source = "product.id", target = "productId")
@Mapping(source = "product.name", target = "productName")
@Mapping(source = "product.category", target = "productCategory")
OrderDTO toDto(Order s);
```

### 3. Integration Test Generation

Automatically updates integration tests to use the correct field references:

```java
restOrderMockMvc
    .perform(get(ENTITY_API_URL_ID, order.getId()))
    .andExpect(jsonPath("$.productName").value(product.getName()))
    .andExpect(jsonPath("$.productCategory").value(product.getCategory()));
```

### 4. PostgreSQL Docker Configuration

For microservices, automatically manages PostgreSQL Docker ports:

- Gateway uses port 5432
- Each microservice gets auto-incremented port (5434, 5436, 5438...)
- Port allocation tracked in `last-used-port.json` in parent directory
- Supports PostgreSQL vector extension initialization

## Generator Architecture

### Blueprint Pattern

This blueprint uses the **Side-by-Side (SBS) pattern**:
- Sets `sbsBlueprint: true` in constructor
- Extends JHipster generators without replacing them
- Adds customizations on top of standard generation

### Generator Lifecycle

Each generator follows JHipster's standardized lifecycle phases:

1. **INITIALIZING** - Initial setup
2. **PROMPTING** - User prompts
3. **CONFIGURING** - Configuration processing
4. **COMPOSING** - Compose with other generators
5. **LOADING** - Load configuration
6. **PREPARING** - Prepare data for generation
7. **CONFIGURING_EACH_ENTITY** - Process entity configuration
8. **LOADING_ENTITIES** - Load entity definitions
9. **PREPARING_EACH_ENTITY** - Prepare entity data
10. **PREPARING_EACH_ENTITY_FIELD** - Process entity fields
11. **PREPARING_EACH_ENTITY_RELATIONSHIP** - Process relationships
12. **POST_PREPARING_EACH_ENTITY** - Post-processing
13. **DEFAULT** - Default phase
14. **WRITING** - Write files
15. **WRITING_ENTITIES** - Write entity files
16. **POST_WRITING** - Post-write processing
17. **POST_WRITING_ENTITIES** - Post-write entity processing
18. **LOADING_TRANSLATIONS** - Load i18n translations
19. **INSTALL** - Install dependencies
20. **POST_INSTALL** - Post-install tasks
21. **END** - Finalize

## Key Utility Functions

### sql-angular-utils.js

**`getClientOptionToDisplayForUpdate(entity, relationship)`**
- Generates Angular template code for update forms
- Returns concatenated field display logic
- Example output: `{{ product.name }} - {{ product.category }}`

**`getClientOptionToDisplayForModel(entity, relationship)`**
- Generates TypeScript Pick type for model interfaces
- Returns fields to include in the relationship
- Example: `Pick<IProduct, 'id' | 'name' | 'category'>`

**`getClientOptionToDisplayForList(entity, relationship)`**
- Generates list view display logic
- Creates router links with concatenated fields

**`getClientOptionToDisplayForManyToManyList(entity, relationship)`**
- Handles many-to-many relationship displays
- Generates ngFor loops with trackBy functions

### sql-spring-boot-utils.js

**`getMappingsToDisplayInMapper(entity, relationships)`**
- Generates @Mapping annotations for MapStruct DTOs
- Maps related entity fields to DTO fields
- Example: `@Mapping(source = "product.name", target = "productName")`

**`getApplicationPortData()`**
- Retrieves PostgreSQL port configuration from `last-used-port.json`

**`incrementAndSetLastUsedPort(applicationName)`**
- Allocates unique PostgreSQL port for microservice
- Auto-increments from 5434
- Updates port tracking file

### saathratri-constants.js

**`USE_OPTION_TO_DISPLAY_IN_GUI`**
- Feature flag constant set to `true`
- Enables custom display field functionality

## Technology Stack

**Frontend:**
- Angular (latest supported by JHipster 8.10.0)
- TypeScript
- Angular Router
- RxJS

**Backend:**
- Spring Boot 3.x
- Spring Data JPA
- MapStruct (DTO mapping)
- PostgreSQL

**Build Tools:**
- Node.js (^18.13.0 || >= 20.6.1)
- Maven/Gradle
- Yeoman

**Development:**
- TypeScript/JavaScript (ES Modules)
- EJS templates
- Vitest (testing)
- ESLint + Prettier (code quality)

## Development

### Prerequisites

- Node.js: ^18.13.0 || >= 20.6.1
- JHipster: 8.10.0
- Java: 17 or 21

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd generator-jhipster-multiple-human-readable-foreign-key-fields

# Install dependencies
npm install

# Link for local development
npm link
```

### Testing

```bash
# Run all tests
npm test

# Run vitest in watch mode
npm run vitest

# Update snapshots
npm run update-snapshot

# Lint code
npm run lint

# Format code
npm run prettier:format
```

### Code Quality Tools

- **EditorConfig**: Consistent coding style across IDEs
- **Prettier**: Code formatting (2-space indent, LF line endings, 120 char line width)
- **ESLint**: JavaScript/TypeScript linting
- **EJS-Lint**: Template linting
- **Husky**: Git hooks for pre-commit checks
- **Lint-staged**: Run linters on staged files only

## Configuration Files

### .yo-rc.json

Defines generator configuration:

```json
{
  "generator-jhipster-multiple-human-readable-foreign-key-fields": {
    "baseName": "generator-jhipster-multiple-human-readable-foreign-key-fields",
    "sbsBlueprint": true,
    "skipPriorities": [
      "bootstrapping",
      "bootstrapping-each-entity"
    ],
    "generators": ["app", "client", "cypress", "server", "spring-boot", "java", "docker"]
  }
}
```

### vitest.config.ts

Test configuration:

```typescript
export default {
  test: {
    pool: 'forks',
    poolOptions: {
      forks: { execArgv: ['--expose-gc'] }
    },
    hookTimeout: 20000,
  }
}
```

## Workflow Example

### Step 1: Define Entities

Create a JDL file (`entities.jdl`):

```jdl
entity Product {
  @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK") @customAnnotation(" - ") name String required
  @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK") @customAnnotation("") category String required
  price BigDecimal required
}

entity Order {
  orderDate Instant required
  totalAmount BigDecimal required
}

relationship ManyToOne {
  Order{product required} to Product
}
```

### Step 2: Generate Application

```bash
jhipster --blueprints multiple-human-readable-foreign-key-fields
jhipster jdl entities.jdl
```

### Step 3: Review Generated Code

The blueprint will generate:

1. **Angular Components** with concatenated field displays
2. **Spring Boot DTOs** with additional fields
3. **MapStruct Mappers** with proper mappings
4. **Integration Tests** with correct assertions
5. **Docker Configuration** with proper ports

### Step 4: Run and Test

```bash
# Start PostgreSQL
docker-compose -f src/main/docker/postgresql.yml up -d

# Run backend
./mvnw

# Run frontend (in another terminal)
npm start
```

## Port Management for Microservices

When generating microservices, the blueprint manages PostgreSQL ports automatically:

**Port Allocation:**
- **Gateway**: Port 5432 (default PostgreSQL port)
- **Microservice 1**: Port 5434
- **Microservice 2**: Port 5436
- **Microservice 3**: Port 5438
- And so on...

**Tracking File:** `../last-used-port.json`

```json
{
  "lastUsedPort": 5436,
  "gateway": 5432,
  "microservice-orders": 5434,
  "microservice-products": 5436
}
```

The port is automatically set in `src/main/resources/config/application-dev.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5434/orders
```

## Customization

### Adding Custom Separators

You can customize field separators in JDL:

```jdl
entity Person {
  @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK") @customAnnotation("") lastName String
  @customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK") @customAnnotation(", ") firstName String
}
```

Result: `Smith, John`

### Multiple Relationships

The blueprint handles multiple relationships per entity:

```jdl
entity Invoice {
  invoiceDate Instant
  amount BigDecimal
}

relationship ManyToOne {
  Invoice{customer required} to Customer
  Invoice{product required} to Product
  Invoice{seller} to Employee
}
```

Each relationship will have its own concatenated field display.

## Troubleshooting

### Issue: Fields Not Displaying

**Problem:** Related entity fields not showing in UI

**Solution:**
- Verify `@customAnnotation("DISPLAY_IN_GUI_RELATIONSHIP_LINK")` is present on fields
- Check that annotations are in correct order (marker annotation, then separator)
- Regenerate entities: `jhipster entity <EntityName> --regenerate`

### Issue: Port Conflicts

**Problem:** PostgreSQL port already in use

**Solution:**
- Check `last-used-port.json` in parent directory
- Manually edit port in `src/main/docker/postgresql.yml`
- Update `application-dev.yml` with matching port

### Issue: Compilation Errors

**Problem:** TypeScript or Java compilation errors after generation

**Solution:**
- Clean and rebuild: `npm run clean && npm install`
- For Java: `./mvnw clean compile`
- Check for conflicting field names in DTOs

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `npm test` and `npm run lint`
6. Submit a pull request

## Support

For issues, questions, or contributions, please visit:
- **Repository:** [GitHub Repository URL]
- **Author:** Amar Premsaran Patel
- **JHipster Community:** https://www.jhipster.tech/help/

## License

MIT License - See LICENSE file for details

## Version History

**2.0.12** (Current)
- Support for JHipster 8.10.0
- PostgreSQL vector extension support
- Improved port management for microservices
- Enhanced integration tests

## Additional Resources

- [JHipster Documentation](https://www.jhipster.tech/)
- [JHipster Blueprint Guide](https://www.jhipster.tech/modules/creating-a-blueprint/)
- [Yeoman Generator Documentation](https://yeoman.io/authoring/)
- [Spring Data JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [Angular Documentation](https://angular.io/docs)
