import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const menuTabs = [
  {
    value: "menu",
    label: "Menu",
  },
  {
    value: "addons",
    label: "Add-ons",
  },
];

const MenuWorkspace = ({
  activeTab,
  onActiveTabChange,
  menuToolbar = null,
  addonsToolbar = null,
  menuContent,
  addonsContent,
}) => {
  const contentByTab = {
    menu: menuContent,
    addons: addonsContent,
  };

  const toolbarByTab = {
    menu: menuToolbar,
    addons: addonsToolbar,
  };

  const activeToolbar = toolbarByTab[activeTab];

  return (
    <Tabs
      value={activeTab}
      onValueChange={onActiveTabChange}
      className="menu-workspace min-w-0"
    >
      <div className="menu-workspace-bar">
        <div className="menu-tabs-scroll">
          <TabsList
            variant="line"
            aria-label="Menu Management sections"
            className="!h-auto min-w-max justify-start gap-[var(--app-gap-related)] p-0"
          >
            {menuTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="h-[var(--app-touch-target-min)] flex-none rounded-none px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)] after:!bottom-0 data-active:font-semibold data-active:text-[var(--app-color-brand)] data-active:after:bg-[var(--app-color-brand)] max-sm:text-[length:var(--app-font-size-caption)]"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {activeToolbar && (
          <div className="menu-workspace-toolbar">{activeToolbar}</div>
        )}
      </div>

      {menuTabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="menu-tab-content min-w-0"
        >
          {contentByTab[tab.value]}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default MenuWorkspace;
