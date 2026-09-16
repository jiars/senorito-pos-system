import senoritoLogo from "../../../assets/images/smoke.png";

const AuthBrand = () => {
  return (
    <header className="text-center">
      <img
        className="mx-auto mb-4 size-16 object-contain brightness-0"
        src={senoritoLogo}
        alt="Señorito Café"
      />

      <h1 className="m-0 text-[clamp(1.8rem,3vw,2.25rem)] font-semibold tracking-[-0.03em] text-[var(--app-color-brand)]">
        Señorito Café
      </h1>
      <p className="mt-1 text-sm text-[#77706d] sm:text-base">
        Point of Sale and Inventory System
      </p>

      <div className="mx-auto mt-7 h-0.5 w-3/4 max-w-[290px] bg-[var(--app-color-brand-soft)]"></div>
    </header>
  );
};

export default AuthBrand;
