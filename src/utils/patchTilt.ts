import Tilt from "react-parallax-tilt";

/**
 * Patches react-parallax-tilt to prevent "Uncaught TypeError: Cannot read properties of null (reading 'style')" crash.
 * This crash occurs when mouse events (e.g. onLeave, onMove, onEnter) trigger while or right after a Tilt component unmounts,
 * leaving `this.wrapperEl.node` as null.
 */
const proto = (Tilt as any)?.prototype;

if (proto) {
  const originalSetTransitions = proto.setTransitions;
  proto.setTransitions = function (this: any, ...args: any[]) {
    if (!this.wrapperEl?.node) return;
    return originalSetTransitions?.apply(this, args);
  };

  const originalSetWrapperElSize = proto.setWrapperElSize;
  proto.setWrapperElSize = function (this: any, ...args: any[]) {
    if (!this.wrapperEl?.node) return;
    return originalSetWrapperElSize?.apply(this, args);
  };

  const originalOnEnter = proto.onEnter;
  proto.onEnter = function (this: any, ...args: any[]) {
    if (!this.wrapperEl?.node) return;
    return originalOnEnter?.apply(this, args);
  };

  const originalOnLeave = proto.onLeave;
  proto.onLeave = function (this: any, ...args: any[]) {
    if (!this.wrapperEl?.node) return;
    return originalOnLeave?.apply(this, args);
  };

  const originalOnMove = proto.onMove;
  proto.onMove = function (this: any, ...args: any[]) {
    if (!this.wrapperEl?.node) return;
    return originalOnMove?.apply(this, args);
  };

  const originalResetWrapperElTransform = proto.resetWrapperElTransform;
  proto.resetWrapperElTransform = function (this: any, ...args: any[]) {
    if (!this.wrapperEl?.node) return;
    return originalResetWrapperElTransform?.apply(this, args);
  };

  const originalRenderPerspective = proto.renderPerspective;
  proto.renderPerspective = function (this: any, ...args: any[]) {
    if (!this.wrapperEl?.node) return;
    return originalRenderPerspective?.apply(this, args);
  };

  const originalRenderScale = proto.renderScale;
  proto.renderScale = function (this: any, ...args: any[]) {
    if (!this.wrapperEl?.node) return;
    return originalRenderScale?.apply(this, args);
  };
}
