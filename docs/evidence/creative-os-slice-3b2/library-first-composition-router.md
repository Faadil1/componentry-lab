# Library-First Composition Router Fixtures Report

Adheres to a "native-first" resolution policy, querying the registry metadata using the Slice 3A router, and ensuring that no package execution takes place. It enforces strict framework compatibility checks: if a resource is incompatible, it is rejected (`NO_MATCH`); if compatibility evidence is missing, it reports `DISCOVERY_REQUIRED`.

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
* **Selected Route**: `NO_MATCH`
* **Resource**: `none`
* **Rationale**: OriginKit capability matches but it is incompatible with the Svelte framework.

---

## Fixture C: Complex Scroll Choreography
* **Capability**: complex scroll choreography
* **Framework**: React/NextJS
* **Selected Route**: `DISCOVERY_REQUIRED`
* **Resource**: `none`
* **Rationale**: Remocn matches the scroll choreography capability but its compatibility with React/NextJS is UNKNOWN. Discovery is required before suggesting.

---

## Fixture D: Web Component Animation (React/NextJS)
* **Capability**: web-component-animation
* **Framework**: React/NextJS
* **Selected Route**: `CONSIDER_EXPERIMENTAL_RESOURCE`
* **Resource**: `res_originkit` (OriginKit)
* **Rationale**: React framework component animations benefit from standard library bootstrap structures. Recommends OriginKit as its compatibility is VERIFIED.
