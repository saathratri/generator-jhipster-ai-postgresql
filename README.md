# generator-jhipster-multiple-human-readable-foreign-key-fields

> JHipster blueprint, multiple-human-readable-foreign-key-fields blueprint for JHipster.

# Introduction

This is a [JHipster](https://www.jhipster.tech/) blueprint, that is meant to be used in a JHipster application.

Imagine an application where an Order entity references a Product. Instead of displaying only the productId in the Order interface, you can use this generator to display productName and productCategory, making it more user-friendly.

The generator-jhipster-multiple-human-readable-foreign-key-fields is an open-source JHipster blueprint designed to enhance the default behavior of JHipster entities by allowing multiple human-readable foreign key fields to be used when referencing related entities.

This generator addresses the need to display meaningful and descriptive fields from related entities, rather than just relying on technical IDs (primary keys), which are often not user-friendly.

Key Features:

- Human-Readable Foreign Keys:
  Allows you to specify which fields from related entities should be displayed as part of foreign key references (e.g., instead of showing just userId, you can display firstName and lastName).
- Multiple Fields Support:
  Enables combining multiple fields (e.g., name and description) into a single foreign key reference for better readability.
- Seamless Integration:
  Works seamlessly with JHipster’s entity generation system without requiring extensive manual configurations.

Benefits:

- Improves UX by displaying meaningful information for foreign key relationships.
- Reduces manual effort in customizing relationships for better readability.
- Provides a reusable solution for handling multiple descriptive fields across entities.

# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) blueprint, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://www.jhipster.tech/installation/)

# Installation

To install or update this blueprint:

```console
npm install -g generator-jhipster-multiple-human-readable-foreign-key-fields
```

# Usage

To use this blueprint, run the below command

```console
jhipster --blueprints multiple-human-readable-foreign-key-fields
```

You can look for updated multiple-human-readable-foreign-key-fields blueprint specific options by running

```console
jhipster app --blueprints multiple-human-readable-foreign-key-fields --help
```

And looking for `(blueprint option: multiple-human-readable-foreign-key-fields)` like

# Open Source Software - See the Code

☕️ Find the example code to run this blueprint/generator on GitHub:
[https://github.com/amarpatel-xx/jhipster-multiple-human-readable-foreign-key-fields-example](https://github.com/amarpatel-xx/jhipster-multiple-human-readable-foreign-key-fields-example)

☕️ Find the JHipster blueprint/generator code on GitHub:
[https://github.com/amarpatel-xx/generator-jhipster-multiple-human-readable-foreign-key-fields](https://github.com/amarpatel-xx/generator-jhipster-multiple-human-readable-foreign-key-fields)
