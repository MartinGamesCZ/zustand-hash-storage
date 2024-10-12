# zustand-hash-storage
A simple storage for zustand that uses the hash part of the URL to store the state. This is useful for sharing the state of the application with others or persisting the state between page reloads but without persisting when re-visiting page (without the hash).

## Installation
```bash
npm install zustand-hash-storage
```

or

```bash
bun add zustand-hash-storage
```

## Usage
```ts
import create from 'zustand';
import hashStorage from 'zustand-hash-storage';

interface State {
  count: number;
  increment: () => void;
}

const useStore = create<State>()(hashStorage((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 })
}), {
  encode: true, // Whether to b64 encode the state before storing it in the hash (default: true)
  debounceInterval: 300 // The interval in milliseconds to debounce the state updates (default: 300)
}))
```

## Authors
- [Martin Petr](https://github.com/MartinGamesCZ)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
