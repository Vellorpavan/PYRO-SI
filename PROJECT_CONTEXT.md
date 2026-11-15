# PROJECT CONTEXT: GODEYE // PYRO-SI

## 1. Challenge & Mission Context

- **Event**: 2026 NASA Space Apps Challenge
- **Challenge Title**: Flame in Freefall
- **Team**: whoami
- **Primary Objective**: Translate NASA Physical Sciences Informatics (PSI) combustion datasets into actionable fire safety intelligence for Artemis lunar base camps, orbital platforms (ISS, Gateway), spacesuits (xEMU), and future planetary missions.

## 2. Core Physics Problem: Combustion Across Gravity Regimes

Terrestrial fire safety protocols assume gravity-driven buoyancy ($1.0g$):
- Hot combustion gases naturally rise ($1\text{--}2\text{ m/s}$), creating fresh oxygen draw from below and generating familiar flickering teardrop flames.
- Materials that are self-extinguishing in normal Earth air ($21\%\text{ O}_2$, $14.7\text{ psi}$) often fail completely in extraterrestrial atmospheres.

In Extraterrestrial Environments:
1. **Microgravity ($0g$)**: In the absence of buoyancy, hot exhaust stays in place. Flames form spherical blue shells driven entirely by slow molecular diffusion. A critical danger discovered in the NASA FLEX/CFI experiments is "cool flames" ($500\text{--}800\text{ K}$) that continue burning invisibly and can reignite explosively when ventilation changes.
2. **Lunar Partial Gravity ($0.16g$)**: NASA's ACME CFI-G investigation proved that in weak partial gravity, buoyancy is too weak to quench flames but strong enough to supply fresh oxidizer. Combined with NASA's "Exploration Atmosphere" ($34\%\text{ O}_2$, $8.2\text{ psi}$), solid materials burn significantly faster than on Earth.
3. **EVA Spacesuits ($100\%\text{ O}_2$, $4.3\text{ psi}$)**: In pure oxygen, materials ignite with negligible thermal spark energy, creating immediate flash-fire risks.

## 3. NASA PSI Investigations Grounding

The project incorporates 10 authentic NASA investigation profiles:
1. **BASS-II**: Solid material flammability in low-speed forced duct airflows ($0\text{--}55\text{ cm/s}$) inside the Microgravity Science Glovebox (MSG).
2. **SAFFIRE I–III**: Large-scale spacecraft fire experiments burning $1.0\text{ m} \times 0.4\text{ m}$ fabric panels in uncrewed Cygnus cargo vehicles.
3. **ACME CFI-G**: Coflow flames in inverted and partial gravity inside the Combustion Integrated Rack (CIR).
4. **ACME BRE**: Burning Rate Emulator using porous burners to decouple solid pyrolysis from gas kinetics.
5. **FLEX / CFI**: Flame Extinguishment Experiment and discovery of invisible low-temperature cool flames.
6. **SAME / SAME-R**: Smoke Aerosol Measurement Experiment proving that space smoke agglomerates into larger soot chains, requiring specialized optical detection.
7. **ACME E-FIELD**: Electric field flame deflection and non-chemical solid-state fire suppression.
8. **DAFT / DAFT-2**: Dust and Aerosol Measurement Feasibility Test distinguishing abrasive lunar regolith from toxic wire smoke.
9. **SPICE / SLICE**: Soot inception and smoke point dynamics in microgravity co-flow flames.
10. **LUCI / FM2**: Next-generation lunar combustion and flammability mapping planned for Artemis surface operations.

## 4. Software Architecture Principles

- **Separation of Concerns**: Data stored in declarative JSON schemas; presentation styled with design tokens; behavior organized in modular ES scripts.
- **Zero-Dependency Core**: Client runs with modern Web standards (HTML5 Canvas, ES modules, CSS custom properties, Three.js WebGL).
- **Scientific Integrity**: Clear visual distinction between measured NASA experimental findings and empirical mathematical simulations.
