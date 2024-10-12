import type { StateCreator } from "zustand";

interface HashStorageOptions<T> {
  encode?: boolean;
  debounceDelay?: number;
}

type HashStorage = <T>(
  storeInitializer: StateCreator<T, [], []>,
  options?: HashStorageOptions<T>
) => StateCreator<T, [], []>;

const hashStorage: HashStorage = (fn, options) => (set, get, api) => {
  const defaultedOptions = {
    encode: true,
    debounceDelay: 300,
    ...options,
  };

  const initialize = (initialState: Record<string, unknown>) => {
    try {
      const hashState = getStateFromHash();

      if (Object.keys(hashState).length === 0) {
        return initialState;
      }

      requestAnimationFrame(() => set(hashState));

      return hashState;
    } catch (e) {
      return initialState;
    }
  };

  const getStateFromHash = () => {
    const hash = window.location.hash.slice(1);

    if (!hash) {
      return {};
    }

    let decodedHash = decodeURIComponent(hash);

    if (defaultedOptions.encode)
      decodedHash = Buffer.from(decodedHash, "base64").toString("utf-8");

    return JSON.parse(decodedHash);
  };

  const setStateToHash = (state: Record<string, unknown>) => {
    let encodedState = JSON.stringify(state);

    if (defaultedOptions.encode)
      encodedState = Buffer.from(encodedState, "utf-8").toString("base64");

    encodedState = encodeURIComponent(encodedState);

    window.location.hash = encodedState;
  };

  if (typeof window !== "undefined") {
    initialize(api.getState() as Record<string, unknown>);
  }

  // @ts-ignore
  if (!api.__ZUSTAND_HASHSTORAGE_INIT__) {
    // @ts-ignore
    api.__ZUSTAND_HASHSTORAGE_INIT__ = true;

    window.addEventListener("hashchange", () => {
      const hashState = getStateFromHash();
      set(hashState);
    });

    api.subscribe((state) => {
      if (defaultedOptions.debounceDelay) {
        // @ts-ignore
        clearTimeout(api.__ZUSTAND_HASHSTORAGE_DEBOUNCE__);
        // @ts-ignore
        api.__ZUSTAND_HASHSTORAGE_DEBOUNCE__ = setTimeout(() => {
          setStateToHash(state as Record<string, unknown>);
        }, defaultedOptions.debounceDelay);
      } else {
        setStateToHash(state as Record<string, unknown>);
      }
    });

    initialize(api.getState() as Record<string, unknown>);
  }

  return fn(set, get, api);
};

export default hashStorage;
