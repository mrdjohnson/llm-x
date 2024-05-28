// source: https://github.com/microsoft/TypeScript/issues/26792#issuecomment-1413209182

export function classFromProps<T>() {
  return class {
    constructor(props: T) {
      Object.assign(this, props)

      //   DO NOT CALL MAKE AUTO OBSERVABLE HERE.
    }
  } as { new (args: T): T }
}
