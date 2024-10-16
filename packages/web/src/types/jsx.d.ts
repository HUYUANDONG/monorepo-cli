import { VNode } from "vue";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any; // 允许任何 JSX 元素
    }
  }
}
