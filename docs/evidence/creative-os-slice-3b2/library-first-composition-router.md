# Library-First Composition Router Fixtures Report

Adheres to a "native-first" resolution policy, querying the registry metadata using the Slice 3A router, and ensuring that no package execution takes place.

---

## Fixture A: Simple Fade Transition
* **Capability**: simple fade transition
* **Framework**: React/NextJS
* **Selected Route**: `USE_NATIVE`
* **Resource**: `none`
* **Rationale**: Simple fade animations are fully satisfied by native CSS animations; importing libraries adds unnecessary bundle weight.

---

## Fixture B: Web Component Animation (Svelte)
* **Capability**: web-component-animation
* **Framework**: Svelte
* **Selected Route**: `CONSIDER_EXPERIMENTAL_RESOURCE`
* **Resource**: `res_originkit` (OriginKit)
* **Rationale**: Svelte framework component animations benefit from standard library bootstrap structures. Recommends OriginKit as it exists in governed registry metadata.

---

## Fixture C: Complex Scroll Choreography
* **Capability**: complex scroll choreography
* **Framework**: React/NextJS
* **Selected Route**: `CONSIDER_EXPERIMENTAL_RESOURCE`
* **Resource**: `res_remocn` (Remocn)
* **Rationale**: Complex scroll choreography is highly error-prone natively. Recommends Remocn (test candidate in registry).
