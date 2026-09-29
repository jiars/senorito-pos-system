import { useEffect, useRef } from "react";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { comboClassName, controlClassName, errorClassName, labelClassName, optionClassName, popupClassName, stepPanelClassName, toggleClassName } from "../../shared/menuModalClasses";

const GeneralStep = ({ headingRef, baseInfo, categories, errors, onChange, imageSize }) => {
  const previewRef = useRef(null);
  const category = categories.find((item) => item.id === baseInfo.category) || null;

  useEffect(() => {
    if (!baseInfo.image) return;
    const url = URL.createObjectURL(baseInfo.image);
    if (previewRef.current) previewRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [baseInfo.image]);

  return (
    <section aria-labelledby="add-menu-general" className={stepPanelClassName}>
      <h2 id="add-menu-general" ref={headingRef} tabIndex={-1} className="sr-only">General menu information</h2>
      <div className="add-menu-general-grid">
        <Field data-invalid={Boolean(errors.image)} className="min-w-0 self-start">
        <label style={{ "--add-menu-image-size": `${imageSize}px` }} className={`add-menu-image-upload relative flex min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-[var(--app-radius-nested)] border border-dashed bg-[var(--app-color-canvas)] focus-within:outline-2 focus-within:outline-[var(--app-color-brand)] ${errors.image ? "border-[var(--app-color-danger)]" : "border-[var(--app-color-brand-border)]"}`}>
          <input type="file" accept="image/*" required aria-label="Upload menu image (required)" aria-invalid={Boolean(errors.image)} aria-describedby={errors.image ? "add-menu-image-error" : undefined} className="absolute inset-0 z-10 size-full cursor-pointer opacity-0" onChange={(event) => { const file = event.target.files?.[0]; if (file) onChange("image", file); }} />
          {baseInfo.image && <img ref={previewRef} alt="Menu item preview" className="absolute inset-0 size-full object-cover" />}
          <span className={`flex flex-col items-center gap-[var(--app-space-2)] p-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-brand)] ${baseInfo.image ? "absolute inset-x-0 bottom-0 bg-white/90" : ""}`}>
            <i aria-hidden="true" className="bi bi-image text-xl" />
            {baseInfo.image ? "Change Image" : "Upload Image *"}
          </span>
        </label>
        {errors.image && <FieldError id="add-menu-image-error" className={errorClassName}>{errors.image}</FieldError>}
        </Field>
        <div className="flex min-w-0 flex-col justify-between gap-[var(--app-gap-related)]">
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="add-menu-name" className={labelClassName}>Menu Name <span className="text-[var(--app-color-danger)]">*</span></FieldLabel>
            <Input id="add-menu-name" value={baseInfo.name} onChange={(event) => onChange("name", event.target.value)} placeholder="e.g. Blueberry Dream Frappe" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "add-menu-name-error" : undefined} className={controlClassName} />
            {errors.name && <FieldError id="add-menu-name-error" className={errorClassName}>{errors.name}</FieldError>}
          </Field>
          <Field data-invalid={Boolean(errors.category)}>
            <FieldLabel htmlFor="add-menu-category" className={labelClassName}>Category <span className="text-[var(--app-color-danger)]">*</span></FieldLabel>
            <Combobox items={categories} value={category} onValueChange={(value) => onChange("category", value?.id ?? "")} itemToStringLabel={(item) => item?.category_name || ""} itemToStringValue={(item) => String(item?.id || "")} isItemEqualToValue={(item, value) => item?.id === value?.id}>
              <ComboboxInput id="add-menu-category" placeholder="Search category" aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? "add-menu-category-error" : undefined} className={comboClassName} />
              <ComboboxContent positionerClassName="!z-[1100]" className={popupClassName}>
                <ComboboxEmpty>No category found.</ComboboxEmpty>
                <ComboboxList>{(item) => <ComboboxItem key={item.id} value={item} className={optionClassName}>{item.category_name}</ComboboxItem>}</ComboboxList>
              </ComboboxContent>
            </Combobox>
            {errors.category && <FieldError id="add-menu-category-error" className={errorClassName}>{errors.category}</FieldError>}
          </Field>
          <button type="button" role="switch" aria-checked={baseInfo.isAvailable} onClick={() => onChange("isAvailable", !baseInfo.isAvailable)} className={`${toggleClassName} !bg-transparent`}>
            <span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition-colors motion-reduce:transition-none ${baseInfo.isAvailable ? "bg-[var(--app-color-brand)]" : "bg-[var(--app-color-border-subtle)]"}`}>
              <span className={`absolute top-[3px] size-[18px] rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${baseInfo.isAvailable ? "translate-x-[23px]" : "translate-x-[3px]"}`} />
            </span>
            Available for sale
          </button>
        </div>
      </div>
    </section>
  );
};

export default GeneralStep;
