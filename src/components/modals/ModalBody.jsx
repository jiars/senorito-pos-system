import { ScrollArea } from "@/components/ui/scroll-area";

const ModalBody = ({
  children,
  className = "",
  viewportClassName = "",
}) => {
  return (
    <ScrollArea
      className={`min-h-0 w-full flex-1 ${className}`}
      viewportClassName={`max-h-[calc(var(--app-modal-max-height)-4.875rem)] ${viewportClassName}`}
    >
      {children}
    </ScrollArea>
  );
};

export default ModalBody;
