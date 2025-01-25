/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */

// note: this file fixes TS errors involving the LaTex ability

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      math: any
    }
  }
}
