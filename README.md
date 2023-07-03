# Simulation of species formation in prey-predator ecosystem

### Project structure

`config.ts` contains the main config parameters
`App.tsx` is the React entrypoint of the app. It is responsible for rendering the simulation canvas.
`manager.ts` responsible for entity management and the main loop of the simulation
`genetics` implements the genetic operators: crossover, mutation as well as translation into entity attributes
`species.ts` responsible for calculating interspecies diversity as well as bisecting it using the 2-means clustering once

### How to run

```
yarn
yarn run dev
```
Use the panel in the top-right corner for basic control over the simulation.
Click on prey (blue cube) or a predator (orange cube) in order to see their status.
Use the right mouse button to hide the entity description popup.

### Other scripts

```
yarn run dev
yarn run build
yarn run preview
yarn run sandbox
```

### Resources:

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/): Three.js Renderer
- [Drei](https://github.com/pmndrs/drei): React Three Fiber Helpers
- [Three.js](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene): 3D Engine
- [Vite](https://vitejs.dev/guide/): Static Web Server
