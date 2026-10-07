import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

const toast = ToastPrimitive.createToastManager()

function ToastProvider({
  ...props
}) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({
  ...props
}) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({
  className,
  ...props
}) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed right-[var(--toast-edge)] top-[calc(var(--app-space-4)+env(safe-area-inset-top))] z-[10010] h-(--toast-frontmost-height) w-[var(--toast-width)] max-w-[calc(100vw-var(--toast-edge)*2)] outline-none [--toast-edge:var(--app-space-4)] sm:top-[var(--app-space-6)] sm:[--toast-edge:var(--app-space-6)] print:hidden",
        className
      )}
      {...props}
    />
  )
}

function Toast({
  className,
  ...props
}) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute right-0 top-0 z-[calc(1000-var(--toast-index))] w-full origin-top rounded-[var(--app-radius-panel-standard)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] font-[family-name:var(--app-font-family)] text-[var(--app-color-text)] shadow-[var(--app-shadow-card)] will-change-transform outline-none select-none focus-visible:border-[var(--app-color-brand)] focus-visible:ring-2 focus-visible:ring-[var(--app-color-brand-border)] motion-reduce:transition-none",
        "[--gap:var(--app-space-2)] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)+var(--toast-index)*var(--gap)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+var(--toast-index)*var(--peek)+var(--shrink)*var(--height)))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(-150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className
      )}
      {...props}
    />
  )
}

function ToastContent({
  className,
  ...props
}) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-[var(--app-gap-related)] overflow-hidden p-[var(--app-space-4)] transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({
  className,
  ...props
}) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("break-words text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)]", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("whitespace-pre-line break-words text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button type="button" variant="outline" />,
  ...props
}) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("min-h-[var(--app-touch-target-min)] shrink-0 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] px-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-brand)]", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <Button type="button" variant="ghost" size="icon" />,
  ...props
}) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "size-[var(--app-touch-target-min)] shrink-0 rounded-full text-[var(--app-color-text-subtle)] hover:bg-[var(--app-color-control-hover)] hover:text-[var(--app-color-text)]",
        className
      )}
      {...props}
    >
      {children ?? (
        <i className="bi bi-x-lg" aria-hidden="true" />
      )}
    </ToastPrimitive.Close>
  )
}

const toastAppearance = {
  default: { icon: "bi-bell", color: "text-[var(--app-color-text-muted)]" },
  success: { icon: "bi-check-circle", color: "text-[var(--app-color-confirm-success)]" },
  info: { icon: "bi-info-circle", color: "text-[var(--app-color-info)]" },
  event: { icon: "bi-calendar-event", color: "text-[var(--app-color-brand)]" },
  cancelled: { icon: "bi-x-circle", color: "text-[var(--app-color-text-muted)]" },
  warning: { icon: "bi-exclamation-triangle", color: "text-[var(--app-color-warning)]" },
  error: { icon: "bi-exclamation-circle", color: "text-[var(--app-color-danger)]" },
  loading: { icon: "bi-arrow-clockwise", color: "text-[var(--app-color-brand)]" },
}

function ToastIcon({ type = "default" }) {
  const appearance = toastAppearance[type] || toastAppearance.default
  return (
    <span data-slot="toast-icon" className={cn("shrink-0 text-[length:var(--app-font-size-h3)]", appearance.color)}>
      <i
        className={cn("bi", appearance.icon, type === "loading" && "inline-block animate-spin motion-reduce:animate-none")}
        aria-hidden="true"
      />
    </span>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => (
    <Toast
      key={toastItem.id}
      toast={toastItem}
      swipeDirection={["up", "right"]}
      className="w-[var(--toast-width)] max-w-[calc(100vw-var(--toast-edge)*2)]"
      style={toastItem.data && toastItem.data.width ? { "--toast-width": toastItem.data.width } : undefined}
    >
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          {toastItem.description && (
            <ToastDescription>
              {toastItem.data && toastItem.data.descriptionParts
                ? toastItem.data.descriptionParts.map((part, index) => (
                  <span key={index}>
                    {part.label && <strong className="font-semibold">{part.label}</strong>}
                    {part.text}
                  </span>
                ))
                : undefined}
            </ToastDescription>
          )}
        </div>
        {toastItem.actionProps && (
          <ToastAction
            {...toastItem.actionProps}
            className={cn(
              toastItem.data && toastItem.data.actionTone === "success" && "border-[var(--app-color-confirm-success)] bg-transparent text-[var(--app-color-confirm-success)] hover:bg-[var(--app-color-success-surface)] hover:text-[var(--app-color-confirm-success)]",
              toastItem.actionProps.className
            )}
          />
        )}
        <ToastClose />
      </ToastContent>
    </Toast>
  ))
}

function Toaster({
  children,
  toastManager = toast,
  width = "24rem",
  ...props
}) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport style={{ "--toast-width": width }}>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}
